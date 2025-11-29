// routes/postRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { uploadPostMedia } = require('../middleware/upload'); // ← MUST BE THIS
const {
  createPost,
  getPosts,
  likePost,
  deletePost
} = require('../controllers/postController');

router.route('/')
  .get(protect, getPosts)
  .post(protect, uploadPostMedia, createPost); // ← uploadPostMedia

router.route('/:id/like')
  .post(protect, likePost);

router.route('/:id')
  .delete(protect, deletePost);

module.exports = router;