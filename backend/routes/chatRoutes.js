// routes/chatRoutes.js
const express = require('express');
const Chat = require('../models/ChatModel');
const { protect } = require('../middleware/auth'); // your existing auth middleware

const router = express.Router();

// Create or get existing chat between two users
router.post('/create', protect, async (req, res) => {
  try {
    const { otherUserId } = req.body;
    if (!otherUserId) return res.status(400).json({ message: 'otherUserId required' });

    let chat = await Chat.findOne({
      participants: { $all: [req.user._id, otherUserId] },
    });

    if (!chat) {
      chat = await Chat.create({ participants: [req.user._id, otherUserId] });
    }

    res.json(chat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Get all chats for logged in user
router.get('/', protect, async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.user._id })
      .populate('participants', 'name email')
      .sort({ updatedAt: -1 });
    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Save message (fallback if frontend uses REST instead of socket)
router.post('/:chatId/message', protect, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Text required' });

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    const message = {
      sender: req.user._id,
      text,
      createdAt: new Date(),
    };

    chat.messages.push(message);
    await chat.save();

    
    await chat.populate({ path: 'messages.sender', select: 'name _id' });

    res.json(chat.messages[chat.messages.length - 1]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Get chat with messages
router.get('/:chatId', protect, async (req, res) => {
  const chat = await Chat.findById(req.params.chatId)
    .populate('messages.sender', 'name');

  if (!chat) return res.status(404).json({ message: 'Chat not found' });
  res.json(chat);
});

module.exports = router;
