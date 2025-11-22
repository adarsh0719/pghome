const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { 
  sendRequest, 
  getRequests, 
  respondRequest, 
  cancelRequest, 
  getSentRequests 
} = require('../controllers/connectionController');

router.post('/send', protect, sendRequest);
router.get('/received', protect, getRequests);
router.post('/respond', protect, respondRequest);
router.post('/cancel', protect, cancelRequest);
router.get('/sent', protect, getSentRequests); // Use the new function

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