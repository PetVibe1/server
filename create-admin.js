const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('./models/User');

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pet_store');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Admin user data
const adminData = {
  firstName: 'Admin',
  lastName: 'User',
  email: 'admin@monito.com',
  password: 'admin123',
  role: 'admin'
};

// Create admin user
const createAdminUser = async () => {
  try {
    await connectDB();
    
    // Check if user already exists
    const userExists = await User.findOne({ email: adminData.email });
    
    if (userExists) {
      console.log('Admin user already exists');
      if (userExists.role !== 'admin') {
        userExists.role = 'admin';
        await userExists.save();
        console.log('User updated with admin role');
      }
    } else {
      // Create new admin user
      const user = await User.create(adminData);
      console.log(`Admin user created: ${user.email}`);
    }
    
    console.log('\nAdmin account created successfully!');
    console.log('----------------------------------');
    console.log(`Email: ${adminData.email}`);
    console.log(`Password: ${adminData.password}`);
    console.log('----------------------------------');
    
    // Close database connection
    await mongoose.disconnect();
    console.log('Database connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Run the function
createAdminUser(); 