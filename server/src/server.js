import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import clothingRoutes from "./routes/clothingRoutes.js";
import swapRequestRoutes from "./routes/swapRequestRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import valueRoutes from "./routes/valueRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import adminAnalyticsRoutes from "./routes/adminAnalyticsRoutes.js";
import emailOtpRoutes from "./routes/emailOtpRoutes.js";
import passwordResetRoutes from "./routes/passwordResetRoutes.js";
import favoriteRoutes from "./routes/favoriteRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/clothing", clothingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/swap-requests", swapRequestRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/value", valueRoutes);
app.use("/api/admin/analytics", adminAnalyticsRoutes);
app.use("/api/email-otp", emailOtpRoutes);
app.use("/api/password-reset", passwordResetRoutes);
app.use("/api/favorites", favoriteRoutes);

// Home route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "ClothSwap API is running 🚀",
  });
});

app.listen(PORT, () => {
  console.log(`🚀 ClothSwap server running on port ${PORT}`);
});