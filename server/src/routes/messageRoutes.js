import express from "express";
import Message from "../models/Message.js";
import SwapRequest from "../models/SwapRequest.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Send a message
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { receiver, swapRequest, message } = req.body;

    if (!receiver || !swapRequest || !message) {
      return res.status(400).json({
        success: false,
        message: "Receiver, swap request and message are required",
      });
    }

    // Check that the swap request exists
    const request = await SwapRequest.findById(swapRequest);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Swap request not found",
      });
    }

    // Only people involved in the swap can chat
    const isParticipant =
      request.requester.toString() === req.userId.toString() ||
      request.receiver.toString() === req.userId.toString();

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "You are not part of this swap",
      });
    }

    // Receiver must also be part of this swap
    const isValidReceiver =
      request.requester.toString() === receiver.toString() ||
      request.receiver.toString() === receiver.toString();

    if (!isValidReceiver) {
      return res.status(403).json({
        success: false,
        message: "Invalid receiver",
      });
    }

    const newMessage = await Message.create({
      sender: req.userId,
      receiver,
      swapRequest,
      message: message.trim(),
    });

    const populatedMessage = await Message.findById(newMessage._id)
      .populate("sender", "name email profileImage")
      .populate("receiver", "name email profileImage");

    res.status(201).json({
      success: true,
      message: "Message sent successfully 💬",
      data: populatedMessage,
    });
  } catch (error) {
    console.error("Send message error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Get messages for a swap
router.get("/:swapRequestId", authMiddleware, async (req, res) => {
  try {
    const request = await SwapRequest.findById(
      req.params.swapRequestId
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Swap request not found",
      });
    }

    // Only swap participants can view the chat
    const isParticipant =
      request.requester.toString() === req.userId.toString() ||
      request.receiver.toString() === req.userId.toString();

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "You are not part of this swap",
      });
    }

    const messages = await Message.find({
      swapRequest: req.params.swapRequestId,
    })
      .populate("sender", "name email profileImage")
      .populate("receiver", "name email profileImage")
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("Get messages error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

router.patch("/:swapRequestId/read", authMiddleware, async (req, res) => {
  try {
    const { swapRequestId } = req.params;

    const swapRequest = await SwapRequest.findById(swapRequestId);

    if (!swapRequest) {
      return res.status(404).json({
        message: "Swap request not found",
      });
    }

    // Make sure the logged-in user is part of this swap
    const isParticipant =
      swapRequest.requester.toString() === req.userId ||
      swapRequest.receiver.toString() === req.userId;

    if (!isParticipant) {
      return res.status(403).json({
        message: "You are not part of this conversation",
      });
    }

    // Mark messages received by the logged-in user as read
    await Message.updateMany(
  {
    swapRequest: swapRequestId,
    receiver: req.userId,
    isRead: { $ne: true },
  },
  {
    $set: { isRead: true },
  }
);

    res.json({
      message: "Messages marked as read",
    });
  } catch (error) {
    console.error("Mark messages read error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

export default router;