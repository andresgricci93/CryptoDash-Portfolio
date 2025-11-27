import { User } from "../models/user.model.js";
import { Crypto } from "../models/crypto.model.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getCurrentPrices } from '../services/cryptoPrices.service.js';
import { getLatestCryptoNews, formatNewsForPrompt } from '../services/cryptoNews.service.js';

export const addToFavorites = async (req,res) => {

    try {
        
        const { cryptoId } = req.body;
        const userId = req.userId;

        const user = await User.findById(userId);

        if (!user) {
          return res.status(404).json({success: false, message: "User not found"})
        }

        if (user.favoriteCoins.length >= 5) {
          return res.status().json({
            success: false,
            message: "Maximum 5 favorites allowed"
          })
        }

        if (user.favoriteCoins.includes(cryptoId)) {
          return res.status(400).json({success: false, message: "Crypto already in favorites"})
        }

        user.favoriteCoins.push(cryptoId);
        await user.save();

       res.status(200).json({
        success: true,
        message: `${cryptoId} added to favorites`,
        favoriteCoins: user.favoriteCoins
       });


    } catch (error) {
        res.status(500).json({
        success: false,
        message: error.message
        });
    }
}

export const removeFromFavorites = async (req,res) => {

  try {
        
        const { cryptoId } = req.body;
      
        const userId = req.userId;
        const user = await User.findById(userId);

        if (!user) {
          return res.status(404).json({success: false, message: "User not found"})
        }

   

        if (!user.favoriteCoins.includes(cryptoId)) {
          return res.status(400).json({ message: "Crypto not in favorites"})
        }

        user.favoriteCoins.pull(cryptoId);

 
        await user.save();

       res.status(200).json({
        success: true,
        message: `${cryptoId} removed from favorites`,
        favoriteCoins: user.favoriteCoins
       });


    } catch (error) {
        res.status(500).json({
        success: false,
        message: error.message
        });
    }
}

export const getFavoritesCoins = async (req,res) => {

  try {
   const userId = req.userId;

   const user = await User.findById(userId);
   if (!user) {
   return res.status(404).json({success:false, message: "User not found"});
   }

   const favoriteIds = user.favoriteCoins;
   const allCryptos = await Crypto.find({});


   const favoriteCryptos = allCryptos.filter(crypto => favoriteIds.includes(crypto.coinId));
   res.json({success: true, data:favoriteCryptos});

  } catch (error) {
   res.status(500).json({ success: false, message: error.message });
  }

}

export const getFavoriteIds = async (req,res) => {
   try {
        const userId = req.userId;
        const user = await User.findById(userId);

        if (!user) {
          return res.status(404).json({success: false, message: "User not found"})
        }
        
        const validFavorites = user.favoriteCoins.filter(id => 
          id !== null && 
          id !== undefined && 
          id !== '' && 
          typeof id === 'string'
        ); 


      res.status(200).json({
        success: true,
        favoriteCoins: validFavorites
      });


    } catch (error) {
       res.status(500).json({
            success: false,
            message: error.message
        });
   }
};


