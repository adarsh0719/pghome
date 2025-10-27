const multer = require('multer');
const { storage, fileFilter } = require('../config/cloudinary');

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Middleware for multiple images
const uploadMultiple = upload.array('images', 10); // Max 10 images

// Middleware for single image
const uploadSingle = upload.single('image');

module.exports = { uploadMultiple, uploadSingle };