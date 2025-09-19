import multer from 'multer';
import sharp from 'sharp';

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

// Middleware to process image and convert to base64
export const processImageToBase64 = async (req, res, next) => {

  if (!req.file) return next();
  
  try {
    // Optimize image with Sharp
    const processedImage = await sharp(req.file.buffer)
      .resize(200, 200, { 
        fit: 'cover', 
        position: 'center' 
      })
      .jpeg({ quality: 85 }) 
      .toBuffer();
    
    // Convert to base64 with data URL format
    const base64 = `data:image/jpeg;base64,${processedImage.toString('base64')}`;
    
    // Attach processed image to request object
    req.processedAvatar = base64;
    
    next();
  } catch (error) {
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