import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import { detectCryptoMentions, getCurrentPrices } from "../services/cryptoPrices.service.js";
import { getLatestCryptoNews, formatNewsForPrompt } from "../services/cryptoNews.service.js";
import { shouldOmitNotesRAG, getMarketSnapshotSections } from "../services/chatIntent.service.js";
import { addMessage, getTodayHistory } from "../services/memory.service.js";
import { formatGeminiChatErrorPayload, httpStatusFromGeminiPayload } from "../utils/geminiError.util.js";
import dotenv from 'dotenv';
dotenv.config();

const googleai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

const GROQ_MODEL = 'llama-3.1-8b-instant';
const GROQ_MAX_HISTORY = 4;

// ---------------------------------------------------------------------------
// Streaming helpers — keep the SSE wire format in one place
// ---------------------------------------------------------------------------

const sseHeaders = (req) => ({
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache',
  'Connection': 'keep-alive',
  'Access-Control-Allow-Origin': req.headers.origin || 'http://localhost:5173',
  'Access-Control-Allow-Credentials': 'true'
});

const writeMetadata = (res, relevantNotes) => {
  res.write(`data: ${JSON.stringify({
    type: 'metadata',
    notesUsed: relevantNotes.length,
    noteTitles: relevantNotes.map(n => ({
      title: n.title,
      similarity: `${(n.similarity * 100).toFixed(0)}%`
    }))
  })}\n\n`);
};

/**
 * Stream Gemini response. Returns the full text or throws on failure.
 */
const streamGemini = async (prompt, res) => {
  const model = googleai.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
  const result = await model.generateContentStream(prompt);
  let full = '';
  for await (const chunk of result.stream) {
    const text = chunk.text();
    full += text;
    res.write(`data: ${JSON.stringify({ type: 'text', text })}\n\n`);
  }
  return full;
};

/**
 * Stream Groq (OpenAI-compatible) response. Returns the full text or throws.
 */
const streamGroq = async (prompt, res) => {
  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [{ role: 'user', content: prompt }],
    stream: true,
  });
  let full = '';
  for await (const chunk of completion) {
    const text = chunk.choices[0]?.delta?.content || '';
    if (text) {
      full += text;
      res.write(`data: ${JSON.stringify({ type: 'text', text })}\n\n`);
    }
  }
  return full;
};



export const generateReport = async (req, res) => {
  try {
    const { allocations, strategy, riskProfile, currency, totalAmount } = req.body;
    
    // Validate required fields
    if (!allocations || !strategy || !riskProfile || !currency || !totalAmount) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }
    
    // Prompt for Gemini AI
    const prompt = `
      Analyze this cryptocurrency portfolio and generate a detailed investment report:
      
      Portfolio Allocations:
      ${allocations.map(a => `- ${a.cryptoSymbol.toUpperCase()}: ${a.amount} ${currency} (${a.cryptoAmount} ${a.cryptoSymbol.toUpperCase()})`).join('\n')}
      
      Total Investment: ${totalAmount} ${currency}
      Investment Strategy: ${strategy}
      Risk Profile: ${riskProfile}
      
      Please provide:
      1. Portfolio analysis and diversification assessment
      2. Risk evaluation based on the selected profile
      3. Recommendations for optimization
      4. Market outlook for selected cryptocurrencies
      5. Suggested rebalancing strategies
      
      Format the response in a clear, professional manner with proper sections and bullet points.
    `;
    
    const model = googleai.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    const result = await model.generateContentStream(prompt);
    
    // Stream response
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': 'http://localhost:5173',
      'Access-Control-Allow-Credentials': 'true'
    });
    
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
    }
    
    res.write(`data: [DONE]\n\n`);
    res.end();
    
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error generating report',
      error: error.message 
    });
  }
};

/**
 * Chat with RAG-powered context from user notes
 * POST /api/ai/chat
 */

