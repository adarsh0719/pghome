// models/ConnectionRequest.js
const mongoose = require('mongoose');

const connectionRequestSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
}, { timestamps: true });

connectionRequestSchema.index({ sender: 1, status: 1 });
connectionRequestSchema.index({ receiver: 1, status: 1 });

module.exports = mongoose.model('ConnectionRequest', connectionRequestSchema);
