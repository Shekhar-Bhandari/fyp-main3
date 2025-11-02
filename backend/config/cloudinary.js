// config/cloudinary.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Log configuration status (without exposing secrets)
console.log('Cloudinary Config:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? '✓ Set' : '✗ Missing',
  api_key: process.env.CLOUDINARY_API_KEY ? '✓ Set' : '✗ Missing',
  api_secret: process.env.CLOUDINARY_API_SECRET ? '✓ Set' : '✗ Missing'
});

// Configure Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Determine resource type based on MIME type
    const isVideo = file.mimetype.startsWith('video/');
    
    return {
      folder: 'connectiva-posts',
      resource_type: isVideo ? 'video' : 'image',
      allowed_formats: isVideo 
        ? ['mp4', 'mov', 'avi', 'mkv', 'webm']
        : ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      transformation: isVideo 
        ? [{ quality: 'auto', fetch_format: 'auto' }]
        : [{ width: 1000, height: 1000, crop: 'limit', quality: 'auto' }]
    };
  }
});

// File filter to accept only images and videos
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image and video files are allowed!'), false);
  }
};

// Create multer upload instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 50MB limit
  }
});

module.exports = { upload, cloudinary };