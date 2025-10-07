import { GoogleGenerativeAI } from "@google/generative-ai";

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