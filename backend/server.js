const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// -----------------------------
// ✅ Allowed Origins (from .env)
// -----------------------------
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.ALT_CLIENT_URL
].filter(Boolean);

const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  }
});

// -----------------------------
// ⚠️ Stripe webhook route — must come BEFORE express.json()
// -----------------------------
const paymentsRouter = require('./routes/payments');
app.post(
  '/api/payments/webhook',
  express.raw({ type: 'application/json' }),
  paymentsRouter
);

// -----------------------------
// Normal Middleware
// -----------------------------
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());
app.use(express.static('uploads'));

// -----------------------------
// Database connection
// -----------------------------
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pgtohome')
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// -----------------------------
// Routes
// -----------------------------
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/properties', require('./routes/properties'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/payments', require('./routes/payments')); // ✅ keep AFTER webhook
app.use('/api/roommate', require('./routes/roommate'));
app.use('/api/roommates', require('./routes/roommate'));
app.use('/api/kyc', require('./routes/kyc'));

// -----------------------------
// Socket.io setup
// -----------------------------
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`${socket.id} joined room ${roomId}`);
    socket.to(roomId).emit('user-joined', socket.id);
  });

  // WebRTC Offer
  socket.on('offer', (data) => {
    socket.to(data.roomId).emit('offer', data);
  });

  // WebRTC Answer
  socket.on('answer', (data) => {
    socket.to(data.roomId).emit('answer', data);
  });

  // ICE Candidate
  socket.on('ice-candidate', (data) => {
    socket.to(data.roomId).emit('ice-candidate', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// -----------------------------
// Server Start
// -----------------------------
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`🚀 Server running locally on port ${PORT}`);
  });
}

module.exports = server;
