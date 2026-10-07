import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ArrowLeft, ShieldCheck, Sparkles } from "lucide-react";
import API from "../api";
import "./ForgotPassword.css";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await fetch(
        `${API}/password-reset/send`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      alert("Password reset OTP sent to your Gmail! 📧");

      navigate("/reset-password", {
        state: { email },
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      alert("Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-page">
      <div className="forgot-noise" />

      <div className="forgot-orb forgot-orb-one" />
      <div className="forgot-orb forgot-orb-two" />
      <div className="forgot-orb forgot-orb-three" />

      <div className="forgot-grid" />

      <div className="forgot-orbit orbit-one">
        <span />
      </div>

      <div className="forgot-orbit orbit-two">
        <span />
      </div>

      <div className="forgot-card">

        <div className="forgot-card-shine" />

        <div className="forgot-card-top">
          <span>RELOOP</span>
          <div className="forgot-live">
            <span className="forgot-live-dot" />
            SECURE ACCESS
          </div>
        </div>

        <Link to="/login" className="forgot-back">
          <span className="forgot-back-icon">
            <ArrowLeft size={16} />
          </span>
          <span>Back to login</span>
        </Link>

        <div className="forgot-icon-wrap">
          <div className="forgot-icon-orbit" />

          <div className="forgot-icon">
            <Mail size={26} strokeWidth={1.8} />
          </div>

          <span className="forgot-icon-spark spark-one">+</span>
          <span className="forgot-icon-spark spark-two">✦</span>
        </div>

        <div className="forgot-eyebrow">
          <Sparkles size={13} />
          ACCOUNT RECOVERY
        </div>

        <div className="forgot-heading">
          <h1>
            Forgot your
            <span> password?</span>
          </h1>

          <div className="forgot-title-line" />
        </div>

        <p className="forgot-description">
          Enter your registered Gmail address and we'll send
          you a verification code.
        </p>

        <div className="forgot-step-indicator">
          <div className="forgot-step active">
            <span>01</span>
            <div>
              <strong>Verify email</strong>
              <small>Receive your code</small>
            </div>
          </div>

          <div className="forgot-step-line" />

          <div className="forgot-step">
            <span>02</span>
            <div>
              <strong>Reset password</strong>
              <small>Create a new one</small>
            </div>
          </div>
        </div>

        <form onSubmit={handleSendOTP} className="forgot-form">

          <div className="forgot-input-group">
            <label htmlFor="email">
              Email address
            </label>

            <div className="forgot-input-wrapper">
              <div className="forgot-input-icon">
                <Mail size={18} />
              </div>

              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <span className="forgot-input-status" />
            </div>
          </div>

          <button
            type="submit"
            className="forgot-btn"
            disabled={loading}
          >
            <span className="forgot-btn-shine" />

            <span className="forgot-btn-content">
              {loading ? (
                <>
                  <span className="forgot-spinner" />
                  Sending OTP...
                </>
              ) : (
                <>
                  Send verification code
                  <span className="forgot-btn-arrow">↗</span>
                </>
              )}
            </span>
          </button>

        </form>

        <div className="forgot-security">
          <div className="forgot-security-icon">
            <ShieldCheck size={17} />
          </div>

          <div className="forgot-security-copy">
            <strong>Private & protected</strong>
            <span>
              We'll only send a code to your registered email.
            </span>
          </div>

          <div className="forgot-security-glow" />
        </div>

        <div className="forgot-register">
          <span>Remember your password?</span>
          <Link to="/login">
            Sign in
            <span className="forgot-link-arrow">→</span>
          </Link>
        </div>

        <div className="forgot-footer">
          <span>RELOOP / ACCOUNT SYSTEM</span>
          <span>SECURE • PRIVATE • VERIFIED</span>
        </div>

      </div>
    </div>
  );
}

export default ForgotPassword;