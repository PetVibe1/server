const express = require('express');
const router = express.Router();
const { uploadImage, deleteImage, uploadMultipleImages } = require('../controllers/uploadController');
const upload = require('../middleware/uploadMiddleware');
// Tạm thời bỏ hẳn import protect
// const { protect } = require('../middleware/authMiddleware');

// Debug middleware
router.use((req, res, next) => {
  console.log(`[UPLOAD ROUTE] ${req.method} ${req.path} - Content-Type: ${req.headers['content-type']}`);
  if (req.headers.authorization) {
    console.log(`[UPLOAD ROUTE] Has Authorization header`);
  }
  next();
});

// Bỏ hoàn toàn protect
// router.use(protect);

// Upload single image route - no authentication required for testing
router.post('/', upload.single('image'), uploadImage);

// Upload multiple images route - no authentication required for testing
router.post('/multiple', upload.array('images', 10), uploadMultipleImages); // Allow up to 10 images

// Delete image route - no authentication required for testing
router.delete('/', deleteImage);

module.exports = router; 