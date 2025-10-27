const mongoose = require('mongoose');

const KycSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  aadhaarMasked: { type: String, required: true }, // store masked e.g. **** **** 1234
  aadhaarHash: { type: String }, // optional: hashed for verification
  frontImageUrl: { type: String, required: true },
  backImageUrl: { type: String, required: true },
  status: { type: String, enum: ['pending','approved','rejected'], default: 'pending' },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // who approved/rejected
  rejectedReason: { type: String },
  submittedAt: { type: Date, default: Date.now },
  reviewedAt: { type: Date }
});

module.exports = mongoose.model('Kyc', KycSchema);
