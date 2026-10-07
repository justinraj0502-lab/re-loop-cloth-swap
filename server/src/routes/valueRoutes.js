import express from "express";

const router = express.Router();

router.post("/calculate", (req, res) => {
  try {
    const {
      category,
      brand,
      condition,
    } = req.body;

    if (!category || !condition) {
      return res.status(400).json({
        success: false,
        message: "Category and condition are required",
      });
    }

    // Base value based on clothing category
    const categoryValues = {
      "T-Shirt": 500,
      Shirt: 700,
      Jeans: 900,
      Dress: 1200,
      Jacket: 1500,
      Hoodie: 1000,
    };

    // Brand multiplier
    const brandValues = {
  Nike: 1.4,
  Adidas: 1.35,
  Puma: 1.3,
  "Levi's": 1.45,
  "H&M": 1.15,
  Zara: 1.25,
  Uniqlo: 1.2,
  "Louis Vuitton": 2.5,
  Gucci: 2.5,
  Other: 1,
};

    // Condition multiplier
    const conditionValues = {
      New: 1.0,
      "Like New": 0.9,
      Good: 0.7,
      Fair: 0.5,
    };

    const baseValue = categoryValues[category] || 600;
    const brandMultiplier = brandValues[brand] || 1;
    const conditionMultiplier = conditionValues[condition] || 0.5;

    const estimatedValue = Math.round(
      baseValue * brandMultiplier * conditionMultiplier
    );

    res.json({
      success: true,
      estimatedValue,
      breakdown: {
        baseValue,
        brandMultiplier,
        conditionMultiplier,
      },
    });
  } catch (error) {
    console.error("Value calculation error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to calculate swap value",
    });
  }
});

export default router;