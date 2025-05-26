const express = require('express');
const router = express.Router();
const {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getAppointmentsByDateRange
} = require('../controllers/appointmentController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.post('/', createAppointment);

// Protected routes - logged in users
router.get('/my', protect, (req, res) => {
  // TODO: Implement getting user's appointments
});

// Admin routes
router.get('/', protect, admin, getAllAppointments);
router.get('/range', protect, admin, getAppointmentsByDateRange);
router.get('/:id', protect, admin, getAppointmentById);
router.put('/:id', protect, admin, updateAppointment);
router.delete('/:id', protect, admin, deleteAppointment);

module.exports = router; 