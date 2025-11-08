import multer from 'multer';
import { Jimp } from 'jimp';

// Store files in memory (not on disk)
const storage = multer.memoryStorage();

// File validation - only images allowed
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// Main multer configuration
export const uploadAvatar = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB maximum
  },
}).single('avatar'); 

// Middleware to process image and convert to base64 with JIMP
export const processImageToBase64 = async (req, res, next) => {
  if (!req.file) return next();
  
  try {
    // Read image from buffer
    const image = await Jimp.read(req.file.buffer);
    
    // Resize to 200x200 and cover (crop to fit)
    image.cover({ w: 200, h: 200 });
    
    // Convert to base64 (JPEG format automatically compresses)
    const base64 = await image.getBase64('image/jpeg');
    
    // Attach processed image to request object
    req.processedAvatar = base64;
    
    next();
  } catch (error) {
    console.error('Image processing error:', error);
    next(new Error(`Image processing failed: ${error.message}`));
  }
};

// Error handling middleware for multer
export const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB'
      });
    }
  }
  
  next(error);
};