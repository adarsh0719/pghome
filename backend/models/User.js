const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  userType: {
    type: String,
    enum: ['student', 'employee', 'owner'],
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  dateOfBirth: Date,
  // Add properties array for owners
  properties: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property'
  }],

   
 // ... existing schema
  kycStatus: { type: String, enum: ['not_submitted','pending','approved','rejected'], default: 'not_submitted' },
  kycId: { type: mongoose.Schema.Types.ObjectId, ref: 'Kyc' },
  isAdmin: { type: Boolean, default: false }, 

  institution: {
    name: String,
    idProof: String,
    verified: {
      type: Boolean,
      default: false
    }
  },
  company: {
    name: String,
    email: String,
    verified: {
      type: Boolean,
      default: false
    }
  },
  isBlueTick: {
    type: Boolean,
    default: false
  },
  preferences: {
    budget: {
      min: Number,
      max: Number
    },
    habits: [String],
    ageGroup: {
      min: Number,
      max: Number
    }
  },
  subscription: {
    active: {
      type: Boolean,
      default: false
    },
    expiresAt: Date,
    plan: {
      type: String,
      enum: ['basic', 'premium'],
      default: 'basic'
    }
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

module.exports = mongoose.model('User', userSchema);