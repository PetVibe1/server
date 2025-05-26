const Pet = require('../models/Pet');
let cloudinary;

try {
  cloudinary = require('../config/cloudinary');
} catch (error) {
  console.error('Cloudinary configuration error:', error);
  // Set a dummy cloudinary object to prevent crashes
  cloudinary = {
    uploader: {
      destroy: async () => console.log('Cloudinary not configured, skipping delete')
    }
  };
}

// Get all pets with pagination and filtering
const getAllPets = async (req, res) => {
  try {
    let { species, breed, gender, color, size, minPrice, maxPrice, limit = 10, page = 1 } = req.query;
    
    console.log('GET /pets request with query params:', req.query);
    
    // Manually handle 'mèo' case if needed
    if (species) {
      // Try to decode the species parameter
      try {
        species = decodeURIComponent(species);
      } catch (e) {
        console.error('Error decoding species:', e);
      }
      
      console.log('Decoded species filter:', species);
      
      // Special handling for 'mèo' if needed
      if (species.toLowerCase() === 'meo' || species.toLowerCase() === 'mèo') {
        species = 'Mèo';
        console.log('Applied special case for cat (Mèo)');
      } else if (species.toLowerCase() === 'cho' || species.toLowerCase() === 'chó') {
        species = 'Chó';
        console.log('Applied special case for dog (Chó)');
      }
    }
    
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = {};
    
    if (species) {
      // Use simple string equality with case-insensitive option
      filter.species = new RegExp(`^${species}$`, 'i');
      console.log('Applied species filter:', filter.species);
    }
    if (breed) filter.breed = breed;
    if (gender) filter.gender = gender;
    if (color) filter.color = color;
    if (size) filter.size = size;
    
    // Handle price range filtering
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseInt(minPrice);
      if (maxPrice) filter.price.$lte = parseInt(maxPrice);
    }
    
    console.log('MongoDB filter:', filter);
    
    const pets = await Pet.find(filter)
      .sort({ createdAt: 1 })
      .limit(parseInt(limit))
      .skip(skip);
      
    const total = await Pet.countDocuments(filter);
    
    console.log(`Found ${pets.length} pets out of ${total} total matches`);
    if (pets.length > 0) {
      console.log('Species in results:', [...new Set(pets.map(p => p.species))].join(', '));
    }
    
    res.json({
      pets,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      totalPets: total
    });
  } catch (error) {
    console.error('Error in getAllPets:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get featured pets
const getFeaturedPets = async (req, res) => {
  try {
    const { limit = 8, sort } = req.query;
    console.log('GET /pets/featured request with query params:', req.query);
    
    // Tìm tất cả thú cưng, không lọc theo available
    let query = Pet.find();
    
    // Sắp xếp theo ngày tạo tăng dần mặc định (thú cưng cũ hiển thị trước, mới nhất cuối cùng)
    query = query.sort({ createdAt: 1 });
    
    // Giới hạn số lượng kết quả
    query = query.limit(parseInt(limit));
      
    const pets = await query;
    console.log(`Returning ${pets.length} featured pets, sorted by creation date`);
    
    res.json(pets);
  } catch (error) {
    console.error('Error in getFeaturedPets:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get pets by species
const getPetsBySpecies = async (req, res) => {
  try {
    let { species } = req.params;
    
    console.log(`GET /pets/species/${species} request`);
    
    // Try to decode the species parameter
    try {
      species = decodeURIComponent(species);
    } catch (e) {
      console.error('Error decoding species parameter:', e);
    }
    
    console.log('Decoded species parameter:', species);
    
    // Normalize species
    const lowerSpecies = species.toLowerCase();
    if (lowerSpecies === 'mèo' || lowerSpecies === 'meo') {
      species = 'Mèo';
      console.log('Normalized species to Mèo');
    } else if (lowerSpecies === 'chó' || lowerSpecies === 'cho') {
      species = 'Chó';
      console.log('Normalized species to Chó');
    }
    
    // Use simple regex for species matching and sort by createdAt ascending (old first, new last)
    const pets = await Pet.find({ 
      species: new RegExp(`^${species}$`, 'i')
    })
    .sort({ createdAt: 1 }); // Sort by creation date ascending
    
    console.log(`Found ${pets.length} pets for species "${species}"`);
    if (pets.length > 0) {
      console.log('Species in results:', [...new Set(pets.map(p => p.species))].join(', '));
      console.log('First pet data example:', JSON.stringify(pets[0], null, 2));
    } else {
      console.log('No pets found for this species');
    }
    
    res.json(pets);
  } catch (error) {
    console.error('Error in getPetsBySpecies:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get a single pet
const getPetById = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }
    res.json(pet);
  } catch (error) {
    console.error('Error in getPetById:', error);
    res.status(500).json({ message: error.message });
  }
};

// Create a new pet
const createPet = async (req, res) => {
  try {
    const pet = new Pet(req.body);
    const savedPet = await pet.save();
    res.status(201).json(savedPet);
  } catch (error) {
    console.error('Error in createPet:', error);
    res.status(400).json({ message: error.message });
  }
};

// Update a pet
const updatePet = async (req, res) => {
  try {
    const pet = await Pet.findByIdAndUpdate(
      req.params.id, 
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }
    
    res.json(pet);
  } catch (error) {
    console.error('Error in updatePet:', error);
    res.status(400).json({ message: error.message });
  }
};

// Delete a pet
const deletePet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }
    
    // Delete image from cloudinary if exists
    if (pet.image && pet.image.public_id && cloudinary) {
      try {
        await cloudinary.uploader.destroy(pet.image.public_id);
      } catch (cloudinaryError) {
        console.error('Error deleting image from Cloudinary:', cloudinaryError);
        // Continue with deletion even if Cloudinary fails
      }
    }
    
    await Pet.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Pet deleted successfully' });
  } catch (error) {
    console.error('Error in deletePet:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get distinct species
const getDistinctSpecies = async (req, res) => {
  try {
    console.log('GET /pets/species request - fetching distinct species');
    
    // Get distinct species
    const species = await Pet.distinct('species');
    
    // Ensure standard capitalization for special cases
    const normalizedSpecies = species.map(s => {
      // Handle special cases for Vietnamese characters
      const lowerS = s.toLowerCase();
      if (lowerS === 'mèo' || lowerS === 'meo') {
        return 'Mèo';
      } else if (lowerS === 'chó' || lowerS === 'cho') {
        return 'Chó';
      }
      return s;
    });
    
    // Remove duplicates that might have been caused by case differences
    const uniqueSpecies = [...new Set(normalizedSpecies)];
    
    // Sort the species alphabetically for consistent display
    const sortedSpecies = uniqueSpecies.sort();
    
    console.log('Found distinct species (normalized):', sortedSpecies);
    
    res.json(sortedSpecies);
  } catch (error) {
    console.error('Error in getDistinctSpecies:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get similar pets based on species, breed or other features
const getSimilarPets = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 4 } = req.query;
    
    console.log(`GET /pets/${id}/similar request`);
    
    // Find the original pet
    const originalPet = await Pet.findById(id);
    
    if (!originalPet) {
      return res.status(404).json({ message: 'Pet not found' });
    }
    
    // Build filter to find similar pets
    const filter = {
      _id: { $ne: id }, // Exclude the original pet
      species: originalPet.species // Match the same species
    };
    
    // If breed is available, prefer matching breed too
    if (originalPet.breed) {
      // First try to find pets with same breed
      const sameBreedPets = await Pet.find({
        ...filter,
        breed: originalPet.breed
      }).limit(parseInt(limit));
      
      // If we found enough same-breed pets, return them
      if (sameBreedPets.length >= parseInt(limit)) {
        console.log(`Found ${sameBreedPets.length} pets with same breed (${originalPet.breed})`);
        return res.json(sameBreedPets);
      }
      
      // If not enough same-breed pets, find additional pets of same species
      const remainingLimit = parseInt(limit) - sameBreedPets.length;
      const additionalPets = await Pet.find({
        _id: { $ne: id },
        species: originalPet.species,
        breed: { $ne: originalPet.breed }
      }).limit(remainingLimit);
      
      const combinedPets = [...sameBreedPets, ...additionalPets];
      console.log(`Returning ${combinedPets.length} similar pets (${sameBreedPets.length} same breed, ${additionalPets.length} same species)`);
      return res.json(combinedPets);
    }
    
    // If no breed specified, just find pets with same species
    const similarPets = await Pet.find(filter).limit(parseInt(limit));
    console.log(`Found ${similarPets.length} pets with same species (${originalPet.species})`);
    res.json(similarPets);
  } catch (error) {
    console.error('Error in getSimilarPets:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllPets,
  getPetById,
  createPet,
  updatePet,
  deletePet,
  getFeaturedPets,
  getPetsBySpecies,
  getDistinctSpecies,
  getSimilarPets
}; 