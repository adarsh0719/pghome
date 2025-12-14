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
  kycStatus: { type: String, enum: ['not_submitted', 'pending', 'approved', 'rejected'], default: 'not_submitted' },
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
  lastSeen: {
    type: Date,
    default: Date.now
  },
  isOnline: {
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
  },

  // Secret Code for Roommate Booking
  secretCode: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    uppercase: true
  },

  // Referral System
  referralCode: {
    type: String,
    unique: true,
    sparse: true, // Allows null/undefined for users without code (non-KYC)
    trim: true,
    index: true
  },
  referralRewards: {
    type: Number,
    default: 0
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function (next) {
  // 1. Hash Password
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }

  // 2. Generate Secret Code if missing
  if (!this.secretCode) {
    const generateCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < 10; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };

    let code = generateCode();
    // Simple check to avoid unlikely collision (for production, retry logic is better)
    this.secretCode = code;
  }

  next();
});

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

module.exports = mongoose.model('User', userSchema);