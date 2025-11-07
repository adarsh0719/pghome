const nodemailer = require("nodemailer");
const Otp = require("../models/Otp");
require("dotenv").config();
// Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_SENDER,          // your gmail
    pass: process.env.GMAIL_PASSWORD,       // your Gmail app password
  },
});

// ---------------- SEND OTP -----------------
const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const otp = Math.floor(100000 + Math.random() * 900000);
    
    await Otp.findOneAndUpdate(
      { email },
      { otp, createdAt: new Date() },
      { upsert: true }
    );

    await transporter.sendMail({
      from: "PGtoHome <yourgmail@gmail.com>",
      to: email,
      subject: "PGtoHome Email Verification OTP",
      text: `Your PGtoHome OTP is: ${otp}`,
    });

    return res.json({ success: true, message: "OTP Sent Successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
};

// --------------- VERIFY OTP ----------------
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const record = await Otp.findOne({ email });

    if (!record) {
      return res.json({ success: false, message: "OTP not found" });
    }

    if (record.otp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    await Otp.deleteOne({ email });

    return res.json({ success: true, message: "OTP Verified" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Error verifying OTP" });
  }
};

module.exports = { sendOTP, verifyOTP };