export const getFavoriteDetails = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({success: false, message: "User not found"});
    }
    
    const favoriteIds = user.favoriteCoins;
    const allCryptos = await Crypto.find({});
    const favoriteCryptos = allCryptos.filter(crypto => 
      favoriteIds.includes(crypto.coinId)
    );
    
    res.json({ success: true, data: favoriteCryptos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export const generateProsAndCons = async (req, res) => {
  const userId = req.userId;

  try {
    const user = await User.findById(userId);
    
    if (!user || !user.favoriteCoins.length) {
      return res.status(400).json({
        success: false,
        message: "No favorite coins found"
      });
    }

    const cryptos = user.favoriteCoins;
    const prompt = `Analyze at least 3 pros and cons of these cryptocurrencies: ${cryptos.join(', ')}. 
                  Provide specific advantages and disadvantages for each coin.
                  
                  FORMAT RULES:
                  - Use Bold Title: for section headers (no bullet before them)
                  - Use - bullets only for list items under each section
                  - Use bold for key terms
                  
                  Example structure:
                  Bitcoin (BTC):
                  Pros:
                  - First bullet point
                  - Second bullet point
                  Cons:
                  - First bullet point`;

    // Headers for streaming
    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    const googleai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const gemini = googleai.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    
    const result = await gemini.generateContentStream(prompt);
    
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      res.write(chunkText);
    }
    
    res.end();

  } catch (error) {
    console.error('Pros & Cons streaming error:', error);
    res.write("Error generating analysis...");
    res.end();
  }
};

export const generateFacts = async (req, res) => {
  const userId = req.userId;

  try {
    const user = await User.findById(userId);
    
    if (!user || !user.favoriteCoins.length) {
      return res.status(400).json({
        success: false,
        message: "No favorite coins found"
      });
    }

    const cryptos = user.favoriteCoins;
    const prompt = `Create a collection of fascinating facts and curiosities about: ${cryptos.join(', ')}.

        For each cryptocurrency, provide:
        - 2-3 historical facts or origin stories
        - Unique technical innovations or features
        - Surprising market statistics or milestones
        - Lesser-known trivia that would surprise crypto enthusiasts

        FORMAT RULES:
        - Use Bold Title: for section headers (no bullet before them)
        - Use - bullets only for list items under each section
        - Use bold for emphasis on key terms
        
        Make it educational but entertaining to read.`;

    // Headers for streaming
    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    const googleai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const gemini = googleai.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    
    const result = await gemini.generateContentStream(prompt);
    
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      res.write(chunkText);
    }
    
    res.end();

  } catch (error) {
    console.error('Facts streaming error:', error);
    res.write("Error generating facts...");
    res.end();
  }
};

export const generateAIReport = async (req, res) => {
  const userId = req.userId;
  const { allocations, strategy, riskProfile, currency, totalAmount } = req.body;

  try {
    // Validate input
    if (!allocations || allocations.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No portfolio allocations provided"
      });
    }

    const cryptoIds = allocations.map(a => a.cryptoId); 
      const [prices, news] = await Promise.all([
        getCurrentPrices(cryptoIds),
        getLatestCryptoNews(10)
      ]);

      const pricesContext = JSON.stringify(prices, null, 2);
      const newsContext = formatNewsForPrompt(news);

      // Format allocations for the prompt
      const portfolioDescription = allocations.map(a => 
        `${a.cryptoSymbol.toUpperCase()}: ${a.amount} ${currency} (${a.cryptoAmount} ${a.cryptoSymbol.toUpperCase()})`
      ).join(', ');

      const prompt = `
      REAL-TIME MARKET DATA:
      ${pricesContext}
      
      RECENT MARKET NEWS (Last 24-48h):
      ${newsContext}
    
      PORTFOLIO DATA:
      ${portfolioDescription}
      Total Investment: ${totalAmount} ${currency}
    
      INVESTOR PARAMETERS:
      Investment Strategy: ${strategy}
      Risk Profile: ${riskProfile}
    
      Generate technical investment analysis:
    
      1. PORTFOLIO ANALYSIS
      - Diversification metrics and balance assessment
      - Risk exposure quantification for ${riskProfile} profile
      - Asset correlation coefficients
      - Current price deviation from portfolio entry points
    
      2. STRATEGIC RECOMMENDATIONS
      - Allocation adjustments aligned with ${riskProfile}
      - Rebalancing thresholds and triggers
      - Entry/exit points with technical rationale
      - News-driven tactical considerations
    
      3. RISK ASSESSMENT
      - Individual asset risk factors based on current volatility
      - Aggregate portfolio risk score (1-10)
      - News sentiment impact analysis
      - Risk mitigation protocols
    
      4. MARKET OUTLOOK
      - 6-month price trajectory estimates per asset
      - Current market conditions affecting portfolio
      - News-correlated opportunities and threats
    
      5. ACTION ITEMS
      - Immediate optimization steps
      - 3-6 month tactical adjustments
      - Long-term strategic considerations
    
      FORMATTING:
      - Use ## for main sections, ### for subsections
      - Use - bullets ONLY for list items, not headers
      - Technical, concise language
      - Reference specific prices and news data when relevant
    `;

    // Headers for streaming
    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    const googleai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const gemini = googleai.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    
    const result = await gemini.generateContentStream(prompt);
    
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      res.write(chunkText);
    }
    
    res.end();

  } catch (error) {
    console.error('AI Report streaming error:', error);
    res.write("Error generating report...");
    res.end();
  }
};