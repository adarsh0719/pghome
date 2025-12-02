// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Allowed Origins (adjust env vars)
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:3000',
  process.env.ALT_CLIENT_URL
].filter(Boolean);

// SOCKET.IO
const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// In-memory mapping: userId -> socketId
// (For production scale use Redis adapter)
const userSocketMap = {}; // { userId: socketId }
global.io = io;
global.userSocketMap = userSocketMap;

// Stripe webhook route (keep as-is)
const paymentsRouter = require('./routes/payments');
app.post(
  '/api/payments/webhook',
  express.raw({ type: 'application/json' }),
  paymentsRouter
);

const compression = require('compression');

// Normal Middleware
app.use(compression());
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());
app.use(express.static('uploads'));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pgtohome', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log(' MongoDB connected'))
  .catch((err) => console.error(' MongoDB connection error:', err));

// Routes (your existing REST endpoints)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/properties', require('./routes/properties'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/roommate', require('./routes/roommate'));
app.use('/api/kyc', require('./routes/kyc'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/connections', require('./routes/connectionRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
// ---  SOCKET.IO SETUP (WebRTC + Chat + Notifications) ---
io.on('connection', (socket) => {
  console.log(' New socket connected:', socket.id);

  // Register user's socket with their userId
  socket.on('register_user', (userId) => {
    if (!userId) return;
    userSocketMap[userId] = socket.id;
    socket.userId = userId;
    console.log(` Registered user ${userId} -> socket ${socket.id}`);
  });

  // -------- WebRTC signaling for live video rooms --------
  socket.on('join-room', (roomId) => {
    if (!roomId) return;
    socket.join(roomId);
    console.log(`${socket.id} joined room ${roomId}`);
    socket.to(roomId).emit('user-joined', socket.id);
  });

  socket.on('offer', (data) => {
    // data: { roomId, sdp, from }
    if (!data?.roomId) return;
    socket.to(data.roomId).emit('offer', data);
  });

  socket.on('answer', (data) => {
    if (!data?.roomId) return;
    socket.to(data.roomId).emit('answer', data);
  });

  socket.on('ice-candidate', (data) => {
    if (!data?.roomId) return;
    socket.to(data.roomId).emit('ice-candidate', data);
  });

  // -------- Chat: join chat room & send messages --------
  const Chat = require('./models/ChatModel'); // adjust filename if needed

  socket.on('join_chat', (chatId) => {
    if (!chatId) return;
    socket.join(chatId);
    console.log(` ${socket.id} joined chat ${chatId}`);
  });

  socket.on('send_message', async (data) => {
    try {
      // data: { chatId, senderId, text }
      const { chatId, senderId, text } = data;
      if (!chatId || !text) return;

      const chat = await Chat.findById(chatId);
      if (!chat) {
        console.warn('Chat not found:', chatId);
        return;
      }

      const message = { sender: senderId, text, createdAt: new Date() };
      chat.messages.push(message);
      await chat.save();

      // Emit to everyone in chat room
      io.to(chatId).emit('receive_message', { chatId, message });
      console.log(` Message sent to chat ${chatId}`);
    } catch (err) {
      console.error(' Error saving/sending message:', err);
    }
  });

  // -------- Cleanup on disconnect --------
  socket.on('disconnect', () => {
    console.log(' Socket disconnected:', socket.id);
    // remove user mapping
    if (socket.userId) {
      const uid = socket.userId;
      if (userSocketMap[uid] === socket.id) delete userSocketMap[uid];
      console.log(` Removed mapping for user ${uid}`);
    } else {
      // fallback: remove by value if exists
      for (const uid in userSocketMap) {
        if (userSocketMap[uid] === socket.id) {
          delete userSocketMap[uid];
          break;
        }
      }
    }
  });
});

// --- SERVER START ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(` Server listening on port ${PORT}`);
});

module.exports = server;
