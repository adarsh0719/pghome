const ConnectionRequest = require('../models/ConnectionRequest');
const Chat = require('../models/ChatModel');
const User = require('../models/User');

const sendRequest = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user._id;

    if (!receiverId) return res.status(400).json({ message: 'receiverId required' });
    if (senderId.toString() === receiverId.toString()) {
      return res.status(400).json({ message: 'You cannot send request to yourself' });
    }

    const existing = await ConnectionRequest.findOne({ 
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId }
      ],
      status: 'pending'
    });
    if (existing) return res.status(400).json({ message: 'Request already exists' });

    const request = await ConnectionRequest.create({ 
      sender: senderId, 
      receiver: receiverId, 
      status: 'pending' 
    });

    // Populate for notification
    const populatedRequest = await ConnectionRequest.findById(request._id)
      .populate('sender', 'name email')
      .populate('receiver', 'name email');

    // Emit to receiver with better error handling
    if (global.io && global.userSocketMap) {
      const receiverSocketId = global.userSocketMap[receiverId.toString()];
      if (receiverSocketId) {
        global.io.to(receiverSocketId).emit('new_connection_request', {
          requestId: populatedRequest._id,
          sender: { 
            _id: populatedRequest.sender._id, 
            name: populatedRequest.sender.name 
          },
          message: `${populatedRequest.sender.name} sent you a connection request`,
          createdAt: populatedRequest.createdAt
        });
        console.log(`✅ Emitted new_connection_request to user ${receiverId}`);
      } else {
        console.log(`❌ User ${receiverId} not connected via socket`);
      }
    }

    return res.status(201).json(populatedRequest);
  } catch (error) {
    console.error('sendRequest error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const getRequests = async (req, res) => {
  try {
    const userId = req.user._id;
    const requests = await ConnectionRequest.find({ receiver: userId, status: 'pending' })
      .populate('sender', 'name email profilePicture')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    console.error('getRequests error:', error);
    res.status(500).json({ message: 'Failed to fetch requests' });
  }
};

const respondRequest = async (req, res) => {
  try {
    const { requestId, action } = req.body;
    const userId = req.user._id;

    // Find and populate the request
    const request = await ConnectionRequest.findById(requestId)
      .populate('sender', 'name email')
      .populate('receiver', 'name email');
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Verify the current user is the receiver
    if (request.receiver._id.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to respond to this request' });
    }

    if (action === 'accept') {
      request.status = 'accepted';
      await request.save();

      // Create chat between users
      const chat = await Chat.create({ 
        participants: [request.sender._id, request.receiver._id],
        connectionRequest: requestId 
      });

      // Notify BOTH users with proper error handling
      if (global.io && global.userSocketMap) {
        
        // 1. Notify the ACCEPTOR (person who clicked accept)
        const acceptorSocketId = global.userSocketMap[userId.toString()];
        if (acceptorSocketId) {
          global.io.to(acceptorSocketId).emit('connection_request_accepted', {
            requestId: request._id,
            chatId: chat._id,
            message: 'Connection request accepted successfully'
          });
          console.log(`✅ Notified acceptor ${userId} about acceptance`);
        }

        // 2. Notify the SENDER (person who originally sent the request)
        const senderSocketId = global.userSocketMap[request.sender._id.toString()];
        if (senderSocketId) {
          global.io.to(senderSocketId).emit('your_request_accepted', {
            requestId: request._id,
            chatId: chat._id,
            acceptor: { 
              name: request.receiver.name,
              _id: request.receiver._id
            }
          });
          console.log(`✅ Notified sender ${request.sender._id} that their request was accepted`);
        } else {
          console.log(`❌ Sender ${request.sender._id} not connected via socket`);
        }
      }

      return res.json({ 
        message: 'Request accepted successfully', 
        chatId: chat._id 
      });

    } else if (action === 'reject') {
      request.status = 'rejected';
      await request.save();

      // Notify sender about rejection
      if (global.io && global.userSocketMap) {
        const senderSocketId = global.userSocketMap[request.sender._id.toString()];
        if (senderSocketId) {
          global.io.to(senderSocketId).emit('connection_request_rejected', {
            requestId: request._id,
            message: 'Your connection request was declined'
          });
        }
      }

      return res.json({ message: 'Request rejected' });
    } else {
      return res.status(400).json({ message: 'Invalid action' });
    }
  } catch (error) {
    console.error('respondRequest error:', error);
    res.status(500).json({ message: 'Server error processing request' });
  }
};

const cancelRequest = async (req, res) => {
  try {
    const { requestId } = req.body;
    const userId = req.user._id;

    const request = await ConnectionRequest.findById(requestId)
      .populate('sender', 'name email')
      .populate('receiver', 'name email');
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.sender._id.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this request' });
    }

    // Notify receiver about cancellation before deleting
    if (global.io && global.userSocketMap) {
      const receiverSocketId = global.userSocketMap[request.receiver._id.toString()];
      if (receiverSocketId) {
        global.io.to(receiverSocketId).emit('request_cancelled', {
          requestId: request._id,
          sender: { 
            name: request.sender.name,
            _id: request.sender._id
          }
        });
      }
    }

    await ConnectionRequest.findByIdAndDelete(requestId);
    
    return res.json({ message: 'Request cancelled successfully' });
  } catch (error) {
    console.error('cancelRequest error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getSentRequests = async (req, res) => {
  try {
    const requests = await ConnectionRequest.find({ 
      sender: req.user._id, 
      status: 'pending' 
    })
    .populate('receiver', 'name email profilePicture')
    .sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (error) {
    console.error('getSentRequests error:', error);
    res.status(500).json({ message: 'Failed to fetch sent requests' });
  }
};

module.exports = { 
  sendRequest, 
  getRequests, 
  respondRequest, 
  cancelRequest, 
  getSentRequests 
};