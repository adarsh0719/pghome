const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  checkIn: {
    type: Date,
    required: true
  },
  checkOut: Date,
  duration: {
    type: Number, // in months
    required: true,
    default: 1
  },
  totalAmount: {
    type: Number,
    required: true
  },
  securityDeposit: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'rejected'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  emiPlan: {
    enabled: {
      type: Boolean,
      default: false
    },
    tenure: Number,
    monthlyAmount: Number,
    processingFee: Number
  },
  transactionId: String,
  paymentMethod: String,
  specialRequests: String,
  cancellationReason: String,
  refundAmount: Number
}, {
  timestamps: true
});

// Index for better query performance
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ owner: 1, createdAt: -1 });
bookingSchema.index({ property: 1, status: 1 });

// Virtual for calculating refund amount
bookingSchema.virtual('calculateRefund').get(function() {
  if (this.status === 'cancelled' && this.paymentStatus === 'paid') {
    const daysUntilCheckIn = Math.ceil((this.checkIn - new Date()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilCheckIn > 7) {
      return this.totalAmount * 0.8; // 80% refund
    } else if (daysUntilCheckIn > 3) {
      return this.totalAmount * 0.5; // 50% refund
    } else {
      return 0; // No refund
    }
  }
  return 0;
});

module.exports = mongoose.model('Booking', bookingSchema);