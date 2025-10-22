import { User } from "../models/user.model.js";
import { Crypto } from "../models/crypto.model.js";
import { GoogleGenerativeAI } from "@google/generative-ai";


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
                  Format your response as plain text without markdown formatting (no ** or other symbols).
                  Use simple text structure with clear headings and bullet points using - instead of *.`;

    // Headers for streaming
    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    const googleai = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
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

    Write in plain text format without asterisks or special formatting.
    Make it educational but entertaining to read.`;

    // Headers for streaming
    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    const googleai = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
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

    // Format allocations for the prompt
    const portfolioDescription = allocations.map(a => 
      `${a.cryptoSymbol.toUpperCase()}: ${a.amount} ${currency} (${a.cryptoAmount} ${a.cryptoSymbol.toUpperCase()})`
    ).join(', ');

    const prompt = `
      CryptoAI analyzed your responses and generated the following investment analysis:

      PORTFOLIO DATA:
      ${portfolioDescription}
      Total Investment: ${totalAmount} ${currency}

      INVESTOR PARAMETERS:
      Investment Strategy: ${strategy}
      Risk Profile: ${riskProfile}

      Provide a technical analysis structured as follows:

      1. PORTFOLIO ANALYSIS
      Overall balance and diversification metrics
      Risk exposure quantification for ${riskProfile} profile
      Asset correlation coefficients

      2. STRATEGIC RECOMMENDATIONS
      Allocation adjustments for ${riskProfile} alignment
      Rebalancing thresholds and triggers
      Entry/exit points with supporting rationale

      3. RISK ASSESSMENT
      Individual asset risk factors
      Aggregate portfolio risk score (1-10 scale)
      Risk mitigation protocols

      4. MARKET OUTLOOK
      6-month price trajectory estimates per asset
      Market conditions affecting portfolio performance
      Identified opportunities and threat vectors

      5. ACTION ITEMS
      Immediate optimization steps
      3-6 month tactical adjustments
      Long-term strategic considerations

      FORMATTING REQUIREMENTS:
      - Use plain text only
      - No asterisks or markdown symbols
      - Use dashes (-) for bullet points
      - Keep sentences concise and technical
      - Avoid conversational phrases
      - Do not start with "As a professional advisor" or similar

    `

    // Headers for streaming
    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    const googleai = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
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