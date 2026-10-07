import express from "express";
import Favorite from "../models/Favorite.js";
import Clothing from "../models/Clothing.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/* =========================
   ADD FAVORITE
========================= */

router.post("/:clothingId", authMiddleware, async (req, res) => {
  try {
    const { clothingId } = req.params;

    const clothing = await Clothing.findById(clothingId);

    if (!clothing) {
      return res.status(404).json({
        success: false,
        message: "Clothing item not found",
      });
    }

    const existingFavorite = await Favorite.findOne({
      user: req.userId,
      clothing: clothingId,
    });

    if (existingFavorite) {
      return res.status(400).json({
        success: false,
        message: "Item already added to favorites",
      });
    }

    const favorite = await Favorite.create({
      user: req.userId,
      clothing: clothingId,
    });

    res.status(201).json({
      success: true,
      message: "Added to favorites",
      favorite,
    });
  } catch (error) {
    console.error("Add favorite error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to add favorite",
    });
  }
});

/* =========================
   REMOVE FAVORITE
========================= */

router.delete("/:clothingId", authMiddleware, async (req, res) => {
  try {
    const { clothingId } = req.params;

    const favorite = await Favorite.findOneAndDelete({
      user: req.userId,
      clothing: clothingId,
    });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: "Favorite not found",
      });
    }

    res.json({
      success: true,
      message: "Removed from favorites",
    });
  } catch (error) {
    console.error("Remove favorite error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to remove favorite",
    });
  }
});

/* =========================
   CHECK FAVORITE
========================= */

router.get("/:clothingId/check", authMiddleware, async (req, res) => {
  try {
    const { clothingId } = req.params;

    const favorite = await Favorite.findOne({
      user: req.userId,
      clothing: clothingId,
    });

    res.json({
      success: true,
      isFavorite: !!favorite,
    });
  } catch (error) {
    console.error("Check favorite error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to check favorite",
    });
  }
});

/* =========================
   GET MY FAVORITES
========================= */

router.get("/", authMiddleware, async (req, res) => {
  try {
    const favorites = await Favorite.find({
      user: req.userId,
    })
      .populate({
        path: "clothing",
        populate: {
          path: "owner",
          select: "name email location profileImage",
        },
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      favorites,
    });
  } catch (error) {
    console.error("Get favorites error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load favorites",
    });
  }
});

export default router;