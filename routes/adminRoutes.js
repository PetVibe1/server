const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
} = require('../controllers/userController');
const { getDashboardStats } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

// All routes are protected and require admin privileges
router.use(protect, admin);

// Dashboard stats
router.get('/stats', getDashboardStats);

// User management routes
router.route('/users')
  .get(getAllUsers);

router.route('/users/:id')
  .get(getUserById)
  .put(updateUser)
  .delete(deleteUser);

module.exports = router; 