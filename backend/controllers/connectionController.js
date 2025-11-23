const ConnectionRequest = require('../models/ConnectionRequest');
const Chat = require('../models/ChatModel');
const User = require("../models/User");
const RoommateProfile = require("../models/RoommateProfile");

const sendRequest = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user._id;

    console.log("📨 SEND REQUEST → sender:", senderId, "receiver:", receiverId);

    if (!receiverId) return res.status(400).json({ message: "receiverId required" });
    if (senderId.toString() === receiverId.toString())
      return res.status(400).json({ message: "You cannot send request to yourself" });

    const existing = await ConnectionRequest.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId }
      ],
      status: "pending",
    });

    if (existing) {
      console.log("⚠️ Duplicate request found:", existing._id);
      return res.status(400).json({ message: "Request already exists" });
    }

    const request = await ConnectionRequest.create({
      sender: senderId,
      receiver: receiverId,
      status: "pending"
    });

    console.log("✅ Request created:", request);

    res.status(201).json(request);
  } catch (err) {
    console.error("❌ ERROR in sendRequest:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------------------------------------------------

const getRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const requests = await ConnectionRequest.find({
      receiver: userId,
      status: "pending"
    }).sort({ createdAt: -1 });

    const finalData = await Promise.all(
      requests.map(async (r) => {
        const sender = await User.findById(r.sender).select("name email");

        const rp = await RoommateProfile.findOne({ user: sender._id });
        const profileImage = rp?.images?.[0] || null;

        return {
          ...r.toObject(),
          sender: {
            ...sender.toObject(),
            profileImage,
          },
        };
      })
    );

    res.json(finalData);
  } catch (err) {
    console.error("❌ ERROR in getRequests:", err);
    res.status(500).json({ message: "Failed to fetch requests" });
  }
};


// ---------------------------------------------------------

const respondRequest = async (req, res) => {
  try {
    const { requestId, action } = req.body;
    const userId = req.user._id;

    console.log("\n⚡ RESPOND REQUEST:", { requestId, action, userId });

    const reqDoc = await ConnectionRequest.findById(requestId)
      .populate("sender", "name email roommateProfile")
      .populate("receiver", "name email");

    console.log("📌 Request Found:", reqDoc);

    if (!reqDoc) return res.status(404).json({ message: "Request not found" });
    if (reqDoc.receiver._id.toString() !== userId.toString())
      return res.status(403).json({ message: "Not authorized" });

    if (action === "accept") {
      reqDoc.status = "accepted";
      await reqDoc.save();

      console.log("✅ Request accepted. Creating chat...");

      const chat = await Chat.create({
        participants: [reqDoc.sender._id, reqDoc.receiver._id],
        connectionRequest: requestId
      });

      console.log("💬 Chat created:", chat);

      return res.json({
        message: "Request accepted successfully",
        chatId: chat._id
      });
    }

    if (action === "reject") {
      reqDoc.status = "rejected";
      await reqDoc.save();
      console.log("❌ Request rejected");
      return res.json({ message: "Request rejected" });
    }

    res.status(400).json({ message: "Invalid action" });

  } catch (err) {
    console.error("❌ ERROR in respondRequest:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------------------------------------------------

const cancelRequest = async (req, res) => {
  try {
    const { requestId } = req.body;
    const userId = req.user._id;

    console.log("\n🛑 CANCEL REQUEST:", requestId, "by user:", userId);

    const reqDoc = await ConnectionRequest.findById(requestId);
    if (!reqDoc) return res.status(404).json({ message: "Request not found" });

    if (reqDoc.sender.toString() !== userId.toString())
      return res.status(403).json({ message: "Not authorized" });

    await ConnectionRequest.findByIdAndDelete(requestId);

    console.log("🗑️ Request deleted:", requestId);

    res.json({ message: "Request cancelled successfully" });
  } catch (err) {
    console.error("❌ ERROR in cancelRequest:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------------------------------------------------
const getSentRequests = async (req, res) => {
  try {
    const requests = await ConnectionRequest.find({
      sender: req.user._id,
      status: { $in: ["pending", "accepted"] }
    }).sort({ createdAt: -1 });

    const finalData = await Promise.all(
      requests.map(async (r) => {
        const receiver = await User.findById(r.receiver).select("name email");

        const rp = await RoommateProfile.findOne({ user: receiver._id });
        const profileImage = rp?.images?.[0] || null;

        return {
          ...r.toObject(),
          receiver: {
            ...receiver.toObject(),
            profileImage,
          },
        };
      })
    );

    res.json(finalData);
  } catch (err) {
    console.error("❌ ERROR in getSentRequests:", err);
    res.status(500).json({ message: "Failed to fetch sent requests" });
  }
};






module.exports = {
  sendRequest,
  getRequests,
  respondRequest,
  cancelRequest,
  getSentRequests
  
};
