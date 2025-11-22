const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Property = require('../models/Property');


const updatePropertyRating = async (propertyId) => {
  const reviews = await Review.find({ property: propertyId });

  if (reviews.length === 0) {
    await Property.findByIdAndUpdate(propertyId, {
      rating: { average: 0, count: 0 }
    });
    return;
  }

  const total = reviews.reduce((sum, r) => sum + r.rating, 0);
  const avg = total / reviews.length;

  await Property.findByIdAndUpdate(propertyId, {
    rating: { average: avg.toFixed(1), count: reviews.length }
  });
};

exports.addReview = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    // Check if user booked this property
    const booking = await Booking.findOne({
      property: propertyId,
      bookedBy: userId,
      status: 'paid'
    });

    if (!booking) {
      return res.status(403).json({ message: "You must book this property before reviewing." });
    }

    // Ensure user posted only once
    const alreadyReviewed = await Review.findOne({ property: propertyId, user: userId });
    if (alreadyReviewed) {
      return res.status(400).json({ message: "You have already reviewed this property." });
    }

    const review = await Review.create({
      property: propertyId,
      user: userId,
      rating,
      comment
    });

    //update property rating
    await updatePropertyRating(propertyId);

    res.json(review);

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getReviews = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const reviews = await Review.find({ property: propertyId })
      .populate('user', 'name');

    res.json(reviews);

  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};


exports.updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    // Check if review exists
    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });

    // Only author can edit
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    review.rating = rating !== undefined ? rating : review.rating;
    review.comment = comment !== undefined ? comment : review.comment;

    await review.save();

    // update property rating after editing
    await updatePropertyRating(review.property);

    res.json({ message: "Review updated successfully", review });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });

    // Only author can delete
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const propertyId = review.property; //  store before deleting

    await review.deleteOne();

    // update property rating after deletion
    await updatePropertyRating(propertyId);

    res.json({ message: "Review deleted successfully" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};


