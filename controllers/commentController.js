const Comment = require('../models/Comment');
const mongoose = require('mongoose');

// Get all comments for a specific pet
exports.getCommentsByPetId = async (req, res) => {
  try {
    const petId = req.params.petId;
    
    // Validate petId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(petId)) {
      return res.status(400).json({ message: 'Invalid pet ID format' });
    }

    const comments = await Comment.find({ petId })
      .sort({ createdAt: -1 });
    
    res.status(200).json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Server error when fetching comments', error: error.message });
  }
};

// Create a new comment - requires authentication
exports.addComment = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required to add comments' });
    }
    
    const petId = req.params.petId;
    
    // Validate petId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(petId)) {
      return res.status(400).json({ message: 'Invalid pet ID format' });
    }
    
    const { name, content, rating } = req.body;
    
    // Simple validation
    if (!name || !content) {
      return res.status(400).json({ message: 'Name and content are required' });
    }
    
    const newComment = new Comment({
      petId,
      name,
      content,
      rating: rating || 5,
      userId: req.user._id // Associate comment with user
    });
    
    const savedComment = await newComment.save();
    
    // Emit event to all clients viewing this pet - safely
    try {
      if (req.io) {
        const roomName = `pet_${petId}`;
        req.io.to(roomName).emit('new_comment', savedComment);
        console.log(`Emitted new_comment event to room ${roomName}`);
      } else {
        console.warn('Socket.IO instance not available in request');
      }
    } catch (socketError) {
      console.error('Error emitting socket event:', socketError);
      // Continue processing - don't let socket errors fail the request
    }
    
    res.status(201).json(savedComment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Server error when adding comment', error: error.message });
  }
};

// Add admin reply to a comment - admin only
exports.addReply = async (req, res) => {
  try {
    // Check if user is authenticated and is an admin
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can reply to comments' });
    }
    
    const commentId = req.params.commentId;
    
    // Validate commentId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ message: 'Invalid comment ID format' });
    }
    
    const { content } = req.body;
    
    // Simple validation
    if (!content) {
      return res.status(400).json({ message: 'Reply content is required' });
    }
    
    // Find the comment
    const comment = await Comment.findById(commentId);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Create the reply
    const reply = {
      adminId: req.user._id,
      adminName: req.user.name || 'Admin',
      content
    };
    
    // Add reply to the comment
    comment.replies.push(reply);
    
    // Mark as read since admin has interacted with it
    comment.isRead = true;
    
    // Save the updated comment
    const updatedComment = await comment.save();
    
    res.status(200).json(updatedComment);
  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({ message: 'Server error when adding reply', error: error.message });
  }
};

// Get all unread comments - admin only
exports.getUnreadComments = async (req, res) => {
  try {
    // Check if user is authenticated and is an admin
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const comments = await Comment.find({ isRead: false })
      .sort({ createdAt: -1 });
    
    res.status(200).json(comments);
  } catch (error) {
    console.error('Error fetching unread comments:', error);
    res.status(500).json({ message: 'Server error when fetching unread comments', error: error.message });
  }
};

// Mark comment as read - admin only
exports.markAsRead = async (req, res) => {
  try {
    // Check if user is authenticated and is an admin
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const commentId = req.params.commentId;
    
    // Validate commentId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ message: 'Invalid comment ID format' });
    }
    
    // Find and update the comment
    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { isRead: true },
      { new: true }
    );
    
    if (!updatedComment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    res.status(200).json(updatedComment);
  } catch (error) {
    console.error('Error marking comment as read:', error);
    res.status(500).json({ message: 'Server error when marking comment as read', error: error.message });
  }
}; 