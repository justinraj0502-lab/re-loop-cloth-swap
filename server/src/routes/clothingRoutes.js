import express from "express";
import Clothing from "../models/Clothing.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Create a clothing listing
router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      title,
      type,
      brand,
      size,
      condition,
      images,
      swapValue,
      location,
    } = req.body;

    if (!title || !type || !size || !condition) {
      return res.status(400).json({
        success: false,
        message: "Title, type, size and condition are required",
      });
    }

    const clothing = await Clothing.create({
      owner: req.userId,
      title,
      type,
      brand,
      size,
      condition,
      images: images || [],
      swapValue: swapValue || 0,
      location: location || "",
    });

    res.status(201).json({
      success: true,
      message: "Clothing listed successfully 👕",
      clothing,
    });
  } catch (error) {
    console.error("Create clothing error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Get all available clothing
router.get("/", async (req, res) => {
  try {
    const clothing = await Clothing.find({
      status: "available",
    })
      .populate("owner", "name location profileImage")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      clothing,
    });
  } catch (error) {
    console.error("Get clothing error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Get nearby clothing
router.get("/nearby", async (req, res) => {
  try {
    const { location } = req.query;

    if (!location || !location.trim()) {
      return res.status(400).json({
        success: false,
        message: "Location is required",
      });
    }

    /*
      Normalize the user's location.

      Example:
      "Chennai, Tamil Nadu"
      becomes:
      "Chennai, Tamil Nadu"
    */
    const normalizedLocation = location
      .trim()
      .replace(/\s*,\s*/g, ", ");

    /*
      Split into city and state.

      Example:
      "Chennai, Tamil Nadu"
      becomes:
      city  = "Chennai"
      state = "Tamil Nadu"
    */
    const locationParts = normalizedLocation
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);

    const city = locationParts[0];

    /*
      If the user has a city, match listings containing
      that city.

      This makes:
        Chennai, Tamil Nadu
        Chennai,Tamil Nadu
        Chennai, Tamil Nadu, India

      all work for the Nearby section.
    */
    const locationRegex = new RegExp(
      `^\\s*${city.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*,`,
      "i"
    );

    const listings = await Clothing.find({
      status: "available",
      location: {
        $regex: locationRegex,
      },
    })
      .populate("owner", "name email location profileImage")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      location: normalizedLocation,
      count: listings.length,
      listings,
    });
  } catch (error) {
    console.error("Nearby listings error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to find nearby listings",
    });
  }
});

// Get one clothing item by ID
router.get("/:id", async (req, res) => {
  try {
    const clothing = await Clothing.findById(req.params.id)
      .populate("owner", "name location profileImage");

    if (!clothing) {
      return res.status(404).json({
        success: false,
        message: "Clothing item not found",
      });
    }

    res.status(200).json({
      success: true,
      clothing,
    });
  } catch (error) {
    console.error("Get clothing item error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Get clothing by location
router.get("/location/:location", async (req, res) => {
  try {
    const { location } = req.params;

    const clothing = await Clothing.find({
      status: "available",
      location: {
        $regex: location,
        $options: "i",
      },
    }).populate("owner", "name email location");

    res.json({
      success: true,
      clothing,
    });
  } catch (error) {
    console.error("Location search error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to find clothes by location",
    });
  }
});

export default router;