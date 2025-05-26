const express = require('express');
const router = express.Router();
const {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  updatePaymentStatus,
  getRevenueData
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.post('/', createOrder);

// Protected routes - logged in users
router.get('/my', protect, (req, res) => {
  // TODO: Implement getting user's orders
});

// Admin routes
router.get('/', protect, admin, getAllOrders);
router.get('/revenue', protect, admin, getRevenueData);
router.get('/:id', protect, admin, getOrderById);
router.put('/:id/status', protect, admin, updateOrderStatus);
router.put('/:id/payment', protect, admin, updatePaymentStatus);

module.exports = router; 