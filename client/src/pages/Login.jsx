import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Leaf,
  Users,
  Recycle,
} from "lucide-react";
import "./Login.css";
import API from "../api";

function Login() {
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // =========================================================
  // NORMAL LOGIN
  // BACKEND/API — UNCHANGED
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${API}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
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

      alert("Login successful! 🎉");

      navigate("/marketplace", {
        replace: true,
      });
    } catch (error) {
      console.error("Login error:", error);
      alert("Unable to connect to server.");
    }
  };

  // =========================================================
  // GOOGLE LOGIN
  // BACKEND/API — UNCHANGED
  // =========================================================

  const handleGoogleLogin = async (
    credentialResponse
  ) => {
    try {
      const response = await fetch(
        `${API}/auth/google`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            credential:
              credentialResponse.credential,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Google login failed."
        );
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

      alert("Google login successful! 🎉");

      navigate("/marketplace", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Google login error:",
        error
      );

      alert(
        "Unable to connect to server."
      );
    }
  };

  return (
    <main className="login-page">

      {/* =====================================================
          LEFT IMAGE / BRAND PANEL
          ===================================================== */}

      <section className="login-visual">

        {/* Background image */}
        <div className="login-image"></div>

        {/* Dark image overlay */}
        <div className="login-image-overlay"></div>

        {/* Decorative glow */}
        <div className="login-image-glow"></div>


        {/* BRAND */}

        <Link
          to="/login"
          className="login-brand"
        >
          <span className="login-brand-symbol">
            <Recycle size={21} />
          </span>

          <span className="login-brand-name">
            Cloth<span>Swap</span>
          </span>
        </Link>


        {/* TOP LABEL */}

        <div className="login-visual-label">
          <Sparkles size={13} />

          <span>
            SUSTAINABLE FASHION COMMUNITY
          </span>
        </div>


        {/* MAIN VISUAL CONTENT */}

        <div className="login-visual-content">

          <div className="login-visual-eyebrow">
            WELCOME BACK
          </div>

          <h1>
            Wear what
            <br />
            <em>matters.</em>
          </h1>

          <p>
            Discover pre-loved fashion, connect
            with your community and give every
            piece a second life.
          </p>


          {/* FEATURE CARDS */}

          <div className="login-visual-features">

            <div className="login-feature">

              <div className="login-feature-icon">
                <Leaf size={17} />
              </div>

              <div>
                <strong>
                  Better for the planet
                </strong>

                <span>
                  Give clothes a longer life.
                </span>
              </div>

            </div>


            <div className="login-feature">

              <div className="login-feature-icon">
                <Users size={17} />
              </div>

              <div>
                <strong>
                  Built around people
                </strong>

                <span>
                  Swap with your community.
                </span>
              </div>

            </div>

          </div>

        </div>


        {/* IMAGE FOOTER */}

        <div className="login-visual-footer">

          <span>01</span>

          <div className="login-visual-line"></div>

          <span>
            SWAP · SHARE · REPEAT
          </span>

        </div>

      </section>


      {/* =====================================================
          RIGHT LOGIN PANEL
          ===================================================== */}

      <section className="login-form-section">

        {/* Decorative elements */}

        <div className="login-decoration login-decoration-one"></div>

        <div className="login-decoration login-decoration-two"></div>

        <div className="login-grid"></div>


        {/* TOP NAV */}

        <div className="login-topbar">

          <span>
            New to ClothSwap?
          </span>

          <Link to="/register">
            Create account

            <ArrowRight size={14} />
          </Link>

        </div>


        {/* FORM AREA */}

        <div className="login-content">

          {/* HEADING */}

          <div className="login-heading">

            <div className="login-eyebrow">
              <span></span>
              MEMBER SIGN IN
            </div>

            <h2>
              Welcome
              <br />
              <em>back.</em>
            </h2>

            <p>
              Continue your sustainable
              fashion journey.
            </p>

          </div>


          {/* LOGIN FORM */}

          <form
            className="login-form"
            onSubmit={handleSubmit}
          >

            {/* EMAIL */}

            <div className="login-field">

              <label htmlFor="email">
                EMAIL ADDRESS
              </label>

              <div className="login-input">

                <div className="login-input-icon">
                  <Mail size={17} />
                </div>

                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />

              </div>

            </div>


            {/* PASSWORD */}

            <div className="login-field">

              <div className="login-password-heading">

                <label htmlFor="password">
                  PASSWORD
                </label>

                <Link to="/forgot-password">
                  Forgot password?
                </Link>

              </div>

              <div className="login-input">

                <div className="login-input-icon">
                  <Lock size={17} />
                </div>

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />

                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>

              </div>

            </div>


            {/* SUBMIT */}

            <button
              type="submit"
              className="login-submit"
            >

              <span>
                Sign in to ClothSwap
              </span>

              <span className="login-submit-arrow">
                <ArrowRight size={18} />
              </span>

            </button>

          </form>


          {/* DIVIDER */}

          <div className="login-divider">

            <span></span>

            <small>
              OR CONTINUE WITH
            </small>

            <span></span>

          </div>


          {/* GOOGLE LOGIN */}

          <div className="login-google">

            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => {
                console.log(
                  "Google login failed"
                );

                alert(
                  "Google login failed."
                );
              }}
              text="continue_with"
              shape="rectangular"
              size="large"
              width="400"
            />

          </div>


          {/* SECURITY CARD */}

          <div className="login-security">

            <div className="login-security-icon">
              <ShieldCheck size={17} />
            </div>

            <div className="login-security-text">

              <strong>
                Your account is protected
              </strong>

              <span>
                Your personal information
                stays secure.
              </span>

            </div>

          </div>


          {/* COMMUNITY MESSAGE */}

          <div className="login-community">

            <div className="login-community-icon">
              <Leaf size={15} />
            </div>

            <div>
              <strong>
                Good to see you again.
              </strong>

              <span>
                Ready for your next swap?
              </span>
            </div>

            <Users size={16} />

          </div>


          {/* ADMIN */}

          <Link
            to="/admin/login"
            className="login-admin"
          >
            <ShieldCheck size={13} />

            <span>
              Admin login
            </span>
          </Link>


          {/* REGISTER */}

          <div className="login-register">

            <span>
              Don't have an account?
            </span>

            <Link to="/register">
              Create one
            </Link>

          </div>


          {/* TERMS */}

          <div className="login-terms">

            By continuing, you agree to our{" "}

            <a href="#">
              Terms
            </a>

            <span> and </span>

            <a href="#">
              Privacy Policy
            </a>

            .

          </div>

        </div>

      </section>

    </main>
  );
}

export default Login;