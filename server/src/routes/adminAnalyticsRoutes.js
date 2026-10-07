import express from "express";
import User from "../models/User.js";
import Clothing from "../models/Clothing.js";
import SwapRequest from "../models/SwapRequest.js";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const totalUsers = await User.countDocuments();

      const totalListings = await Clothing.countDocuments();

      const totalSwaps = await SwapRequest.countDocuments();

      const pendingSwaps = await SwapRequest.countDocuments({
        status: "pending",
      });

      const acceptedSwaps = await SwapRequest.countDocuments({
        status: { $in: ["accepted", "completed"] },
      });

      const rejectedSwaps = await SwapRequest.countDocuments({
        status: { $in: ["rejected", "cancelled"] },
      });

      const successRate =
        totalSwaps > 0
          ? Math.round((acceptedSwaps / totalSwaps) * 100)
          : 0;

      res.json({
        success: true,
        analytics: {
          totalUsers,
          totalListings,
          totalSwaps,
          pendingSwaps,
          acceptedSwaps,
          rejectedSwaps,
          successRate,
        },
      });
    } catch (error) {
      console.error("Admin analytics error:", error);

      res.status(500).json({
        success: false,
        message: "Unable to load analytics",
      });
    }
  }
);

export default router;