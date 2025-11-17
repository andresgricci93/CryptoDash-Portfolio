import { GoogleGenerativeAI } from "@google/generative-ai";
import {detectCryptoMentions, getCurrentPrices} from "../../backend/services/cryptoPrices.service.js"
import { getLatestCryptoNews, formatNewsForPrompt } from '../services/cryptoNews.service.js';
import dotenv from 'dotenv';
dotenv.config();


const googleai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);



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

    const { searchRelevantNotes, buildContextForGemini } = await import('../services/rag.service.js');

    const relevantNotes = await searchRelevantNotes(message, userId, limit);
   
    let priceData = '';
    const detectedCryptos = detectCryptoMentions(message);
    
    if (detectedCryptos.length > 0) {
      const prices = await getCurrentPrices(detectedCryptos);
      
      if (prices) {
        priceData = Object.entries(prices).map(([crypto, data]) => 
          `${crypto.toUpperCase()}: $${data.usd.toLocaleString()} (24h: ${data.usd_24h_change?.toFixed(2)}%)`
        ).join(' | ');

      }
    }

    // Fetch latest crypto news
    const newsItems = await getLatestCryptoNews(3);
    const newsData = formatNewsForPrompt(newsItems);

    const prompt = buildContextForGemini(relevantNotes, message, priceData, newsData);

    const model = googleai.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    const result = await model.generateContentStream(prompt);

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': req.headers.origin || 'http://localhost:5173',
      'Access-Control-Allow-Credentials': 'true'
    });
    
    res.write(`data: ${JSON.stringify({ 
      type: 'metadata',
      notesUsed: relevantNotes.length,
      noteTitles: relevantNotes.map(note => ({
        title: note.title,
        similarity: `${(note.similarity * 100).toFixed(0)}%`
      }))
    })}\n\n`);

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      res.write(`data: ${JSON.stringify({ type: 'text', text: chunkText })}\n\n`);
    }

    res.write(`data: [DONE]\n\n`);
    res.end();

  } catch (error) {
    console.error('Error in chat:', error);
    
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: 'Error generating chat response',
        error: error.message
      });
    }
    
    res.write(`data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`);
    res.end();
  }
};