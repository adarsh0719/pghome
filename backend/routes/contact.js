const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const { protect } = require('../middleware/auth');

router.post('/send', protect, async (req, res) => {
  try {
    const { ownerEmail, message, propertyId } = req.body;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: ownerEmail,
      subject: 'Property Inquiry',
      text: message,
    });

    res.json({ success: true, message: 'Email sent successfully' });
  } catch (err) {
    console.error('Email send error:', err.message);
    res.status(500).json({ message: 'Failed to send email' });
  }
});

module.exports = router;
