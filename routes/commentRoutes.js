const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { protect, admin } = require('../middleware/authMiddleware');

// Get all comments for a specific pet (no auth required)
router.get('/:petId', commentController.getCommentsByPetId);

// Add a comment to a specific pet (auth required)
router.post('/:petId', protect, commentController.addComment);

// Admin routes - requires admin role
// Get all unread comments
router.get('/admin/unread', protect, admin, commentController.getUnreadComments);

// Mark a comment as read
router.put('/admin/:commentId/read', protect, admin, commentController.markAsRead);

// Add a reply to a comment
router.post('/admin/:commentId/reply', protect, admin, commentController.addReply);

module.exports = router; 