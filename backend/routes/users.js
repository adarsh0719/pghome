const express = require('express');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Get user profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user profile
router.put('/profile', protect, [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, phone, preferences } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(preferences && { preferences })
      },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload KYC documents
router.post('/kyc', protect, [
  body('idProof').notEmpty().withMessage('ID proof is required'),
  body('addressProof').notEmpty().withMessage('Address proof is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { idProof, addressProof, verificationPhoto } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        kycDocuments: {
          idProof,
          addressProof,
          ...(verificationPhoto && { verificationPhoto })
        },
        kycStatus: 'pending'
      },
      { new: true }
    ).select('-password');

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all users (admin only)
router.get('/', protect, async (req, res) => {
  try {
    if (req.user.userType !== 'admin') {
      return res.status(403).json({ message: 'Only admins can access this endpoint' });
    }

    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user KYC status (admin only)
router.put('/:id/kyc-status', protect, [
  body('status').isIn(['pending', 'verified', 'rejected']).withMessage('Invalid KYC status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (req.user.userType !== 'admin') {
      return res.status(403).json({ message: 'Only admins can update KYC status' });
    }

    const { status } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { kycStatus: status },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// routes/users.js
router.post('/update-subscription', protect, async (req, res) => {
  const { email, plan } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.subscription.active = true;
    user.subscription.plan = plan;
    user.subscription.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    user.isBlueTick = true;

    await user.save();
    res.json({ message: 'Subscription updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


// routes/userRoutes.js
router.get("/full-details/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("kycId");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



const userController = require('../controllers/userController');

const { uploadMultiple } = require('../middleware/upload');

// Update broker listing
router.put('/broker-listing', protect, uploadMultiple, userController.updateBrokerListing);

// Delete broker listing
router.delete('/broker-listing', protect, userController.deleteBrokerListing);

// Get broker listing
router.get('/broker-listing', protect, userController.getBrokerListing);

// Get broker listing by UserId
router.get('/broker-listing/:userId', protect, userController.getBrokerListingByUserId);

module.exports = router;