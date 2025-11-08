// controllers/otpController.js
const sgMail = require("@sendgrid/mail");
const Otp = require("../models/Otp");
require("dotenv").config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// ----------- SEND OTP -----------
const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);

    await Otp.findOneAndUpdate(
      { email },
      {
        otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // valid for 10 min
      },
      { upsert: true, new: true }
    );

    const msg = {
      to: email,
      from: process.env.SENDGRID_SENDER, // must match verified sender
      subject: "PGtoHome Email Verification OTP",
      text: `Your OTP is ${otp}. It’s valid for 10 minutes.`,
      html: `<p>Your <b>PGtoHome</b> OTP is <strong>${otp}</strong>.<br/>It expires in 10 minutes.</p>`,
    };

    await sgMail.send(msg);

    return res.json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    console.error("Error sending OTP:", err);
    if (err.response) console.error(err.response.body);
    return res
      .status(500)
      .json({ success: false, message: "Failed to send OTP", error: err.message });
  }
};

// ----------- VERIFY OTP -----------
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "Email and OTP are required" });
    }

    const record = await Otp.findOne({ email });
    if (!record) {
      return res
        .status(404)
        .json({ success: false, message: "OTP not found" });
    }

    if (record.expiresAt < new Date()) {
      await Otp.deleteOne({ email });
      return res
        .status(400)
        .json({ success: false, message: "OTP expired" });
    }

    if (record.otp != otp) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid OTP" });
    }

    await Otp.deleteOne({ email });
    return res.json({ success: true, message: "OTP verified successfully" });
  } catch (err) {
    console.error("Error verifying OTP:", err);
    return res
      .status(500)
      .json({ success: false, message: "Error verifying OTP", error: err.message });
  }
};

module.exports = { sendOTP, verifyOTP };
