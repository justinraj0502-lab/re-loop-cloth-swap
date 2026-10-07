import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  MapPin,
  ArrowRight,
  RefreshCw,
  Globe2,
  Leaf,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import "./Register.css";
import API from "../api";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    location: "",
  });

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const post = (path, body) =>
    fetch(`${API}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // STEP 1: SEND OTP
      if (!otpSent) {
        const response = await post("/email-otp/send", {
          email: formData.email,
        });

        const data = await response.json();

        if (!response.ok) {
          alert(data.message);
          return;
        }

        setOtpSent(true);
        alert("OTP sent to your email! 📧");
        return;
      }

      // STEP 2: VERIFY OTP
      const verifyResponse = await post("/email-otp/verify", {
        email: formData.email,
        otp,
      });

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok) {
        alert(verifyData.message);
        return;
      }

      // STEP 3: CREATE ACCOUNT
      const registerResponse = await post(
        "/auth/register",
        formData
      );

      const registerData = await registerResponse.json();

      if (!registerResponse.ok) {
        alert(registerData.message);
        return;
      }

      alert("Account created successfully! 🎉");

      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      console.error("Registration error:", error);
      alert("Unable to connect to server.");
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await post("/auth/google", {
        credential: credentialResponse.credential,
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Google registration failed.");
        return;
      }

      localStorage.setItem(
        "clothswapToken",
        data.token
      );

      localStorage.setItem(
        "clothswapUser",
        JSON.stringify(data.user)
      );

      alert("Google account connected successfully! 🎉");

      navigate("/marketplace", {
        replace: true,
      });
    } catch (error) {
      console.error("Google registration error:", error);
      alert("Unable to connect to server.");
    }
  };

  return (
    <div className="register-page">

      {/* ================= BACKGROUND DECORATION ================= */}

      <div className="register-orb register-orb-one" />
      <div className="register-orb register-orb-two" />
      <div className="register-grid" />

      {/* =========================================================
          LEFT — REGISTER AREA
      ========================================================= */}

      <section className="form-section">

        <div className="form-container">

          {/* BRAND */}

          <Link to="/register" className="brand-logo">

            <span className="logo-mark">
              <RefreshCw
                size={16}
                strokeWidth={2.5}
              />
            </span>

            <span className="logo-word">
              RE<span>LOOP</span>
            </span>

          </Link>

          {/* INTRO */}

          <div className="form-intro">

            <div className="form-kicker">

              <span className="kicker-number">
                01
              </span>

              <span className="form-kicker-line" />

              <span>
                JOIN THE LOOP
              </span>

            </div>

            <h1>
              Create your
              <br />
              <span>Re-loop account.</span>
            </h1>

            <p className="form-description">
              Swap better. Discover more. Give your
              wardrobe another story.
            </p>

          </div>

          {/* REGISTER FORM */}

          <form
            onSubmit={handleSubmit}
            className="register-form"
          >

            {/* NAME */}

            <div className="input-group">

              <label htmlFor="register-name">
                Full name
              </label>

              <div className="input-with-icon">

                <div className="input-icon">
                  <User size={17} />
                </div>

                <input
                  id="register-name"
                  type="text"
                  name="name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />

              </div>

            </div>

            {/* EMAIL */}

            <div className="input-group">

              <label htmlFor="register-email">
                Email address
              </label>

              <div className="input-with-icon">

                <div className="input-icon">
                  <Mail size={17} />
                </div>

                <input
                  id="register-email"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />

              </div>

            </div>

            {/* OTP */}

            {otpSent && (
              <div className="otp-panel">

                <div className="otp-header">

                  <div className="otp-icon">
                    <ShieldCheck size={17} />
                  </div>

                  <div className="otp-copy">
                    <strong>
                      Check your inbox
                    </strong>

                    <span>
                      Enter the 6-digit verification code.
                    </span>
                  </div>

                  <span className="otp-pulse" />

                </div>

                <div className="input-with-icon">

                  <div className="input-icon">
                    <Lock size={17} />
                  </div>

                  <input
                    id="register-otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    aria-label="Verification code"
                    value={otp}
                    onChange={(e) =>
                      setOtp(
                        e.target.value.replace(/\D/g, "")
                      )
                    }
                    required
                  />

                </div>

              </div>
            )}

            {/* PASSWORD + LOCATION */}

            <div className="input-row">

              <div className="input-group">

                <label htmlFor="register-password">
                  Password
                </label>

                <div className="input-with-icon">

                  <div className="input-icon">
                    <Lock size={17} />
                  </div>

                  <input
                    id="register-password"
                    type="password"
                    name="password"
                    placeholder="Min. 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    minLength={6}
                    required
                  />

                </div>

              </div>

              <div className="input-group">

                <label htmlFor="register-location">
                  Location
                </label>

                <div className="input-with-icon">

                  <div className="input-icon">
                    <MapPin size={17} />
                  </div>

                  <input
                    id="register-location"
                    type="text"
                    name="location"
                    placeholder="e.g. Chennai"
                    value={formData.location}
                    onChange={handleChange}
                  />

                </div>

              </div>

            </div>

            {/* SUBMIT */}

            <button
              type="submit"
              className="create-account-btn"
            >

              <span className="button-shine" />

              <span className="button-text">
                {otpSent
                  ? "Verify & create account"
                  : "Send verification code"}
              </span>

              <span className="button-arrow">
                <ArrowRight size={17} />
              </span>

            </button>

          </form>

          {/* DIVIDER */}

          <div className="divider">

            <span />

            <small>
              or continue with
            </small>

            <span />

          </div>

          {/* GOOGLE */}

          <div className="google-register-wrapper">

            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                console.log(
                  "Google registration failed"
                );

                alert(
                  "Google registration failed."
                );
              }}
              text="continue_with"
              shape="pill"
              size="large"
              width="340"
            />

          </div>

          {/* LOGIN */}

          <div className="bottom-login">

            <span>
              Already have an account?
            </span>

            <Link to="/login">
              Sign in
            </Link>

          </div>

          {/* TERMS */}

          <p className="terms">
            By creating an account, you agree to our{" "}
            <a href="#">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#">
              Privacy Policy
            </a>
            .
          </p>

          {/* SECURITY */}

          <div className="form-trust">

            <ShieldCheck size={14} />

            <span>
              Your details stay secure with Re-loop.
            </span>

          </div>

        </div>

      </section>

      {/* =========================================================
          RIGHT — IMAGE / BRAND STORY AREA
      ========================================================= */}

      <section className="hero-section">

        <div className="hero-image-shell">

          {/* YOUR EXISTING IMAGE */}

          <img
            src="/fashion-hero.png"
            alt="Re-loop fashion"
            className="hero-image"
          />

          {/* IMAGE OVERLAY */}

          <div className="hero-overlay" />

          {/* TOP BRAND */}

          <div className="hero-top">

            <div className="hero-brand-mini">

              <span className="mini-logo">
                <RefreshCw
                  size={15}
                  strokeWidth={2.4}
                />
              </span>

              <span>
                RE<span>LOOP</span>
              </span>

            </div>

            <div className="hero-status">
              <span />
              CIRCULAR STYLE
            </div>

          </div>

          {/* MAIN TEXT */}

          <div className="hero-content">

            <div className="hero-eyebrow">

              <span className="eyebrow-dot" />

              <Sparkles size={13} />

              <span>
                THE FUTURE OF SHARED STYLE
              </span>

            </div>

            <h2>
              Wear a story.
              <br />
              <span>Then pass it on.</span>
            </h2>

            <p className="hero-description">
              Re-loop turns pre-loved fashion into
              something new again — one swap, one
              person, one story at a time.
            </p>

            {/* FEATURES */}

            <div className="hero-features">

              <div className="feature">

                <div className="feature-icon">
                  <RefreshCw size={17} />
                </div>

                <div className="feature-copy">
                  <strong>
                    Keep it moving
                  </strong>

                  <small>
                    Give great clothes another chapter.
                  </small>
                </div>

                <span className="feature-number">
                  01
                </span>

              </div>

              <div className="feature">

                <div className="feature-icon">
                  <Globe2 size={17} />
                </div>

                <div className="feature-copy">
                  <strong>
                    Find your people
                  </strong>

                  <small>
                    Discover style within your community.
                  </small>
                </div>

                <span className="feature-number">
                  02
                </span>

              </div>

              <div className="feature">

                <div className="feature-icon">
                  <Leaf size={17} />
                </div>

                <div className="feature-copy">
                  <strong>
                    Choose differently
                  </strong>

                  <small>
                    Make fashion a little more circular.
                  </small>
                </div>

                <span className="feature-number">
                  03
                </span>

              </div>

            </div>

          </div>

          {/* IMAGE FOOTER */}

          <div className="hero-footer">

            <span>
              STYLE HAS NO EXPIRY DATE.
            </span>

            <span className="hero-footer-line" />

            <span>
              RE-LOOP IT.
            </span>

          </div>

        </div>

      </section>

    </div>
  );
}

export default Register;