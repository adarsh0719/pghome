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
router.get('/sent', protect, getSentRequests); // Use the new function

router.get("/connections", protect, async (req, res) => {
  try {
    const connections = await ConnectionRequest.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
      status: "accepted",
    });

    const finalData = await Promise.all(
      connections.map(async (conn) => {
        const otherUserId =
          conn.sender.toString() === req.user._id.toString()
            ? conn.receiver
            : conn.sender;

        const userData = await User.findById(otherUserId).select("name email");

        const rp = await RoommateProfile.findOne({ user: otherUserId });
        const profileImage = rp?.images?.[0] || null;

        return {
          ...conn.toObject(),
          otherUser: {
            ...userData.toObject(),
            profileImage,
          },
        };
      })
    );

    res.json(finalData);
  } catch (err) {
    console.error("Connections fetch error:", err);
    res.status(500).json({ message: "Server error" });
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