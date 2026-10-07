import express from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import PasswordResetOTP from "../models/PasswordResetOTP.js";
import { sendOtpEmail } from "../services/emailService.js";

const router = express.Router();

// SEND PASSWORD RESET OTP
router.post("/send", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email.",
      });
    }

    // Google accounts don't have a normal password to reset
    if (user.googleId) {
      return res.status(400).json({
        success: false,
        message: "This account uses Google login. Please continue with Google.",
      });
    }

    const otp = crypto.randomInt(100000, 1000000).toString();

    await PasswordResetOTP.deleteMany({
      email: normalizedEmail,
    });

    await PasswordResetOTP.create({
      email: normalizedEmail,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    await sendOtpEmail(normalizedEmail, otp);

    res.json({
      success: true,
      message: "Password reset OTP sent successfully.",
    });
  } catch (error) {
    console.error("Password reset OTP error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to send password reset OTP.",
    });
  }
});

// VERIFY PASSWORD RESET OTP
router.post("/verify", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const otpRecord = await PasswordResetOTP.findOne({
      email: normalizedEmail,
      otp: otp.trim(),
      verified: false,
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP.",
      });
    }

    if (otpRecord.expiresAt < new Date()) {
      await PasswordResetOTP.deleteOne({
        _id: otpRecord._id,
      });

      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new OTP.",
      });
    }

    otpRecord.verified = true;
    await otpRecord.save();

    res.json({
      success: true,
      message: "OTP verified successfully.",
    });
  } catch (error) {
    console.error("Verify password reset OTP error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to verify OTP.",
    });
  }
});

// RESET PASSWORD
router.post("/reset", async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email and new password are required.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Make sure this email has a verified reset OTP
    const verifiedOTP = await PasswordResetOTP.findOne({
      email: normalizedEmail,
      verified: true,
    });

    if (!verifiedOTP) {
      return res.status(400).json({
        success: false,
        message: "Please verify the OTP before resetting your password.",
      });
    }

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    // Consume the verified OTP
    await PasswordResetOTP.deleteOne({
      _id: verifiedOTP._id,
    });

    res.json({
      success: true,
      message: "Password reset successfully.",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to reset password.",
    });
  }
});

export default router;