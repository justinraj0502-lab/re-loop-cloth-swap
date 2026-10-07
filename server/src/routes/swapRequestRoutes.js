import express from "express";
import SwapRequest from "../models/SwapRequest.js";
import Clothing from "../models/Clothing.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Create a swap request
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { offeredItem, requestedItem, message } = req.body;

    if (!offeredItem || !requestedItem) {
      return res.status(400).json({
        success: false,
        message: "Offered item and requested item are required",
      });
    }

    // Get both clothing items
    const offered = await Clothing.findById(offeredItem);
    const requested = await Clothing.findById(requestedItem);

    if (!offered || !requested) {
      return res.status(404).json({
        success: false,
        message: "One or both clothing items not found",
      });
    }

    // User must own the item they are offering
    if (offered.owner.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only offer your own clothing",
      });
    }

    // User cannot request their own item
    if (requested.owner.toString() === req.userId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot request your own clothing",
      });
    }

    // Both items must be available
    if (
      offered.status !== "available" ||
      requested.status !== "available"
    ) {
      return res.status(400).json({
        success: false,
        message: "One or both items are no longer available",
      });
    }

    // Check for an existing pending request
    const existingRequest = await SwapRequest.findOne({
      requester: req.userId,
      offeredItem,
      requestedItem,
      status: "pending",
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: "You already sent a request for this swap",
      });
    }

    // Create request
    const swapRequest = await SwapRequest.create({
      requester: req.userId,
      receiver: requested.owner,
      offeredItem,
      requestedItem,
      message: message || "",
    });

    res.status(201).json({
      success: true,
      message: "Swap request sent successfully 🔄",
      swapRequest,
    });
  } catch (error) {
    console.error("Create swap request error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Get my swap requests
router.get("/mine", authMiddleware, async (req, res) => {
  try {
    const requests = await SwapRequest.find({
      $or: [
        { requester: req.userId },
        { receiver: req.userId },
      ],
    })
      .populate("requester", "name email location profileImage")
      .populate("receiver", "name email location profileImage")
      .populate(
        "offeredItem",
        "title type brand size condition images swapValue location status"
      )
      .populate(
        "requestedItem",
        "title type brand size condition images swapValue location status"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      requests,
    });
  } catch (error) {
    console.error("Get swap requests error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Accept or reject a swap request
router.patch("/:id/status", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const swapRequest = await SwapRequest.findById(req.params.id);

    if (!swapRequest) {
      return res.status(404).json({
        success: false,
        message: "Swap request not found",
      });
    }

    // Only the receiver can accept/reject
    if (
      swapRequest.receiver.toString() !== req.userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Only the receiver can update this request",
      });
    }

    // Only pending requests can be updated
    if (swapRequest.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending requests can be updated",
      });
    }

    // If accepting, check whether either item is already unavailable
    if (status === "accepted") {
      const offeredItem = await Clothing.findById(
        swapRequest.offeredItem
      );

      const requestedItem = await Clothing.findById(
        swapRequest.requestedItem
      );

      if (!offeredItem || !requestedItem) {
        return res.status(404).json({
          success: false,
          message: "One or both clothing items no longer exist",
        });
      }

      if (
        offeredItem.status !== "available" ||
        requestedItem.status !== "available"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "This swap cannot be accepted because one or both items are already unavailable.",
        });
      }

      // Accept the current request
      swapRequest.status = "accepted";
      await swapRequest.save();

      // Mark both items unavailable
      await Clothing.findByIdAndUpdate(
        swapRequest.offeredItem,
        { status: "unavailable" }
      );

      await Clothing.findByIdAndUpdate(
        swapRequest.requestedItem,
        { status: "unavailable" }
      );

      // Reject other pending requests involving either item
      await SwapRequest.updateMany(
        {
          _id: { $ne: swapRequest._id },
          status: "pending",
          $or: [
            { offeredItem: swapRequest.offeredItem },
            { requestedItem: swapRequest.offeredItem },
            { offeredItem: swapRequest.requestedItem },
            { requestedItem: swapRequest.requestedItem },
          ],
        },
        {
          $set: { status: "rejected" },
        }
      );

      return res.status(200).json({
        success: true,
        message: "Swap request accepted successfully 🎉",
        swapRequest,
      });
    }

    // Reject request
    swapRequest.status = "rejected";
    await swapRequest.save();

    res.status(200).json({
      success: true,
      message: "Swap request rejected",
      swapRequest,
    });
  } catch (error) {
    console.error("Update swap request error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

export default router;