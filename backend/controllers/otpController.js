const nodemailer = require("nodemailer");
const Otp = require("../models/Otp");
require("dotenv").config();

// ----------- Create transporter (SendGrid SMTP) -----------
const transporter = nodemailer.createTransport({
  host: "smtp.sendgrid.net",
  port: 587,
  auth: {
    user: "apikey", // fixed SendGrid username
    pass: process.env.SENDGRID_API_KEY, // your SendGrid API key from environment variables
  },
});

// ----------- SEND OTP -----------
const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);

    // Save OTP to DB
    await Otp.findOneAndUpdate(
      { email },
      { otp, createdAt: new Date() },
      { upsert: true }
    );

    // Send email
    const mailOptions = {
      from: `PGtoHome <${process.env.SENDGRID_SENDER}>`,
      to: email,
      subject: "PGtoHome Email Verification OTP",
      text: `Your PGtoHome OTP is: ${otp}`,
    };

    await transporter.sendMail(mailOptions);

    return res.json({ success: true, message: "OTP Sent Successfully" });
  } catch (err) {
    console.error("Error sending OTP:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to send OTP",
      error: err.message,
    });
  }
};

// ----------- VERIFY OTP -----------
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    const record = await Otp.findOne({ email });

    if (!record) {
      return res.status(404).json({ success: false, message: "OTP not found" });
    }

    if (record.otp != otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    await Otp.deleteOne({ email });
    return res.json({ success: true, message: "OTP Verified" });
  } catch (err) {
    console.error("Error verifying OTP:", err);
    return res.status(500).json({
      success: false,
      message: "Error verifying OTP",
      error: err.message,
    });
  }
};

module.exports = { sendOTP, verifyOTP };
