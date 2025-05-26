const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    customer: {
      type: String,
      required: true
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    petId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pet'
    },
    petName: {
      type: String
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled'],
      default: 'pending'
    },
    notes: {
      type: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Appointment', appointmentSchema); 