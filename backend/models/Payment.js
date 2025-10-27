// models/Payment.js
const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['subscription', 'emi', 'addon'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  stripePaymentIntentId: String,
  status: {
    type: String,
    enum: ['pending', 'success', 'failed'],
    default: 'pending'
  },
  subscriptionPeriod: { // for subscription: 3 months
    type: Number,
    default: 3
  },
  emiPlan: { // if EMI, then details
    tenure: Number, // in months
    interestRate: Number
  },
  addOnService: String // if payment for add-on service
}, {
  timestamps: true
});

module.exports = mongoose.model('Payment', PaymentSchema);