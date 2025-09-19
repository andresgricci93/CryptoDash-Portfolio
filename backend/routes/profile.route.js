import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { uploadAvatar, processImageToBase64,  } from '../middleware/uploadAvatar.js';
import { updateProfile,uploadAvatarController } from '../controllers/profile.controller.js';

const router = express.Router();

// Update profile route with middleware chain
// router.put('/update-profile', 
//   verifyToken,              
//   updateProfile          
// );
router.post('/update-profile', verifyToken, updateProfile); 
router.post('/upload-avatar', verifyToken, uploadAvatar, processImageToBase64, uploadAvatarController);

export default router;