// controllers/userController.js
const User = require('../models/User');

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user.id, req.body, {
      new: true,
      runValidators: true
    }).select('-password');

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Upload KYC documents
// @route   PUT /api/users/kyc
// @access  Private
exports.uploadKYC = async (req, res) => {
  const { kycDocuments } = req.body;

  try {
    const user = await User.findById(req.user.id).select('-password');

    user.kycDocuments = kycDocuments;
    user.kycStatus = 'pending'; // reset status to pending when new documents are uploaded

    await user.save();

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};