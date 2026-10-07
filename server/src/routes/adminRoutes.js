import express from "express";
import User from "../models/User.js";
import Clothing from "../models/Clothing.js";
import SwapRequest from "../models/SwapRequest.js";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

// All admin routes require login + admin role
router.use(authMiddleware);
router.use(adminMiddleware);

// Dashboard statistics
router.get("/stats", async (req, res) => {
  try {
    const [
      totalUsers,
      totalListings,
      totalSwaps,
      pendingSwaps,
    ] = await Promise.all([
      User.countDocuments(),
      Clothing.countDocuments(),
      SwapRequest.countDocuments(),
      SwapRequest.countDocuments({ status: "pending" }),
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalListings,
        totalSwaps,
        pendingSwaps,
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch admin statistics",
    });
  }
});

// Get all users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Admin users error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch users",
    });
  }
});

// Get all clothing listings
router.get("/listings", async (req, res) => {
  try {
    const listings = await Clothing.find()
      .populate("owner", "name email location")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      listings,
    });
  } catch (error) {
    console.error("Admin listings error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch listings",
    });
  }
});

// Get all swap requests
router.get("/swaps", async (req, res) => {
  try {
    const swaps = await SwapRequest.find()
      .populate("requester", "name email")
      .populate("receiver", "name email")
      .populate("offeredItem", "title type")
      .populate("requestedItem", "title type")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      swaps,
    });
  } catch (error) {
    console.error("Admin swaps error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch swap requests",
    });
  }
});

router.delete("/listings/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const listing = await Clothing.findById(id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    await Clothing.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Listing removed successfully",
    });
  } catch (error) {
    console.error("Admin delete listing error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to remove listing",
    });
  }
});

export default router;