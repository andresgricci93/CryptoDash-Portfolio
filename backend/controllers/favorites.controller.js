import { User } from "../models/user.model.js";
import fs from "fs";
import path from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const cryptoMockPath = path.join(__dirname, '../data/cryptomock.json');
const cryptoMockData = JSON.parse(fs.readFileSync(cryptoMockPath, 'utf8'));


export const addToFavorites = async (req,res) => {

    try {
        
        const { cryptoId } = req.body;
        const userId = req.userId;

        const user = await User.findById(userId);

        if (!user) {
          return res.status(404).json({success: false, message: "User not found"})
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


export const getAllFavorites = async (req,res) => {

     try {


        const userId = req.userId;

        const user = await User.findById(userId);

        if (!user) {
          return res.status(404).json({success: false, message: "User not found"})
        }
       

      res.status(200).json({
        success: true,
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

export const getFavoritesSelected = async (req, res) => {
  try {
    const userId = req.userId; // From middleware, verifyToken
    
    const user = await User.findById(userId);
    console.log("favorites coins:", user.favoriteCoins);
    const coinsString = user.favoriteCoins.join(",");

    const coingeckoUrl = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinsString}`;
    
    try {

      const response = await fetch(coingeckoUrl);
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }
      const coingeckoData = await response.json();
      
      res.status(200).json({
        success: true,
        data: coingeckoData,
        source: "coingecko"
      });
      
    } catch (coingeckoError) {

      console.log("CoinGecko failed to fetch, using mock...");
      const mockData = JSON.parse(fs.readFileSync('./backend/data/cryptomock.json', 'utf8'));
      
      const filteredMock = mockData.filter(crypto => {
        return user.favoriteCoins.includes(crypto.id);
      });
      
      res.status(200).json({
        success: true,
        data: filteredMock,
        source: "mock" 
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

export const getFavoritesWithData = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({success: false, message: "User not found"})
    }

    const favoriteCryptos = cryptoMockData.filter(crypto => 
      user.favoriteCoins.includes(crypto.id)
    );

    res.status(200).json({
      success: true,
      data: favoriteCryptos
    });
  } catch (error) {
    res.status(500).json({success: false, message: error.message});
  }
}
