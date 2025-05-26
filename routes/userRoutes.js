const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile
} = require('../controllers/authController');
const {
  getAllUsers,
  getUserById,
  getCurrentUserInfo,
  updateUser,
  updateCurrentUser,
  deleteUser
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.get('/profile', protect, getCurrentUserInfo);
router.put('/profile', protect, updateCurrentUser);

// Admin routes
router.get('/', protect, admin, getAllUsers);
router.get('/:id', protect, admin, getUserById);
router.put('/:id', protect, admin, updateUser);
router.delete('/:id', protect, admin, deleteUser);

module.exports = router; 