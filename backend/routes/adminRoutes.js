const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Property = require('../models/Property');
const Booking = require('../models/Booking');
const RoommateProfile = require('../models/RoommateProfile');
const { protect } = require('../middleware/auth');

// Middleware to check if user is admin
const adminOnly = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

// @route   GET /api/admin/users
// @desc    Get all users with their roommate profiles
// @access  Admin
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find({}).select('-password');

    // Fetch roommate profiles for these users
    const usersWithProfiles = await Promise.all(users.map(async (user) => {
      const profile = await RoommateProfile.findOne({ user: user._id });
      return {
        ...user.toObject(),
        roommateProfile: profile
      };
    }));

    res.json(usersWithProfiles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/admin/users/:id/make-admin
// @desc    Make a user admin
// @access  Admin
router.put('/users/:id/make-admin', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.isAdmin = true;
      const updatedUser = await user.save();
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/admin/properties
// @desc    Get all properties
// @access  Admin
router.get('/properties', protect, adminOnly, async (req, res) => {
  try {
    const properties = await Property.find({}).populate('owner', 'name email');
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/admin/properties/:id
// @desc    Delete a property
// @access  Admin
router.delete('/properties/:id', protect, adminOnly, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (property) {
      await property.deleteOne();
      res.json({ message: 'Property removed' });
    } else {
      res.status(404).json({ message: 'Property not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/admin/bookings
// @desc    Get all bookings
// @access  Admin
router.get('/bookings', protect, adminOnly, async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate('property', 'title location')
      .populate('owner', 'name email')
      .populate('bookedBy', 'name email');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
