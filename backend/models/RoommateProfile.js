const mongoose = require('mongoose');

const RoommateProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

  age: { type: Number, required: true },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  budget: { type: Number, required: true },

  habits: {
    smoking: { type: Boolean, default: false },
    drinking: { type: Boolean, default: false },
    pets: { type: Boolean, default: false },
    parties: { type: Boolean, default: false },
    guests: { type: Boolean, default: false },
    cleanliness: { type: Number, default: 3 }, // 1-5
    sleepSchedule: { type: String, enum: ['early bird', 'night owl', 'flexible'], default: 'flexible' }
  },

  vibeScore: { type: Number, default: 5 }, // 1-10
  durationOfStay: { type: Number, default: 0 }, // months
  bio: { type: String, maxlength: 500 },

  images: [{ type: String }], // URLs or base64 data-uris

  // Human-readable location (optional)
  location: { type: String },

  // GeoJSON Point for spatial queries and accurate coordinates
  // Stored as: { type: 'Point', coordinates: [lon, lat] }
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    }
  },

  createdAt: { type: Date, default: Date.now }
});

// 2dsphere index to enable geospatial queries
RoommateProfileSchema.index({ coordinates: '2dsphere' });

module.exports = mongoose.model('RoommateProfile', RoommateProfileSchema);
