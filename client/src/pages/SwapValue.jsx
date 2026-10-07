import { useState } from "react";
import { ArrowLeft, Calculator, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import "./SwapValue.css";
import API from "../api";

function SwapValue() {
  const [formData, setFormData] = useState({
    category: "",
    brand: "Other",
    condition: "",
  });

  const [estimatedValue, setEstimatedValue] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setEstimatedValue(null);
    setError("");
  };

  const calculateValue = async (e) => {
    e.preventDefault();

    if (!formData.category || !formData.condition) {
      setError("Please select a category and condition.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API}/value/calculate`,
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
        throw new Error(data.message || "Unable to calculate value.");
      }

      setEstimatedValue(data.estimatedValue);
    } catch (error) {
      console.error("Calculator error:", error);
      setError(error.message || "Unable to calculate swap value.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="swap-value-page">
      <header className="value-header">
        <Link to="/marketplace" className="value-back">
          <ArrowLeft size={18} />
          Marketplace
        </Link>

        <Link to="/marketplace" className="value-logo">
          <span className="value-logo-mark">♻</span>
          <span>ClothSwap</span>
        </Link>

        <div className="value-header-space"></div>
      </header>

      <main className="value-container">
        <section className="value-intro">
          <span className="value-eyebrow">
            <Sparkles size={15} />
            SMART SWAP TOOL
          </span>

          <h1>
            Know the value
            <br />
            before you swap.
          </h1>

          <p>
            Get a quick estimated swap value based on the clothing
            category, brand, and condition.
          </p>
        </section>

        <section className="value-card">
          <div className="value-card-heading">
            <div className="calculator-icon">
              <Calculator size={22} />
            </div>

            <div>
              <h2>Swap value calculator</h2>
              <p>Enter your item's details below.</p>
            </div>
          </div>

          <form onSubmit={calculateValue}>
            <div className="value-field">
              <label>Clothing category</label>

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="">Select category</option>
                <option value="T-Shirt">T-Shirt</option>
                <option value="Shirt">Shirt</option>
                <option value="Jeans">Jeans</option>
                <option value="Dress">Dress</option>
                <option value="Jacket">Jacket</option>
                <option value="Hoodie">Hoodie</option>
              </select>
            </div>

            <div className="value-field">
              <label>Brand</label>

              <select
                name="brand"
                value={formData.brand}
                onChange={handleChange}
              >
                <option value="Other">Other / Unbranded</option>
                <option value="Nike">Nike</option>
                <option value="Adidas">Adidas</option>
                <option value="Puma">Puma</option>
                <option value="Levi's">Levi's</option>
                <option value="H&M">H&M</option>
                <option value="Zara">Zara</option>
                <option value="Uniqlo">Uniqlo</option>
                <option value="Louis Vuitton">Louis Vuitton</option>
                <option value="Gucci">Gucci</option>
              </select>
            </div>

            <div className="value-field">
              <label>Condition</label>

              <select
                name="condition"
                value={formData.condition}
                onChange={handleChange}
              >
                <option value="">Select condition</option>
                <option value="New">New</option>
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
              </select>
            </div>

            {error && <p className="value-error">{error}</p>}

            <button
              type="submit"
              className="calculate-btn"
              disabled={loading}
            >
              <Calculator size={18} />

              {loading ? "Calculating..." : "Calculate swap value"}
            </button>
          </form>

          {estimatedValue !== null && (
            <div className="value-result">
              <span>Estimated swap value</span>

              <strong>₹{estimatedValue.toLocaleString("en-IN")}</strong>

              <p>
                This is an estimated exchange value, not a selling price.
              </p>
            </div>
          )}
        </section>

        <div className="value-note">
          <strong>How it works</strong>
          <p>
            The estimate combines category, brand, and condition
            factors to create a fair starting point for your swap.
          </p>
        </div>
      </main>
    </div>
  );
}

export default SwapValue;