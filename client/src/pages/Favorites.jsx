import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  MapPin,
  Shirt,
  Trash2,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import "./Favorites.css";

function Favorites() {
  const navigate = useNavigate();

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    const token = localStorage.getItem("clothswapToken");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/favorites",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Unable to load favorites.");
        return;
      }

      setFavorites(data.favorites || []);
    } catch (error) {
      console.error("Fetch favorites error:", error);
      alert("Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (clothingId) => {
    const token = localStorage.getItem("clothswapToken");

    if (!token || removingId) {
      return;
    }

    setRemovingId(clothingId);

    try {
      const response = await fetch(
        `http://localhost:5000/api/favorites/${clothingId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Unable to remove favorite.");
        return;
      }

      setFavorites((current) =>
        current.filter(
          (favorite) => favorite.clothing?._id !== clothingId
        )
      );
    } catch (error) {
      console.error("Remove favorite error:", error);
      alert("Unable to connect to server.");
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="favorites-loading">
        <div className="favorites-loader-wrap">
          <div className="favorites-loader-ring favorites-loader-ring-one" />
          <div className="favorites-loader-ring favorites-loader-ring-two" />

          <div className="favorites-loader-core">
            <Heart size={20} fill="currentColor" />
          </div>
        </div>

        <span className="favorites-loading-label">
          YOUR COLLECTION
        </span>

        <p>Loading favorites...</p>
      </div>
    );
  }

  return (
    <div className="favorites-page">

      {/* AMBIENT BACKGROUND */}

      <div className="favorites-noise" />

      <div className="favorites-orb favorites-orb-one" />
      <div className="favorites-orb favorites-orb-two" />
      <div className="favorites-orb favorites-orb-three" />

      <div className="favorites-grid-bg" />

      <div className="favorites-orbit favorites-orbit-one">
        <span />
      </div>

      <div className="favorites-orbit favorites-orbit-two">
        <span />
      </div>

      {/* NAVIGATION */}

      <nav className="favorites-nav">

        <Link
          to="/marketplace"
          className="favorites-back"
        >
          <span className="favorites-back-icon">
            <ArrowLeft size={17} />
          </span>

          <span>Back to marketplace</span>
        </Link>

        <Link
          className="favorites-logo"
        >
          <span className="favorites-logo-icon">
            <Shirt size={19} />
          </span>

          <span className="favorites-logo-word">
            Cloth<span>Swap</span>
          </span>
        </Link>

        <Link
          to="/create-listing"
          className="favorites-list-link"
        >
          <span>List clothing</span>
          <ArrowUpRight size={15} />
        </Link>

      </nav>

      {/* MAIN */}

      <main className="favorites-main">

        {/* HEADER */}

        <header className="favorites-heading">

          <div className="favorites-heading-copy">

            <div className="favorites-eyebrow">
              <Sparkles size={13} />
              YOUR COLLECTION
            </div>

            <div className="favorites-title-wrap">
              <h1>
                Favorites<span>.</span>
              </h1>

              <div className="favorites-title-line" />
            </div>

            <p>
              Clothes you saved for a future swap.
              <br />
              Your personal edit, all in one place.
            </p>

          </div>

          <div className="favorites-count-card">

            <div className="favorites-count-orbit" />

            <div className="favorites-count-icon">
              <Heart size={18} fill="currentColor" />
            </div>

            <div className="favorites-count-copy">
              <span>SAVED ITEMS</span>
              <strong>{favorites.length}</strong>
            </div>

            <span className="favorites-count-dot" />

          </div>

        </header>

        {/* DIVIDER */}

        <div className="favorites-divider">
          <span>CURATED BY YOU</span>
          <span>RELOOP / 01</span>
        </div>

        {/* EMPTY */}

        {favorites.length === 0 ? (
          <section className="favorites-empty">

            <div className="favorites-empty-art">

              <div className="empty-orbit empty-orbit-one" />
              <div className="empty-orbit empty-orbit-two" />

              <div className="empty-card empty-card-back">
                <Shirt size={27} />
              </div>

              <div className="empty-card empty-card-front">
                <Heart size={31} />
              </div>

              <span className="empty-spark empty-spark-one">✦</span>
              <span className="empty-spark empty-spark-two">+</span>
              <span className="empty-spark empty-spark-three">✦</span>

            </div>

            <div className="favorites-empty-copy">

              <span className="favorites-empty-eyebrow">
                NOTHING SAVED — YET
              </span>

              <h2>
                Build your
                <span> perfect edit.</span>
              </h2>

              <p>
                Save pieces that catch your eye from the marketplace.
                They'll stay here until you're ready to make a swap.
              </p>

              <Link
                to="/marketplace"
                className="browse-favorites-btn"
              >
                <span>Browse marketplace</span>

                <span className="browse-btn-arrow">
                  ↗
                </span>
              </Link>

            </div>

          </section>
        ) : (
          <section className="favorites-grid">

            {favorites.map((favorite, index) => {
              const item = favorite.clothing;

              if (!item) {
                return null;
              }

              return (
                <article
                  className="favorite-card"
                  key={favorite._id}
                  style={{
                    "--card-index": index,
                  }}
                >

                  {/* IMAGE */}

                  <Link
                    to={`/item/${item._id}`}
                    className="favorite-image"
                  >

                    <div className="favorite-image-inner">

                      {item.images?.length > 0 ? (
                        <img
                          src={item.images[0]}
                          alt={item.title}
                        />
                      ) : (
                        <div className="favorite-no-image">
                          <Shirt size={45} />
                          <span>NO IMAGE</span>
                        </div>
                      )}

                    </div>

                    <div className="favorite-image-shine" />

                    <div className="favorite-image-number">
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    <span className="favorite-type">
                      {item.type}
                    </span>

                    <span className="favorite-view">
                      <ArrowUpRight size={16} />
                    </span>

                  </Link>

                  {/* CONTENT */}

                  <div className="favorite-content">

                    <div className="favorite-title-row">

                      <div className="favorite-title-copy">

                        <Link
                          to={`/item/${item._id}`}
                          className="favorite-title"
                        >
                          {item.title}
                        </Link>

                        <p className="favorite-brand">
                          {item.brand || "Independent / No brand"}
                        </p>

                      </div>

                      <button
                        className={`remove-favorite-btn ${
                          removingId === item._id
                            ? "removing"
                            : ""
                        }`}
                        onClick={() =>
                          removeFavorite(item._id)
                        }
                        disabled={removingId === item._id}
                        aria-label="Remove from favorites"
                      >
                        {removingId === item._id ? (
                          <span className="remove-spinner" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>

                    </div>

                    <div className="favorite-meta">

                      <span>
                        <small>SIZE</small>
                        {item.size}
                      </span>

                      <span>
                        <small>CONDITION</small>
                        {item.condition}
                      </span>

                    </div>

                    <div className="favorite-bottom">

                      <div className="favorite-location">
                        <MapPin size={13} />
                        <span>
                          {item.location ||
                            "Location not specified"}
                        </span>
                      </div>

                      <div className="favorite-value">
                        <small>SWAP VALUE</small>
                        <strong>
                          ₹{item.swapValue || 0}
                        </strong>
                      </div>

                    </div>

                  </div>

                </article>
              );
            })}

          </section>
        )}

      </main>

    </div>
  );
}

export default Favorites;