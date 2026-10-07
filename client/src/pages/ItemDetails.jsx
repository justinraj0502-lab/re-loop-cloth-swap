import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Heart,
  MapPin,
  Shirt,
  User,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import API from "../api";
import "./ItemDetails.css";

function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  useEffect(() => {
    fetchItem();
    checkFavorite();
  }, [id]);

  const fetchItem = async () => {
    try {
      const response = await fetch(
        `${API}/clothing/${id}`
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        navigate("/marketplace");
        return;
      }

      setItem(data.clothing);
    } catch (error) {
      console.error("Fetch item error:", error);
      alert("Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  const checkFavorite = async () => {
    const token = localStorage.getItem("clothswapToken");

    if (!token || !id) {
      return;
    }

    try {
      const response = await fetch(
        `${API}/favorites/${id}/check`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setLiked(data.isFavorite);
      }
    } catch (error) {
      console.error("Check favorite error:", error);
    }
  };

  const toggleFavorite = async () => {
    const token = localStorage.getItem("clothswapToken");

    if (!token) {
      alert("Please login to save favorites.");
      navigate("/login");
      return;
    }

    if (favoriteLoading) {
      return;
    }

    setFavoriteLoading(true);

    try {
      const response = await fetch(
        `${API}/favorites/${id}`,
        {
          method: liked ? "DELETE" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Unable to update favorite.");
        return;
      }

      setLiked(!liked);
    } catch (error) {
      console.error("Favorite error:", error);
      alert("Unable to connect to server.");
    } finally {
      setFavoriteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="item-loading">
        <div className="item-loader"></div>
        <p>Loading item...</p>
      </div>
    );
  }

  if (!item) {
    return null;
  }

  return (
    <div className="item-page">

      {/* Navigation */}
      <nav className="item-nav">

        <Link to="/marketplace" className="item-back">
          <ArrowLeft size={18} />
          Back to marketplace
        </Link>

        <Link to="/marketplace" className="item-logo">
          <div className="item-logo-icon">
            <Shirt size={20} />
          </div>
          ClothSwap
        </Link>

        <Link
          to="/create-listing"
          className="item-list-link"
        >
          List clothing
        </Link>

      </nav>

      {/* Main */}
      <main className="item-main">

        <div className="item-layout">

          {/* Image */}
          <section className="item-image-section">

            <div className="item-image-wrapper">

              {item.images?.length > 0 ? (
                <img
                  src={item.images[0]}
                  alt={item.title}
                />
              ) : (
                <div className="item-no-image">
                  <Shirt size={70} />
                  <p>No image available</p>
                </div>
              )}

              <button
                className={`detail-heart ${
                  liked ? "liked" : ""
                }`}
                onClick={toggleFavorite}
                disabled={favoriteLoading}
                aria-label={
                  liked
                    ? "Remove from favorites"
                    : "Add to favorites"
                }
              >
                <Heart
                  size={21}
                  fill={liked ? "currentColor" : "none"}
                />
              </button>

              <span className="detail-available">
                Available for swap
              </span>

            </div>

            <div className="image-note">
              <ShieldCheck size={17} />
              Swap safely through the ClothSwap community
            </div>

          </section>

          {/* Details */}
          <section className="item-details">

            <span className="detail-category">
              {item.type}
            </span>

            <h1>{item.title}</h1>

            <p className="detail-brand">
              {item.brand || "Independent / No brand"}
            </p>

            <div className="detail-location">
              <MapPin size={17} />
              <span>
                {item.location || "Location not specified"}
              </span>
            </div>

            {/* Value */}
            <div className="swap-value-card">

              <div>
                <span>ESTIMATED SWAP VALUE</span>
                <strong>
                  ₹{item.swapValue || 0}
                </strong>
              </div>

              <div className="value-icon">
                <Sparkles size={22} />
              </div>

            </div>

            {/* Specs */}
            <div className="spec-section">

              <h3>Item details</h3>

              <div className="spec-grid">

                <div className="spec">
                  <span>SIZE</span>
                  <strong>{item.size}</strong>
                </div>

                <div className="spec">
                  <span>CONDITION</span>
                  <strong>{item.condition}</strong>
                </div>

                <div className="spec">
                  <span>CATEGORY</span>
                  <strong>{item.type}</strong>
                </div>

                <div className="spec">
                  <span>STATUS</span>
                  <strong>Available</strong>
                </div>

              </div>

            </div>

            {/* Owner */}
            <div className="owner-section">

              <div className="owner-avatar">
                <User size={22} />
              </div>

              <div className="owner-info">
                <span>LISTED BY</span>
                <strong>
                  {item.owner?.name || "ClothSwap member"}
                </strong>

                <small>
                  <MapPin size={12} />
                  {item.owner?.location ||
                    item.location ||
                    "Location not specified"}
                </small>
              </div>

            </div>

            {/* Request */}
            <button
              className="request-swap-btn"
              onClick={() =>
                navigate(`/request-swap/${item._id}`)
              }
            >
              Request a swap
              <ArrowRight size={20} />
            </button>

            <p className="swap-note">
              No money changes hands. You offer another clothing
              item in exchange.
            </p>

          </section>

        </div>

      </main>

    </div>
  );
}

export default ItemDetails;