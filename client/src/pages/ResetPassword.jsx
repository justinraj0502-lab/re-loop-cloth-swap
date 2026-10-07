import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Lock, ShieldCheck, ArrowLeft, KeyRound } from "lucide-react";
import "./ResetPassword.css";
import API from "../api";

function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showResetForm, setShowResetForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await fetch(
        `${API}/password-reset/verify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            otp,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      alert("OTP verified successfully! ✅");
      setShowResetForm(true);
    } catch (error) {
      console.error("OTP verification error:", error);
      alert("Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await fetch(
        `${API}/password-reset/reset`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      alert("Password reset successfully! 🎉");

      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Reset password error:", error);
      alert("Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="reset-page">
        <div className="reset-card">
          <KeyRound size={40} />

          <h1>Reset password</h1>

          <p>
            Please start the password recovery process from the login page.
          </p>

          <Link to="/forgot-password" className="reset-primary-link">
            Forgot password
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-page">
      <div className="reset-card">

        <Link to="/login" className="reset-back">
          <ArrowLeft size={16} />
          Back to login
        </Link>

        <div className="reset-icon">
          {showResetForm ? (
            <Lock size={26} />
          ) : (
            <KeyRound size={26} />
          )}
        </div>

        <div className="reset-eyebrow">
          ACCOUNT RECOVERY
        </div>

        {!showResetForm ? (
          <>
            <h1>Verify your email</h1>

            <p className="reset-description">
              Enter the 6-digit code sent to your Gmail address.
            </p>

            <form onSubmit={handleVerifyOTP}>

              <div className="reset-input-group">
                <label htmlFor="otp">
                  Verification code
                </label>

                <div className="reset-input-wrapper">
                  <KeyRound size={18} />

                  <input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    maxLength="6"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, ""))
                    }
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="reset-btn"
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>

            </form>
          </>
        ) : (
          <>
            <h1>Create new password</h1>

            <p className="reset-description">
              Your email has been verified. Create a new password for your account.
            </p>

            <form onSubmit={handleResetPassword}>

              <div className="reset-input-group">
                <label htmlFor="newPassword">
                  New password
                </label>

                <div className="reset-input-wrapper">
                  <Lock size={18} />

                  <input
                    id="newPassword"
                    type="password"
                    placeholder="Minimum 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength="6"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="reset-btn"
                disabled={loading}
              >
                {loading ? "Updating..." : "Reset password"}
              </button>

            </form>
          </>
        )}

        <div className="reset-security">
          <ShieldCheck size={17} />

          <span>
            Your password reset is protected by email verification.
          </span>
        </div>

        <div className="reset-login">
          Remember your password?
          <Link to="/login"> Sign in</Link>
        </div>

      </div>
    </div>
  );
}

export default ResetPassword;