const express = require('express');
const router = express.Router();
const { 
  getAllPets, 
  getPetById, 
  createPet, 
  updatePet, 
  deletePet,
  getFeaturedPets,
  getPetsBySpecies,
  getDistinctSpecies,
  getSimilarPets
} = require('../controllers/petController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes - anyone can view pets
// Thứ tự routes quan trọng, đặt routes cụ thể trước routes chung
router.get('/featured', getFeaturedPets);  // route cụ thể
router.get('/species/:species', getPetsBySpecies);  // route cụ thể
router.get('/species', getDistinctSpecies);  // route to get all distinct species
router.get('/:id/similar', getSimilarPets);  // route for similar pets
router.get('/', getAllPets);  // route chung
router.get('/:id', getPetById);  // route chung với parameter (đặt sau các routes cụ thể)

// Protected routes - only logged in users with admin privileges can modify pets
router.post('/', protect, admin, createPet);
router.put('/:id', protect, admin, updatePet);
router.delete('/:id', protect, admin, deletePet);

module.exports = router; 