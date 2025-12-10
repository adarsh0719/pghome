const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bookedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  type: { type: String, enum: ['single', 'double'], required: true },
  months: { type: Number, enum: [3, 6], required: true },
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'paid', 'cancelled'], default: 'pending' },
  coupon: { type: String, unique: true, sparse: true },
  stripeSessionId: String,

  // Referral Info
  referralCodeApplied: { type: String },
  discountAmount: { type: Number, default: 0 }, // Discount from engaging a code
  rewardsUsed: { type: Number, default: 0 }, // Discount from USING own rewards
  isReferralRewardClaimed: { type: Boolean, default: false },

  // Booking Request Status
  approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
