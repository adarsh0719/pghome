const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//  Generate JWT - include isAdmin for frontend/admin routing
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, isAdmin: user.isAdmin },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// @desc    Register a new user
exports.register = async (req, res) => {
  const { name, email, password, userType, phone, dateOfBirth, institution, idProofUrl, isBlueTick, preferences } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    if (!name || !email || !password || !userType || !phone) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    user = new User({
      name,
      email,
      password,
      userType,
      phone,
      dateOfBirth,
      institution: userType === 'student' ? institution : undefined,
      company: userType === 'employee' ? { name: institution?.name } : undefined,
      isBlueTick: userType === 'employee' ? isBlueTick : false,
      preferences: userType === 'student' ? preferences : undefined
    });

    await user.save();

    // Token includes isAdmin
    const token = generateToken(user);

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          userType: user.userType,
          phone: user.phone,
          isAdmin: user.isAdmin // optional, for frontend convenience
        }
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// @desc    Login user
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) return res.status(400).json({ message: 'Please provide email and password' });

    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.correctPassword(password, user.password))) {
      // Token now includes isAdmin
      const token = generateToken(user);

      res.json({
        status: 'success',
        token,
        data: {
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            userType: user.userType,
            phone: user.phone,
            isAdmin: user.isAdmin // frontend can now detect admin
          }
        }
      });
    } else {
      res.status(400).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};
