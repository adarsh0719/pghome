const nodemailer = require("nodemailer");
const Otp = require("../models/Otp");
require("dotenv").config();

// ----------- Create transporter (Gmail App Password) -----------
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_SENDER,   // Gmail email
    pass: process.env.GMAIL_PASSWORD, // Gmail App Password
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
      from: `PGtoHome <${process.env.GMAIL_SENDER}>`,
      to: email,
      subject: "PGtoHome Email Verification OTP",
      text: `Your PGtoHome OTP is: ${otp}`,
    };

    await transporter.sendMail(mailOptions);

    console.log(`OTP ${otp} sent to ${email}`); // For debugging in Render logs

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

    if (record.otp != otp) { // allow string/number comparison
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    await Otp.deleteOne({ email });

    console.log(`OTP verified for ${email}`); // Debug

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
