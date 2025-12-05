const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const ConnectionRequest = require('../models/ConnectionRequest');
const RoommateProfile = require("../models/RoommateProfile");
const User = require("../models/User");

const {
  sendRequest,
  getRequests,
  respondRequest,
  cancelRequest,
  getSentRequests,
} = require('../controllers/connectionController');

router.post('/send', protect, sendRequest);
router.get('/received', protect, getRequests);
router.post('/respond', protect, respondRequest);
router.post('/cancel', protect, cancelRequest);
router.get('/sent', protect, getSentRequests);

// 🚀 NEW: Lightweight endpoint for filtering
router.get('/ids', protect, async (req, res) => {
  try {
    const connections = await ConnectionRequest.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
      status: "accepted",
    }).select('sender receiver').lean();

    const connectedIds = connections.map(conn =>
      conn.sender.toString() === req.user._id.toString() ? conn.receiver : conn.sender
    );

    res.json(connectedIds);
  } catch (err) {
    console.error("Connection IDs fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Optimized GET /connections (No Images for Speed)
router.get("/", protect, async (req, res) => {
  const start = Date.now();
  console.log('GET /connections START', start);
  try {
    // 1. Get all accepted connections
    const connections = await ConnectionRequest.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
      status: "accepted",
    }).lean();

    if (!connections.length) return res.json([]);

    // 2. Collect all other user IDs
    const otherUserIds = connections.map(conn =>
      conn.sender.toString() === req.user._id.toString() ? conn.receiver : conn.sender
    );

    // 3. Batch fetch Users ONLY (No Profiles/Images for speed)
    console.time('User.find');
    const users = await User.find({ _id: { $in: otherUserIds } })
      .select("name email isOnline lastSeen") // Removed profilePicture from select
      .lean();
    console.timeEnd('User.find');

    // Fetch Profile Images
    const profiles = await RoommateProfile.find({ user: { $in: otherUserIds } })
      .select('user images')
      .lean();

    const imageMap = {};
    profiles.forEach(p => {
      if (p.images && p.images.length > 0) {
        imageMap[p.user.toString()] = p.images[0];
      }
    });

    // 4. Create lookup map
    const userMap = {};
    users.forEach(u => userMap[u._id.toString()] = u);

    // 5. Map back to connection objects
    const finalData = connections.map(conn => {
      const otherId = conn.sender.toString() === req.user._id.toString() ? conn.receiver : conn.sender;
      const userObj = userMap[otherId.toString()] || {};

      return {
        ...conn,
        otherUser: {
          _id: otherId,
          name: userObj.name || "Unknown",
          email: userObj.email || "",
          profilePicture: imageMap[otherId.toString()] || null,
          isOnline: userObj.isOnline || false,
          lastSeen: userObj.lastSeen || null,
          profileImage: null
        }
      };
    });

    res.json(finalData);
  } catch (err) {
    console.error("Connections fetch error:", err);
    res.status(500).json({ message: "Server error" });
  } finally {
    console.log('GET /connections Total took:', Date.now() - start, 'ms');
  }
});

// Connection status check
router.get('/status/:userId', protect, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    const connection = await ConnectionRequest.findOne({
      $or: [
        { sender: currentUserId, receiver: userId, status: 'pending' },
        { sender: userId, receiver: currentUserId, status: 'pending' },
        { sender: currentUserId, receiver: userId, status: 'accepted' },
        { sender: userId, receiver: currentUserId, status: 'accepted' }
      ],
    });

    if (!connection) {
      return res.json({ status: 'none' });
    }

    // Determine the relationship
    let relationship = 'none';
    if (connection.status === 'accepted') {
      relationship = 'connected';
    } else if (connection.sender.toString() === currentUserId.toString()) {
      relationship = 'sent';
    } else if (connection.receiver.toString() === currentUserId.toString()) {
      relationship = 'received';
    }

    res.json({ status: relationship, requestId: connection._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error checking connection status' });
  }
});

module.exports = router;