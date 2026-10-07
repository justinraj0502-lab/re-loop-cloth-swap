import mongoose from "mongoose";

const clothingSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      required: true,
      trim: true,
    },

    brand: {
      type: String,
      default: "",
      trim: true,
    },

    size: {
      type: String,
      required: true,
    },

    condition: {
      type: String,
      required: true,
    },

    images: {
      type: [String],
      default: [],
    },

    swapValue: {
      type: Number,
      default: 0,
    },

    location: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: ["available", "swapped", "unavailable"],
      default: "available",
    },
  },
  {
    timestamps: true,
  }
);

const Clothing = mongoose.model("Clothing", clothingSchema);

export default Clothing;