const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true
    },
    customer: {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      name: {
        type: String,
        required: true
      },
      email: {
        type: String,
        required: true
      },
      phone: {
        type: String
      }
    },
    items: [
      {
        petId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Pet',
          required: true
        },
        name: {
          type: String,
          required: true
        },
        price: {
          type: Number,
          required: true
        },
        image: {
          type: String
        }
      }
    ],
    total: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'cancelled'],
      default: 'pending'
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'unpaid'],
      default: 'unpaid'
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'credit_card', 'bank_transfer'],
      default: 'cash'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema); 