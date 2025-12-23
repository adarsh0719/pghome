// config/cloudinary.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// === EXISTING: Property images (DO NOT TOUCH) ===
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'property-rentals',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    public_id: () => `property_${Date.now()}_${Math.random().toString(36)}`
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files allowed for properties'), false);
  }
};


const postStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'posts',
    resource_type: 'auto',  // Critical for videos
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'webm', 'avi'],
    public_id: () => `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
});

// THIS WAS THE BUG — cb(null, false) without message crashes Multer
const postFileFilter = (req, file, cb) => {
  const isImage = file.mimetype.startsWith('image/');
  const isVideo = file.mimetype.startsWith('video/');

  if (isImage || isVideo) {
    cb(null, true);
  } else {
    // This message is REQUIRED
    cb(new Error('Only images and videos are allowed!'), false);
  }
};

// === NEW: KYC DOCUMENTS (OPTIMIZED) ===
const kycStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'kyc-documents',
    allowed_formats: ['jpeg', 'jpg', 'png', 'webp'], // Keep original format
    public_id: () => `kyc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
});

module.exports = {
  cloudinary,
  storage,
  fileFilter,
  postStorage,
  postFileFilter,
  kycStorage
};