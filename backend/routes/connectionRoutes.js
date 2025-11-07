const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { sendRequest, getRequests, respondRequest } = require('../controllers/connectionController');
const ConnectionRequest = require('../models/ConnectionRequest');

// Existing routes
router.post('/send', protect, sendRequest);
router.get('/received', protect, getRequests);
router.post('/respond', protect, respondRequest);

// ✅ New route: Check connection status
router.get('/status/:userId', protect, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    const connection = await ConnectionRequest.findOne({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId },
      ],
    });

    if (!connection) {
      return res.json({ status: 'none' }); // No request yet
    }

    res.json({ status: connection.status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error checking connection status' });
  }
});

module.exports = router;