export const chat = async (req, res) => {
  try {
    const { message, limit = 5 } = req.body;
    const userId = req.userId;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message is required and must be a non-empty string'
      });
    }

    await addMessage(userId, 'user', message);

    const conversationHistory = await getTodayHistory(userId);
    const { searchRelevantNotes, buildContextForGemini } = await import('../services/rag.service.js');

    const marketOnly = shouldOmitNotesRAG(message);
    const relevantNotes = marketOnly
      ? []
      : await searchRelevantNotes(message, userId, limit);

    const snapshotSections = marketOnly
      ? getMarketSnapshotSections(message)
      : { includePrices: true, includeNews: true };

    let priceData = '';
    if (!marketOnly || snapshotSections.includePrices) {
      const detectedCryptos = detectCryptoMentions(message);
      const cryptosToFetch = detectedCryptos.length > 0 ? detectedCryptos : ['bitcoin', 'ethereum', 'solana'];
      const { data: prices, isCached: pricesCached, cachedAt: pricesCachedAt } = await getCurrentPrices(cryptosToFetch);

      if (prices) {
        const priceAge = pricesCached && pricesCachedAt
          ? ` (cached from ${Math.round((Date.now() - pricesCachedAt) / 60000)} min ago)`
          : '';
        priceData = Object.entries(prices).map(([crypto, d]) =>
          `${crypto.toUpperCase()}: $${d.usd.toLocaleString()} (24h: ${d.usd_24h_change?.toFixed(2)}%)`
        ).join(' | ') + priceAge;
      }
    }

    let newsData = '';
    if (!marketOnly || snapshotSections.includeNews) {
      const { items: newsItems, isCached, cachedAt } = await getLatestCryptoNews(3);
      const newsAge = isCached && cachedAt
        ? `\n(News cached from ${Math.round((Date.now() - cachedAt) / 60000)} min ago)`
        : '';
      newsData = formatNewsForPrompt(newsItems) + newsAge;
    }

    const historyForPrompt = marketOnly ? [] : conversationHistory;

    const prompt = buildContextForGemini(relevantNotes, message, historyForPrompt, priceData, newsData, {
      marketOnly,
      includePrices: snapshotSections.includePrices,
      includeNews: snapshotSections.includeNews
    });

    // --- Try Gemini, fallback to Groq on failure -------------------------

    let assistantResponse = '';
    let usedProvider = 'gemini';

    try {
      if (!res.headersSent) {
        res.writeHead(200, sseHeaders(req));
        writeMetadata(res, relevantNotes);
      }
      assistantResponse = await streamGemini(prompt, res);
    } catch (geminiError) {
      const geminiStatus = geminiError?.status ?? geminiError?.statusCode ?? 0;
      const isRateLimit = geminiStatus === 429 || geminiError?.message?.includes('429');

      console.error(
        `[AI] Gemini failed (status ${geminiStatus}${isRateLimit ? ' — rate-limited' : ''}):`,
        geminiError.message
      );

      if (groq) {
        console.log(`[AI] Falling back to Groq (${GROQ_MODEL})…`);
        usedProvider = 'groq';

        const trimmedHistory = conversationHistory.slice(-GROQ_MAX_HISTORY);
        const compactPrompt = buildContextForGemini(
          relevantNotes, message, trimmedHistory, priceData, newsData,
          { marketOnly, includePrices: snapshotSections.includePrices, includeNews: snapshotSections.includeNews }
        );

        try {
          if (!res.headersSent) {
            res.writeHead(200, sseHeaders(req));
            writeMetadata(res, relevantNotes);
          }
          assistantResponse = await streamGroq(compactPrompt, res);
        } catch (groqError) {
          console.error('[AI] Groq fallback also failed:', groqError.message);
          throw groqError;
        }
      } else {
        throw geminiError;
      }
    }

    await addMessage(userId, 'assistant', assistantResponse);

    if (usedProvider !== 'gemini') {
      console.log(`[AI] Response served via ${usedProvider}`);
    }

    res.write(`data: [DONE]\n\n`);
    res.end();

  } catch (error) {
    console.error('[AI] All providers failed:', error.message);
    const payload = formatGeminiChatErrorPayload(error);

    if (!res.headersSent) {
      return res.status(httpStatusFromGeminiPayload(payload)).json({
        success: false,
        ...payload
      });
    }

    res.write(`data: ${JSON.stringify({ type: 'error', ...payload })}\n\n`);
    res.end();
  }
};