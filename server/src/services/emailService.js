import "dotenv/config";
import { BrevoClient } from "@getbrevo/brevo";

const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY,
});

export const sendOtpEmail = async (email, otp) => {
  const result = await brevo.transactionalEmails.sendTransacEmail({
    sender: {
      email: process.env.BREVO_SENDER_EMAIL,
      name: process.env.BREVO_SENDER_NAME || "ClothSwap",
    },

    to: [
      {
        email,
      },
    ],

    subject: "Your ClothSwap verification code",

    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: auto;">
        <h2 style="color: #20201d;">ClothSwap ♻️</h2>

        <p>Use the verification code below to verify your email address:</p>

        <div style="
          margin: 25px 0;
          padding: 18px;
          background: #f5f4ef;
          border-radius: 10px;
          text-align: center;
        ">
          <strong style="
            font-size: 32px;
            letter-spacing: 8px;
            color: #20201d;
          ">
            ${otp}
          </strong>
        </div>

        <p>This code expires in 10 minutes.</p>

        <p style="color: #777;">
          If you did not request this code, you can safely ignore this email.
        </p>

        <p>— ClothSwap Team ♻️</p>
      </div>
    `,
  });

  console.log("OTP email sent:", result.messageId);
};