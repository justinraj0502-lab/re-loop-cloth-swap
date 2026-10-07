import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Shirt,
  Tag,
  Ruler,
  Sparkles,
  MapPin,
  IndianRupee,
  Image as ImageIcon,
  CheckCircle,
} from "lucide-react";
import "./CreateListing.css";

function CreateListing() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    type: "",
    brand: "",
    size: "",
    condition: "",
    swapValue: "",
    location: "",
    image: "",
  });

  const [loading, setLoading] = useState(false);
  const [calculatingValue, setCalculatingValue] = useState(false);
  const [valueError, setValueError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const calculateSwapValue = async () => {
  if (!formData.type || !formData.condition) {
    setValueError("Select type and condition first.");
    return;
  }

  try {
    setCalculatingValue(true);
    setValueError("");

    // Our calculator API uses these category names
    const supportedCategories = [
      "T-Shirt",
      "Shirt",
      "Jeans",
      "Dress",
      "Jacket",
      "Hoodie",
    ];

    const category = supportedCategories.includes(formData.type)
      ? formData.type
      : "T-Shirt";

    // Convert Create Listing's "Excellent" to calculator's "Like New"
    const condition =
      formData.condition === "Excellent"
        ? "Like New"
        : formData.condition;

    const response = await fetch(
      "http://localhost:5000/api/value/calculate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category,
          brand: formData.brand || "Other",
          condition,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Unable to calculate value."
      );
    }

    setFormData((current) => ({
      ...current,
      swapValue: data.estimatedValue,
    }));
  } catch (error) {
    console.error("Swap value error:", error);
    setValueError("Unable to calculate swap value.");
  } finally {
    setCalculatingValue(false);
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("clothswapToken");

    if (!token) {
      alert("Please login first.");
      navigate("/login");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/clothing",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: formData.title,
            type: formData.type,
            brand: formData.brand,
            size: formData.size,
            condition: formData.condition,
            swapValue: Number(formData.swapValue) || 0,
            location: formData.location,
            images: formData.image ? [formData.image] : [],
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      alert("Clothing listed successfully! 👕♻️");
      navigate("/marketplace");

      setFormData({
        title: "",
        type: "",
        brand: "",
        size: "",
        condition: "",
        swapValue: "",
        location: "",
        image: "",
      });
    } catch (error) {
      console.error("Create listing error:", error);
      alert("Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="listing-page">

      {/* Header */}
      <header className="listing-header">
        <Link to="/marketplace" className="listing-back">
  <ArrowLeft size={18} />
  Back to marketplace
</Link>

        <div className="listing-logo">
          <div className="logo-icon">
            <Shirt size={21} />
          </div>
          <span>ClothSwap</span>
        </div>

        <div className="header-label">
          Give clothes a second life ♻️
        </div>
      </header>

      {/* Main */}
      <main className="listing-main">

        <div className="listing-heading">
          <span className="eyebrow">
            <Sparkles size={15} />
            Create a listing
          </span>

          <h1>
            List something
            <br />
            <span>worth swapping.</span>
          </h1>

          <p>
            Add your clothing details and let someone discover
            their next favourite piece.
          </p>
        </div>

        <div className="listing-layout">

          {/* Preview Card */}
          <section className="preview-card">

            <div className="preview-top">
              <span>ITEM PREVIEW</span>
              <span className="preview-status">
                <CheckCircle size={14} />
                Available
              </span>
            </div>

            <div className="image-preview">
              {formData.image ? (
                <img
                  src={formData.image}
                  alt="Clothing preview"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="empty-preview">
                  <div className="preview-icon">
                    <ImageIcon size={30} />
                  </div>

                  <h3>Your item appears here</h3>

                  <p>
                    Add an image URL to preview your clothing.
                  </p>
                </div>
              )}
            </div>

            <div className="preview-info">
              <span className="preview-category">
                {formData.type || "CATEGORY"}
              </span>

              <h2>
                {formData.title || "Your clothing item"}
              </h2>

              <div className="preview-details">
                <span>
                  {formData.brand || "Brand"}
                </span>

                <span>
                  {formData.size || "Size"}
                </span>

                <span>
                  {formData.condition || "Condition"}
                </span>
              </div>

              <div className="preview-value">
                <span>Estimated swap value</span>

                <strong>
                  ₹{formData.swapValue || "0"}
                </strong>
              </div>
            </div>
          </section>

          {/* Form */}
          <section className="form-card">

            <div className="form-title">
              <h2>Item details</h2>
              <p>Tell the community about your piece.</p>
            </div>

            <form onSubmit={handleSubmit}>

              {/* Title */}
              <div className="field-group">
                <label>Item title</label>

                <div className="input-box">
                  <Shirt size={19} />

                  <input
                    type="text"
                    name="title"
                    placeholder="e.g. Oversized Linen Shirt"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Type + Brand */}
              <div className="two-columns">

                <div className="field-group">
                  <label>Type</label>

                  <div className="input-box">
                    <Tag size={18} />

                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select type</option>
                      <option value="T-Shirt">T-Shirt</option>
                      <option value="Shirt">Shirt</option>
                      <option value="Jeans">Jeans</option>
                      <option value="Trousers">Trousers</option>
                      <option value="Dress">Dress</option>
                      <option value="Jacket">Jacket</option>
                      <option value="Skirt">Skirt</option>
                      <option value="Hoodie">Hoodie</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="field-group">
                  <label>Brand</label>

                  <div className="input-box">
                    <Sparkles size={18} />

                    <input
                      type="text"
                      name="brand"
                      placeholder="e.g. Levi's"
                      value={formData.brand}
                      onChange={handleChange}
                    />
                  </div>
                </div>

              </div>

              {/* Size + Condition */}
              <div className="two-columns">

                <div className="field-group">
                  <label>Size</label>

                  <div className="input-box">
                    <Ruler size={18} />

                    <select
                      name="size"
                      value={formData.size}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select size</option>
                      <option value="XS">XS</option>
                      <option value="S">S</option>
                      <option value="M">M</option>
                      <option value="L">L</option>
                      <option value="XL">XL</option>
                      <option value="XXL">XXL</option>
                      <option value="Free Size">Free Size</option>
                    </select>
                  </div>
                </div>

                <div className="field-group">
                  <label>Condition</label>

                  <div className="input-box">
                    <CheckCircle size={18} />

                    <select
                      name="condition"
                      value={formData.condition}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select condition</option>
                      <option value="Like New">Like New</option>
                      <option value="Excellent">Excellent</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                    </select>
                  </div>
                </div>

              </div>

              {/* Value + Location */}
              <div className="two-columns">

                <div className="field-group">
  <label>Estimated swap value</label>

  <div className="input-box">
    <IndianRupee size={18} />

    <input
      type="number"
      name="swapValue"
      placeholder="Calculate value"
      min="0"
      value={formData.swapValue}
      onChange={handleChange}
    />
  </div>

  <button
    type="button"
    className="calculate-value-btn"
    onClick={calculateSwapValue}
    disabled={calculatingValue}
  >
    {calculatingValue
      ? "Calculating..."
      : "✨ Calculate swap value"}
  </button>

  {valueError && (
    <small className="value-error-text">
      {valueError}
    </small>
  )}
</div>

                <div className="field-group">
                  <label>Location</label>

                  <div className="input-box">
                    <MapPin size={18} />

                    <input
                      type="text"
                      name="location"
                      placeholder="e.g. Chennai"
                      value={formData.location}
                      onChange={handleChange}
                    />
                  </div>
                </div>

              </div>

              {/* Image */}
              <div className="field-group">
                <label>Clothing image URL</label>

                <div className="input-box">
                  <ImageIcon size={19} />

                  <input
                    type="url"
                    name="image"
                    placeholder="https://example.com/your-clothing.jpg"
                    value={formData.image}
                    onChange={handleChange}
                  />
                </div>

                <small>
                  Paste a public image URL for now. Cloud image upload
                  can be added later.
                </small>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="create-listing-btn"
                disabled={loading}
              >
                {loading ? (
                  "Creating listing..."
                ) : (
                  <>
                    List my clothing
                    <ArrowLeft
                      size={20}
                      className="button-arrow"
                    />
                  </>
                )}
              </button>

            </form>
          </section>

        </div>
      </main>
    </div>
  );
}

export default CreateListing;