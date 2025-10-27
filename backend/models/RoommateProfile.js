const mongoose = require('mongoose');

const RoommateProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  age: { type: Number, required: true },
  budget: { type: Number, required: true },
  habits: {
    smoking: { type: Boolean, default: false },
    drinking: { type: Boolean, default: false },
    pets: { type: Boolean, default: false },
    cleanliness: { type: Number, default: 3 } // 1-5 scale
  },
  vibeScore: { type: Number, default: 5 }, // 1-10 scale
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RoommateProfile', RoommateProfileSchema);
