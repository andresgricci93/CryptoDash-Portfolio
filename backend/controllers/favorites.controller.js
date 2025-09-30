import { User } from "../models/user.model.js";
import { Crypto } from "../models/crypto.model.js";



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