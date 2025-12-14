const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/auth');

const router = express.Router();
const nodemailer = require("nodemailer");
const Otp = require("../models/Otp");
const { sendOTP, verifyOTP } = require("../controllers/otpController");


// FIX: Use consistent token signing
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d', // Add fallback
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id); // FIX: Use _id

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

// Register - FIX: Use consistent response format
router.post('/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('userType').isIn(['student', 'employee', 'owner']).withMessage('Valid user type is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, userType, phone, institution, company } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const newUser = await User.create({
      name,
      email,
      password,
      userType,
      phone,
      institution: userType === 'student' ? institution : undefined,
      company: userType === 'employee' ? company : undefined
    });

    // FIX: Use the same createSendToken function
    createSendToken(newUser, 201, res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login - FIX: Use consistent response format
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({ message: 'Incorrect email or password' });
    }

    // Check subscription expiry
    if (user.subscription && user.subscription.active && user.subscription.expiresAt) {
      if (new Date(user.subscription.expiresAt) < new Date()) {
        user.subscription.active = false;
        await user.save();
      }
    }

    // FIX: Use the same createSendToken function
    createSendToken(user, 200, res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Test token route
router.get('/test-token', protect, (req, res) => {
  res.json({
    success: true,
    message: 'Token is working!',
    user: {
      id: req.user._id,
      email: req.user.email,
      userType: req.user.userType
    }
  });
});

// Get logged in user details (fresh data from DB)
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    // Check subscription expiry
    if (user.subscription && user.subscription.active && user.subscription.expiresAt) {
      if (new Date(user.subscription.expiresAt) < new Date()) {
        user.subscription.active = false;
        await user.save();
      }
    }

    // Auto-generate secret code if missing (Self-healing)
    if (!user.secretCode) {
      await user.save(); // Triggers pre('save') hook
    }

    res.json({
      status: "success",
      data: {
        user
      }
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


// 1. REQUEST OTP FOR PASSWORD RESET
router.post("/request-password-reset", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "No user found with this email" });

    // Use your existing sendOTP method
    await sendOTP(req, res, true);  // pass a flag to differentiate from signup if needed

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// 2. VERIFY OTP
router.post("/verify-reset-otp", async (req, res) => {
  try {
    const result = await verifyOTP(req, res, true); // send a flag to handle reset OTPs

    if (result.success) {
      return res.json({
        success: true,
        message: "OTP verified",
      });
    }

    return res.status(400).json({ success: false, message: "Invalid OTP" });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// 3. RESET PASSWORD
router.post("/reset-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(400).json({ message: "User not found" });

    user.password = newPassword;
    await user.save();

    return res.json({
      success: true,
      message: "Password reset successful!",
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);


module.exports = router;