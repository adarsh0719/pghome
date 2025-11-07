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
    res.json({
      status: "success",
      user
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);


module.exports = router;