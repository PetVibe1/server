const fs = require('fs');
const cloudinary = require('../config/cloudinary');
const path = require('path');

// Upload image to Cloudinary
const uploadImage = async (req, res) => {
  try {
    // Check if file exists
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Upload to cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'pet_store',
      use_filename: true,
    });

    // Remove file from local uploads folder
    fs.unlinkSync(req.file.path);

    // Return cloudinary url and other info
    res.status(200).json({
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
    });
  } catch (error) {
    // If there is an error, remove the uploaded file
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }

    console.error('Error uploading to Cloudinary:', error);
    res.status(500).json({ message: 'Error uploading image', error: error.message });
  }
};

// Upload multiple images to Cloudinary
const uploadMultipleImages = async (req, res) => {
  try {
    console.log('===============================================');
    console.log('uploadMultipleImages CALLED');
    console.log('Headers:', JSON.stringify(req.headers));
    console.log('Auth check bypassed for testing');
    console.log('Files received:', req.files ? req.files.length : 'none');
    console.log('===============================================');
    
    // Check if files exist
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    // Array to store upload results
    const uploadResults = [];
    
    // Check if cloudinary is properly configured
    const isCloudinaryConfigured = 
      process.env.CLOUDINARY_CLOUD_NAME && 
      process.env.CLOUDINARY_API_KEY && 
      process.env.CLOUDINARY_API_SECRET &&
      process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name';
    
    console.log('Cloudinary configured:', isCloudinaryConfigured);

    // Process each file
    for (const file of req.files) {
      try {
        console.log(`Processing file: ${file.originalname}, path: ${file.path}`);
        
        let result;
        
        if (isCloudinaryConfigured) {
          // Upload to cloudinary
          result = await cloudinary.uploader.upload(file.path, {
            folder: 'pet_store',
            use_filename: true,
          });
          console.log(`Cloudinary upload success for ${file.originalname}`);
        } else {
          // Create a mock result for development without Cloudinary
          const filename = file.filename || path.basename(file.path);
          console.log(`Using local file path for ${file.originalname} as Cloudinary is not configured`);
          result = {
            secure_url: `/uploads/${filename}`,
            public_id: `local_${Date.now()}_${filename}`,
            width: 800,
            height: 600
          };
        }
        
        // Add to results
        uploadResults.push({
          url: result.secure_url,
          public_id: result.public_id,
          width: result.width,
          height: result.height,
          originalname: file.originalname
        });
        
        // Only delete local file if using cloudinary
        if (isCloudinaryConfigured) {
          fs.unlinkSync(file.path);
        }
      } catch (fileError) {
        console.error(`Error uploading file ${file.originalname}:`, fileError);
        // Continue with next file if one fails
      }
    }

    console.log(`Successfully uploaded ${uploadResults.length} of ${req.files.length} images`);
    
    // Return results
    res.status(200).json({
      message: `Successfully uploaded ${uploadResults.length} of ${req.files.length} images`,
      images: uploadResults
    });
  } catch (error) {
    console.error('Error in uploadMultipleImages:', error);
    
    // Clean up any remaining files
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }

    console.error('Error uploading multiple images to Cloudinary:', error);
    res.status(500).json({ message: 'Error uploading images', error: error.message });
  }
};

// Delete image from Cloudinary
const deleteImage = async (req, res) => {
  try {
    const { public_id } = req.body;

    if (!public_id) {
      return res.status(400).json({ message: 'No public_id provided' });
    }

    // Delete from cloudinary
    const result = await cloudinary.uploader.destroy(public_id);

    if (result.result === 'ok') {
      res.status(200).json({ message: 'Image deleted successfully' });
    } else {
      res.status(400).json({ message: 'Error deleting image', result });
    }
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    res.status(500).json({ message: 'Error deleting image', error: error.message });
  }
};

module.exports = {
  uploadImage,
  uploadMultipleImages,
  deleteImage,
}; 