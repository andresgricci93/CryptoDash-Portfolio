import { User } from '../models/user.model.js';

export const updateProfile = async (req, res) => {


        try {
        const { cryptoId } = req.body;
        const userId = req.userId;

        const user = await User.findById(userId);

        if (req.body.name) user.name = req.body.name;
        if (req.body.email) user.email = req.body.email;

        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                ...user._doc,
                password: undefined
            }
        });
        
    } catch (error) {
        console.error('ERROR in updateProfile:', error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const uploadAvatarController = async (req, res) => {
    try {
        const userId = req.userId;
        
        if (!req.processedAvatar) {
            return res.status(400).json({
                success: false,
                message: 'No image processed'
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.avatar = req.processedAvatar;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Avatar uploaded successfully',
            user: {
                ...user._doc,
                password: undefined
            }
        });

    } catch (error) {
        console.error('Error uploading avatar:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};