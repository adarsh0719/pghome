const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token'
      });
    }

    try {
      // Verify token - ADD DEBUGGING
      console.log('JWT Secret exists:', !!process.env.JWT_SECRET);
      console.log('Token length:', token.length);

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token decoded successfully:', decoded);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        console.log('User not found in database');
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      console.log('User authenticated:', req.user.email);
      next();
    } catch (jwtError) {
      console.error('JWT Error details:', jwtError.name, jwtError.message);

      let message = 'Not authorized, token failed';
      if (jwtError.name === 'TokenExpiredError') {
        message = 'Token expired';
      } else if (jwtError.name === 'JsonWebTokenError') {
        message = 'Invalid token';
      }

      return res.status(401).json({
        success: false,
        message
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

//Export the middleware directly 
module.exports = protect;

// for other imports using destructuring
module.exports.protect = protect;
