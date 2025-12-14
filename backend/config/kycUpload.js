const multer = require('multer');
const { kycStorage, fileFilter } = require('./cloudinary');

const upload = multer({
  storage: kycStorage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
});

module.exports = upload;
