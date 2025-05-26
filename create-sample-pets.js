const mongoose = require('mongoose');
const Pet = require('./models/Pet');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Sample pet data that matches the design
const samplePets = [
  {
    code: 'MO231',
    name: 'Fluffy',
    species: 'Chó',
    breed: 'Pomeranian Trắng',
    color: 'Trắng',
    size: 'Nhỏ',
    age: 62,
    gender: 'Đực',
    price: 6000000,
    description: 'Chú chó Pomeranian trắng đáng yêu với bộ lông xù dày và tính cách thân thiện.',
    image: {
      url: 'https://images.unsplash.com/photo-1637591085948-ad0de3d5c5b7',
      public_id: 'sample_pet_1'
    },
    available: true
  },
  {
    code: 'MO502',
    name: 'Coco',
    species: 'Chó',
    breed: 'Poodle Tiny Vàng',
    color: 'Vàng',
    size: 'Nhỏ',
    age: 30,
    gender: 'Cái',
    price: 3000000,
    description: 'Chú chó Poodle Tiny Vàng xinh xắn, thông minh và rất dễ huấn luyện.',
    image: {
      url: 'https://images.unsplash.com/photo-1583511655826-05700d52f4d9',
      public_id: 'sample_pet_2'
    },
    available: true
  },
  {
    code: 'MO102',
    name: 'Bella',
    species: 'Chó',
    breed: 'Poodle Tiny Sepia',
    color: 'Nâu',
    size: 'Nhỏ',
    age: 40,
    gender: 'Đực',
    price: 4500000,
    description: 'Chó Poodle Tiny màu nâu sepia rất đặc biệt, thông minh và tình cảm.',
    image: {
      url: 'https://images.unsplash.com/photo-1593134257782-e89567b7718a',
      public_id: 'sample_pet_3'
    },
    available: true
  },
  {
    code: 'MO512',
    name: 'Alaska',
    species: 'Chó',
    breed: 'Alaskan Malamute',
    color: 'Trắng',
    size: 'Lớn',
    age: 65,
    gender: 'Đực',
    price: 8000000,
    description: 'Chó Alaska khỏe mạnh, dũng mãnh nhưng rất thân thiện với trẻ em.',
    image: {
      url: 'https://images.unsplash.com/photo-1541364983171-a8ba01e95cfc',
      public_id: 'sample_pet_4'
    },
    available: true
  },
  {
    code: 'MO231',
    name: 'Milo',
    species: 'Chó',
    breed: 'Pembroke Corgi',
    color: 'Vàng',
    size: 'Vừa',
    age: 42,
    gender: 'Đực',
    price: 7000000,
    description: 'Chó Corgi chân ngắn dễ thương với tính cách vui vẻ và năng động.',
    image: {
      url: 'https://images.unsplash.com/photo-1575425186775-b8de9a427e67',
      public_id: 'sample_pet_5'
    },
    available: true
  },
  {
    code: 'MO502',
    name: 'Max',
    species: 'Chó',
    breed: 'Pembroke Corgi',
    color: 'Vàng',
    size: 'Vừa',
    age: 34,
    gender: 'Cái',
    price: 9000000,
    description: 'Chó Corgi thuần chủng với đôi tai lớn đặc trưng và tính cách năng động.',
    image: {
      url: 'https://images.unsplash.com/photo-1612774412771-005ed8e861d2',
      public_id: 'sample_pet_6'
    },
    available: true
  },
  // Thêm dữ liệu mẫu về mèo
  {
    code: 'MC101',
    name: 'Luna',
    species: 'Mèo',
    breed: 'Scottish Fold',
    color: 'Xám',
    size: 'Vừa',
    age: 18,
    gender: 'Cái',
    price: 5500000,
    description: 'Mèo Scottish Fold tai cụp dễ thương với tính cách hiền lành và gần gũi.',
    image: {
      url: 'https://images.unsplash.com/photo-1529778873920-4da4926a72c2',
      public_id: 'sample_cat_1'
    },
    available: true
  },
  {
    code: 'MC102',
    name: 'Kitty',
    species: 'Mèo',
    breed: 'Anh Lông Ngắn',
    color: 'Trắng',
    size: 'Nhỏ',
    age: 12,
    gender: 'Cái',
    price: 4800000,
    description: 'Mèo Anh lông ngắn màu trắng tinh khôi, tính cách điềm tĩnh và thân thiện.',
    image: {
      url: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5',
      public_id: 'sample_cat_2'
    },
    available: true
  },
  {
    code: 'MC103',
    name: 'Oliver',
    species: 'Mèo',
    breed: 'Maine Coon',
    color: 'Vàng',
    size: 'Lớn',
    age: 24,
    gender: 'Đực',
    price: 7800000,
    description: 'Mèo Maine Coon to lớn với bộ lông dài mượt và tính cách thân thiện như chó.',
    image: {
      url: 'https://images.unsplash.com/photo-1568152950566-c1bf43f4ab28',
      public_id: 'sample_cat_3'
    },
    available: true
  },
  {
    code: 'MC104',
    name: 'Mochi',
    species: 'Mèo',
    breed: 'Munchkin',
    color: 'Đen',
    size: 'Nhỏ',
    age: 15,
    gender: 'Đực',
    price: 6500000,
    description: 'Mèo Munchkin chân ngắn đáng yêu với tính cách vui vẻ và năng động.',
    image: {
      url: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131',
      public_id: 'sample_cat_4'
    },
    available: true
  }
];

// Clear existing data and seed with new data
const seedData = async () => {
  try {
    // Delete existing pets
    await Pet.deleteMany({});
    console.log('Existing pets deleted');

    // Insert new pets
    const createdPets = await Pet.insertMany(samplePets);
    console.log(`${createdPets.length} pets created successfully`);
    
    // Close the connection
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

// Run the seeding function
seedData(); 