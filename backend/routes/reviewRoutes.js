const express = require('express');
const router = express.Router();
const { addReview, getReviews, updateReview, deleteReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.get('/:propertyId', getReviews);
router.post('/:propertyId', protect, addReview);

router.put('/edit/:reviewId', protect, updateReview);

//  NEW — DELETE review
router.delete('/delete/:reviewId', protect, deleteReview);

module.exports = router;
