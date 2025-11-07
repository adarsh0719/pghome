const multer = require('multer');
const { storage, fileFilter } = require('./cloudinary');

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
});

module.exports = upload;
