import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import "./AdminLogin.css";
import API from "../api";

function AdminLogin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      alert("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

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
        alert(data.message || "Login failed.");
        return;
      }

      /*
       * The backend must identify this account as an admin.
       * We check the role returned by the login API.
       */
      if (data.user?.role !== "admin") {
        alert("Access denied. This account is not an admin.");
        return;
      }

      localStorage.setItem("clothswapToken", data.token);
      localStorage.setItem(
        "clothswapUser",
        JSON.stringify(data.user)
      );

      navigate("/admin", { replace: true });

    } catch (error) {
      console.error("Admin login error:", error);
      alert("Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">

      <div className="admin-login-card">

        <div className="admin-login-brand">

          <div className="admin-login-logo">
            <ShieldCheck size={25} />
          </div>

          <div>
            <strong>ClothSwap</strong>
            <span>ADMIN PORTAL</span>
          </div>

        </div>

        <div className="admin-login-heading">

          <span className="admin-login-eyebrow">
            <span></span>
            SECURE ACCESS
          </span>

          <h1>Welcome back.</h1>

          <p>
            Sign in to manage your ClothSwap community.
          </p>

        </div>

        <form
          className="admin-login-form"
          onSubmit={handleSubmit}
        >

          <div className="admin-field">

            <label>Email address</label>

            <div className="admin-input-wrapper">

              <Mail size={17} />

              <input
                type="email"
                name="email"
                placeholder="admin@example.com"
                value={formData.email}
                onChange={handleChange}
              />

            </div>

          </div>

          <div className="admin-field">

            <label>Password</label>

            <div className="admin-input-wrapper">

              <Lock size={17} />

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
              />

              <button
                type="button"
                className="admin-password-toggle"
                onClick={() =>
                  setShowPassword(!showPassword)
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

          <button
            className="admin-login-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              "Signing in..."
            ) : (
              <>
                Enter admin panel
                <ArrowRight size={17} />
              </>
            )}
          </button>

        </form>

        <div className="admin-security-note">

          <ShieldCheck size={15} />

          <span>
            Admin access is protected by role-based
            authentication.
          </span>

        </div>

        <Link
          to="/login"
          className="back-user-login"
        >
          <ArrowLeft size={15} />
          Back to user login
        </Link>

      </div>

      <div className="admin-login-footer">
        ClothSwap · Sustainable fashion exchange
      </div>

    </div>
  );
}

export default AdminLogin;