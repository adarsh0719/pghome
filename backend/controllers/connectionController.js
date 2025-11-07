// controllers/connectionController.js
const ConnectionRequest = require('../models/ConnectionRequest');
const Chat = require('../models/ChatModel'); // adjust if your Chat model file name differs
const User = require('../models/User'); // optional: to populate sender name

const sendRequest = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user._id;

    if (!receiverId) return res.status(400).json({ message: 'receiverId required' });
    if (senderId.toString() === receiverId.toString()) {
      return res.status(400).json({ message: 'You cannot send request to yourself' });
    }

    const existing = await ConnectionRequest.findOne({ sender: senderId, receiver: receiverId });
    if (existing) return res.status(400).json({ message: 'Request already sent' });

    const request = await ConnectionRequest.create({ sender: senderId, receiver: receiverId, status: 'pending' });

    // optionally populate sender info to send in notification
    let senderInfo = { _id: senderId };
    try {
      const s = await User.findById(senderId).select('name email');
      if (s) senderInfo = s;
    } catch (e) { /* ignore */ }

    // Emit popup event to receiver using userSocketMap
    try {
      if (global.io && global.userSocketMap) {
        const receiverSocketId = global.userSocketMap[receiverId.toString()];
        if (receiverSocketId) {
          global.io.to(receiverSocketId).emit('new_connection_request', {
            requestId: request._id,
            sender: { _id: senderInfo._id, name: senderInfo.name },
            message: `${senderInfo.name || 'Someone'} sent you a connection request`,
            createdAt: request.createdAt
          });
          console.log(`Emitted new_connection_request to user ${receiverId}`);
        } else {
          console.log(`Receiver ${receiverId} not connected, skipping real-time emit`);
        }
      }
    } catch (emitErr) {
      console.error('Error emitting connection notification:', emitErr);
    }

    return res.status(201).json(request);
  } catch (error) {
    console.error('sendRequest error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const getRequests = async (req, res) => {
  try {
    const userId = req.user._id;
    const requests = await ConnectionRequest.find({ receiver: userId, status: 'pending' })
      .populate('sender', 'name email');
    res.json(requests);
  } catch (error) {
    console.error('getRequests error:', error);
    res.status(500).json({ message: 'Failed to fetch requests' });
  }
};

const respondRequest = async (req, res) => {
  try {
    const { requestId, action } = req.body; // 'accept' | 'reject'
    const request = await ConnectionRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    if (request.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (action === 'accept') {
      request.status = 'accepted';
      await request.save();

      // create chat when accepted (if not exists)
      const chat = await Chat.create({ users: [request.sender, request.receiver], messages: [] });

      // notify sender in real-time about acceptance if online
      try {
        if (global.io && global.userSocketMap) {
          const senderSocketId = global.userSocketMap[request.sender.toString()];
          if (senderSocketId) {
            global.io.to(senderSocketId).emit('connection_request_accepted', {
              requestId: request._id,
              chatId: chat._id,
              message: 'Your connection request was accepted'
            });
          }
        }
      } catch (e) {
        console.error(' error notifying sender on accept:', e);
      }

      return res.json({ message: 'Request accepted', chatId: chat._id });
    } else {
      request.status = 'rejected';
      await request.save();
      return res.json({ message: 'Request rejected' });
    }
  } catch (error) {
    console.error('respondRequest error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { sendRequest, getRequests, respondRequest };
