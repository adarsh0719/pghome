const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['pg', 'flat', 'room', 'hostel'],
    required: true
  },
  rent: {
    type: Number,
    required: true,
    min: 0
  },
  vacancies: {
    single: { type: Number, default: 0 },
    double: { type: Number, default: 0 }
  },
  securityDeposit: {
    type: Number,
    default: 0,
    min: 0
  },
  location: {
    address: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    pincode: {
      type: String,
      required: true,
      trim: true
    },
    coordinates: {
      lat: Number,
      lng: Number
    },
    landmark: {
      type: String,
      trim: true
    }
  },
  amenities: [{
    type: String,
    trim: true
  }],
  images: [{
    url: String,
    publicId: String
  }],
  videoUrl: {
    type: String,
    trim: true
  },
  liveViewAvailable: {
    type: Boolean,
    default: false
  },
  rules: [{
    type: String,
    trim: true
  }],
  availability: {
    type: String,
    enum: ['available', 'occupied', 'maintenance'],
    default: 'available'
  },
  verified: {
    type: Boolean,
    default: false
  },
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  }

}, {
  timestamps: true
});

module.exports = mongoose.model('Property', propertySchema);