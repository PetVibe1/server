const express = require('express');
const router = express.Router();

// Basic category routes (placeholder for now)
router.get('/', (req, res) => {
  res.json({ message: 'Category routes are working', categories: [] });
});

module.exports = router; 