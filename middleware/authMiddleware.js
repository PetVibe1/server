const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
const protect = async (req, res, next) => {
  console.log('Authorization header:', req.headers.authorization ? 'Present' : 'Missing');

  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      console.log('Token extracted successfully');

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      console.log('Token verified, user ID:', decoded.id);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        console.error('User not found for valid token');
        return res.status(404).json({ message: 'User not found' });
      }

      console.log('User authenticated:', req.user.email, 'Role:', req.user.role);
      next();
    } catch (error) {
      console.error('Authentication error:', error.message);
      res.status(401).json({ message: 'Not authorized, token failed', error: error.message });
    }
  } else {
    console.error('No authorization header or Bearer token provided');
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Admin middleware
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

module.exports = { protect, admin }; 