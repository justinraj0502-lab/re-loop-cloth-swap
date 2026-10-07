import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    clothing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clothing",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

favoriteSchema.index({ user: 1, clothing: 1 }, { unique: true });

const Favorite = mongoose.model("Favorite", favoriteSchema);

export default Favorite;