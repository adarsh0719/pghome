// middleware/upload.js
const multer = require('multer');
const {
  storage,
  fileFilter,
  postStorage,
  postFileFilter
} = require('../config/cloudinary');

// Property uploads (existing)
const propertyMulter = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

const uploadMultiple = propertyMulter.array('images', 10);
const uploadSingle = propertyMulter.single('image');

// Posts uploads (images + videos)
const postMulter = multer({
  storage: postStorage,
  fileFilter: postFileFilter,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB for videos
});

const uploadPostMedia = postMulter.array('media', 10);

module.exports = {
  uploadMultiple,
  uploadSingle,
  uploadPostMedia  // ← This is the correct one for posts
};