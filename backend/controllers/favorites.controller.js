import { User } from "../models/user.model.js";

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


}

export const removeFromFavorites = async (req,res) => {


}