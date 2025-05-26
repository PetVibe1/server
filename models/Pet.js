const mongoose = require('mongoose');

const petSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    species: {
      type: String,
      required: true,
      trim: true
    },
    breed: {
      type: String,
      required: false,
      trim: true
    },
    color: {
      type: String,
      enum: ['Vàng', 'Đen', 'Trắng', 'Nâu', 'Xám', 'Khác'],
      default: 'Khác'
    },
    size: {
      type: String,
      enum: ['Nhỏ', 'Vừa', 'Lớn'],
      default: 'Vừa'
    },
    age: {
      type: Number,
      required: true
    },
    gender: {
      type: String,
      enum: ['Đực', 'Cái', 'Unknown'],
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    description: {
      type: String,
      required: false
    },
    image: {
      url: {
        type: String,
        required: false
      },
      public_id: {
        type: String,
        required: false
      }
    },
    additionalImages: [
      {
        url: {
          type: String,
          required: true
        },
        public_id: {
          type: String,
          required: true
        }
      }
    ],
    available: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Pet', petSchema); 