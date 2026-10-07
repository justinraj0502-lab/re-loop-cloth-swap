import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  MapPin,
  Heart,
  Shirt,
  SlidersHorizontal,
  ArrowRight,
  Sparkles,
  X,
  MoveRight,
  ChevronDown,
} from "lucide-react";
import API from "../api";
import "./Marketplace.css";

const heroImages = [
  "/girl-model.png",
  "/girl-model-2.png",
  "/girl-model-3.png",
];

function Marketplace() {
  const navigate = useNavigate();

  const [clothing, setClothing] = useState([]);
  const [filteredClothing, setFilteredClothing] = useState([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("All");
  const [size, setSize] = useState("All");
  const [condition, setCondition] = useState("All");
  const [valueRange, setValueRange] = useState("All");
  const [locationFilter, setLocationFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [nearbyListings, setNearbyListings] = useState([]);
  const [filteredNearbyListings, setFilteredNearbyListings] = useState([]);
  const [nearbyLoading, setNearbyLoading] = useState(true);
  const [userLocation, setUserLocation] = useState("");
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [favoriteLoading, setFavoriteLoading] = useState(null);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);
  const [mousePosition, setMousePosition] = useState({
    x: 0,
    y: 0,
  });

  const heroRef = useRef(null);

  const loadNearbyListings = async () => {
    try {
      const storedUser = localStorage.getItem("clothswapUser");

      if (!storedUser) {
        setNearbyLoading(false);
        return;
      }

      const user = JSON.parse(storedUser);
      const location = user.location?.trim();

      if (!location) {
        setNearbyLoading(false);
        return;
      }

      setUserLocation(location);

      const response = await fetch(
        `${API}/clothing/nearby?location=${encodeURIComponent(
          location
        )}`
      );

      const data = await response.json();

      if (response.ok) {
        setNearbyListings(data.listings || []);
      }
    } catch (error) {
      console.error("Nearby listings error:", error);
    } finally {
      setNearbyLoading(false);
    }
  };

  useEffect(() => {
    loadNearbyListings();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex(
        (current) => (current + 1) % heroImages.length
      );
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchClothing();

    const savedUser = localStorage.getItem("clothswapUser");

    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("User data error:", error);
      }
    }

    loadFavorites();

    const timer = setTimeout(() => {
      setHeroVisible(true);
    }, 120);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleMouseMove = (event) => {
      if (!heroRef.current) return;

      const rect = heroRef.current.getBoundingClientRect();

      const x =
        ((event.clientX - rect.left) / rect.width - 0.5) * 2;

      const y =
        ((event.clientY - rect.top) / rect.height - 0.5) * 2;

      setMousePosition({
        x,
        y,
      });
    };

    const handleMouseLeave = () => {
      setMousePosition({
        x: 0,
        y: 0,
      });
    };

    const hero = heroRef.current;

    if (hero) {
      hero.addEventListener("mousemove", handleMouseMove);
      hero.addEventListener("mouseleave", handleMouseLeave);
    }

    return () => {
      if (hero) {
        hero.removeEventListener(
          "mousemove",
          handleMouseMove
        );

        hero.removeEventListener(
          "mouseleave",
          handleMouseLeave
        );
      }
    };
  }, [heroVisible]);

  useEffect(() => {
    const revealItems = document.querySelectorAll(
      ".reveal-on-scroll"
    );

    if (!revealItems.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    revealItems.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, [
    loading,
    filteredClothing.length,
    filteredNearbyListings.length,
  ]);

  const loadFavorites = async () => {
    const token = localStorage.getItem("clothswapToken");

    if (!token) {
      setFavoriteIds([]);
      return;
    }

    try {
      const response = await fetch(
        `${API}/favorites`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return;
      }

      const ids = (data.favorites || [])
        .map((favorite) => favorite.clothing?._id)
        .filter(Boolean);

      setFavoriteIds(ids);
    } catch (error) {
      console.error("Load favorites error:", error);
    }
  };

  const toggleFavorite = async (clothingId) => {
    const token = localStorage.getItem("clothswapToken");

    if (!token) {
      navigate("/login");
      return;
    }

    if (favoriteLoading) {
      return;
    }

    const isFavorite = favoriteIds.includes(clothingId);

    setFavoriteLoading(clothingId);

    try {
      const response = await fetch(
        `${API}/favorites/${clothingId}`,
        {
          method: isFavorite ? "DELETE" : "POST",
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

      setFavoriteIds((current) => {
        if (isFavorite) {
          return current.filter(
            (id) => id !== clothingId
          );
        }

        return [...current, clothingId];
      });
    } catch (error) {
      console.error("Toggle favorite error:", error);
      alert("Unable to connect to server.");
    } finally {
      setFavoriteLoading(null);
    }
  };

  useEffect(() => {
    filterClothing();
  }, [
    search,
    type,
    size,
    condition,
    valueRange,
    locationFilter,
    sortBy,
    clothing,
  ]);

  useEffect(() => {
    filterNearbyListings();
  }, [
    search,
    type,
    size,
    condition,
    valueRange,
    locationFilter,
    sortBy,
    nearbyListings,
  ]);

  const fetchClothing = async () => {
    try {
      const response = await fetch(
        `${API}/clothing`
      );

      const data = await response.json();

      if (response.ok) {
        setClothing(data.clothing);
      }
    } catch (error) {
      console.error("Fetch clothing error:", error);
    } finally {
      setLoading(false);
    }
  };

  const hasActiveFilters =
    search.trim() !== "" ||
    type !== "All" ||
    size !== "All" ||
    condition !== "All" ||
    valueRange !== "All" ||
    locationFilter.trim() !== "";

  const activeFilterCount = [
    type !== "All",
    size !== "All",
    condition !== "All",
    valueRange !== "All",
    locationFilter.trim() !== "",
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSearch("");
    setType("All");
    setSize("All");
    setCondition("All");
    setValueRange("All");
    setLocationFilter("");
    setSortBy("newest");
  };

  const filterClothing = () => {
    let result = [...clothing];

    if (search.trim()) {
      result = result.filter((item) =>
        `${item.title} ${item.brand} ${item.type}`
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    }

    if (type !== "All") {
      result = result.filter(
        (item) => item.type === type
      );
    }

    if (size !== "All") {
      result = result.filter(
        (item) => item.size === size
      );
    }

    if (condition !== "All") {
      result = result.filter(
        (item) => item.condition === condition
      );
    }

    if (valueRange !== "All") {
      result = result.filter((item) => {
        const value = Number(item.swapValue || 0);

        if (valueRange === "under500") return value < 500;

        if (valueRange === "500-1000") {
          return value >= 500 && value <= 1000;
        }

        if (valueRange === "1000-1500") {
          return value > 1000 && value <= 1500;
        }

        if (valueRange === "above1500") {
          return value > 1500;
        }

        return true;
      });
    }

    if (locationFilter.trim()) {
      result = result.filter((item) =>
        item.location
          ?.toLowerCase()
          .includes(locationFilter.toLowerCase())
      );
    }

    if (sortBy === "newest") {
      result.sort(
        (a, b) =>
          new Date(b.createdAt || 0) -
          new Date(a.createdAt || 0)
      );
    }

    if (sortBy === "lowValue") {
      result.sort(
        (a, b) =>
          Number(a.swapValue || 0) -
          Number(b.swapValue || 0)
      );
    }

    if (sortBy === "highValue") {
      result.sort(
        (a, b) =>
          Number(b.swapValue || 0) -
          Number(a.swapValue || 0)
      );
    }

    if (sortBy === "name") {
      result.sort((a, b) =>
        (a.title || "").localeCompare(
          b.title || ""
        )
      );
    }

    setFilteredClothing(result);
  };

  const filterNearbyListings = () => {
    let result = [...nearbyListings];

    if (search.trim()) {
      result = result.filter((item) =>
        `${item.title} ${item.brand} ${item.type}`
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    }

    if (type !== "All") {
      result = result.filter(
        (item) => item.type === type
      );
    }

    if (size !== "All") {
      result = result.filter(
        (item) => item.size === size
      );
    }

    if (condition !== "All") {
      result = result.filter(
        (item) => item.condition === condition
      );
    }

    if (valueRange !== "All") {
      result = result.filter((item) => {
        const value = Number(item.swapValue || 0);

        if (valueRange === "under500") {
          return value < 500;
        }

        if (valueRange === "500-1000") {
          return value >= 500 && value <= 1000;
        }

        if (valueRange === "1000-1500") {
          return value > 1000 && value <= 1500;
        }

        if (valueRange === "above1500") {
          return value > 1500;
        }

        return true;
      });
    }

    if (locationFilter.trim()) {
      result = result.filter((item) =>
        item.location
          ?.toLowerCase()
          .includes(locationFilter.toLowerCase())
      );
    }

    if (sortBy === "newest") {
      result.sort(
        (a, b) =>
          new Date(b.createdAt || 0) -
          new Date(a.createdAt || 0)
      );
    }

    if (sortBy === "lowValue") {
      result.sort(
        (a, b) =>
          Number(a.swapValue || 0) -
          Number(b.swapValue || 0)
      );
    }

    if (sortBy === "highValue") {
      result.sort(
        (a, b) =>
          Number(b.swapValue || 0) -
          Number(a.swapValue || 0)
      );
    }

    if (sortBy === "name") {
      result.sort((a, b) =>
        (a.title || "").localeCompare(
          b.title || ""
        )
      );
    }

    setFilteredNearbyListings(result);
  };

  return (
    <div className="marketplace-page">

      {/* ================= NAVIGATION ================= */}

      <nav className="market-nav">

        <Link
          to="/marketplace"
          className="market-logo"
        >
          <div className="market-logo-icon">
            <Shirt size={19} />
          </div>

          <span>ClothSwap</span>
        </Link>

        <div className="market-nav-links">

          <Link
            to="/marketplace"
            className="active-nav"
          >
            Discover
          </Link>

          <Link
            to="/favorites"
            className="favorites-nav-link"
          >
            <Heart size={16} />
            Favorites
          </Link>

          <Link to="/create-listing">
            List clothing
          </Link>

        </div>

        <div className="market-nav-actions">

          <button
            className="dashboard-nav-btn"
            onClick={() => navigate("/dashboard")}
          >
            Dashboard
          </button>

          <Link
            to="/create-listing"
            className="nav-list-btn"
          >
            <Plus size={16} />
            List an item
          </Link>

        </div>

      </nav>

      {/* ================= HERO ================= */}

      <section
        className={`market-hero ${
          heroVisible ? "hero-visible" : ""
        }`}
        ref={heroRef}
      >

        <div className="hero-grid-lines"></div>

        <div
          className="hero-orbit hero-orbit-one"
          style={{
            transform: `translate3d(${mousePosition.x * 16}px, ${
              mousePosition.y * 16
            }px, 0)`,
          }}
        />

        <div
          className="hero-orbit hero-orbit-two"
          style={{
            transform: `translate3d(${mousePosition.x * -12}px, ${
              mousePosition.y * -12
            }px, 0)`,
          }}
        />

        <div className="market-hero-content">

          <span className="market-eyebrow">

            <span className="green-dot"></span>

            Sustainable fashion marketplace

          </span>

          <div className="hero-title-wrap">

            <h1>

              <span className="hero-line">
                Find your next
              </span>

              <span className="hero-line hero-accent-line">

                <span>favourite</span>

                <em> piece.</em>

              </span>

            </h1>

            <span className="hero-number">
              
            </span>

          </div>

          <p className="hero-description">
            Discover pre-loved clothing from people in
            your community. Swap what you have for
            something you love.
          </p>

          <div className="hero-actions">

            <Link
              to="/create-listing"
              className="hero-list-btn"
            >
              <Plus size={18} />
              List your clothing
              <ArrowRight size={17} />
            </Link>

            <a
              href="#discover"
              className="hero-scroll-link"
            >
              Scroll to discover
              <MoveRight size={17} />
            </a>

          </div>

        </div>

        <div
          className="hero-fashion-stage"
          style={{
            transform: `translate3d(${mousePosition.x * 10}px, ${
              mousePosition.y * 10
            }px, 0)`,
          }}
        >

          <div className="hero-fashion-frame">

            <div className="hero-fashion-inner">

              <div className="hero-fashion-placeholder">
                {heroImages.map((src, index) => (
                  <img
                    key={src}
                    className={`hero-fashion-model ${
                      index === heroIndex ? "is-active" : ""
                    }`}
                    src={src}
                    alt="Re-loop fashion model"
                  />
                ))}
              </div>

            </div>

            <div className="hero-frame-label">
              <span>CURATED</span>

              <div className="hero-dots">
                {heroImages.map((src, index) => (
                  <button
                    key={src}
                    type="button"
                    className={
                      index === heroIndex
                        ? "hero-dot active"
                        : "hero-dot"
                    }
                    onClick={() => setHeroIndex(index)}
                    aria-label={`Show photo ${index + 1}`}
                  />
                ))}
              </div>

              <span>
                {String(heroIndex + 1).padStart(2, "0")} /{" "}
                {String(heroImages.length).padStart(2, "0")}
              </span>
            </div>

          </div>

          <div className="hero-floating-note">
            <Sparkles size={15} />
            <span>
              Give clothing
              <br />
              another life.
            </span>
          </div>

        </div>

      </section>

      {/* ================= MOVING TICKER ================= */}

      <section className="market-ticker">

        <div className="ticker-track">

          <span>PRE-LOVED</span>
          <i>✦</i>
          <span>SWAP</span>
          <i>✦</i>
          <span>REUSE</span>
          <i>✦</i>
          <span>DISCOVER</span>
          <i>✦</i>
          <span>RE-LOOP</span>
          <i>✦</i>

          <span>PRE-LOVED</span>
          <i>✦</i>
          <span>SWAP</span>
          <i>✦</i>
          <span>REUSE</span>
          <i>✦</i>
          <span>DISCOVER</span>
          <i>✦</i>
          <span>RE-LOOP</span>
          <i>✦</i>

        </div>

      </section>

      {/* ================= CONTROLS ================= */}

      <section
        className="market-controls reveal-on-scroll"
        id="discover"
      >

        <div className="controls-intro">

          <div>

            <span className="section-kicker">
              DISCOVER
            </span>

            <h2>
              Find something
              <br />
              worth wearing again.
            </h2>

          </div>

          <p>
            Search the community closet,
            explore styles and find pieces
            that deserve another chapter.
          </p>

        </div>

        <div className="search-location-row">

          <div className="search-container">

            <Search size={21} />

            <input
              type="text"
              placeholder="Search clothing, brands or styles..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

            {search && (
              <button
                className="search-clear"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                <X size={17} />
              </button>
            )}

            <span className="search-shortcut">
              SEARCH
            </span>

          </div>

          <div className="location-filter">

            <MapPin size={18} />

            <input
              type="text"
              placeholder="Search by location..."
              value={locationFilter}
              onChange={(e) =>
                setLocationFilter(e.target.value)
              }
            />

            {locationFilter && (
              <button
                className="search-clear"
                onClick={() =>
                  setLocationFilter("")
                }
                aria-label="Clear location"
              >
                <X size={16} />
              </button>
            )}

          </div>

        </div>

        <div className="filter-header-row">

          <div className="filter-label">
            <SlidersHorizontal size={16} />
            <span>Explore by category</span>
          </div>

          <div className="sort-control">

            <span>Sort</span>

            <div className="sort-select-wrap">

              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value)
                }
              >
                <option value="newest">
                  Newest first
                </option>

                <option value="lowValue">
                  Lowest swap value
                </option>

                <option value="highValue">
                  Highest swap value
                </option>

                <option value="name">
                  Name A–Z
                </option>
              </select>

              <ChevronDown size={15} />

            </div>

          </div>

        </div>

        <div className="type-filters">

          {[
            "All",
            "T-Shirt",
            "Shirt",
            "Jeans",
            "Dress",
            "Jacket",
            "Hoodie",
          ].map((itemType) => (
            <button
              key={itemType}
              className={
                type === itemType
                  ? "type-btn active"
                  : "type-btn"
              }
              onClick={() =>
                setType(itemType)
              }
            >
              <span>{itemType}</span>

              {type === itemType && (
                <ArrowRight size={14} />
              )}

            </button>
          ))}

        </div>

        <div className="filter-bottom-row">

          <button
            className={`filter-toggle ${
              filtersOpen ? "open" : ""
            }`}
            onClick={() =>
              setFiltersOpen(!filtersOpen)
            }
          >

            <SlidersHorizontal size={16} />

            <span>
              More filters
            </span>

            {activeFilterCount > 0 && (
              <b>
                {activeFilterCount}
              </b>
            )}

            <ChevronDown size={15} />

          </button>

          <button
            type="button"
            className={
              hasActiveFilters
                ? "clear-filters-btn active"
                : "clear-filters-btn"
            }
            onClick={clearFilters}
            disabled={!hasActiveFilters}
          >
            Clear all
          </button>

        </div>

        <div
          className={`advanced-filters-panel ${
            filtersOpen ? "open" : ""
          }`}
        >

          <div className="advanced-filter-item">

            <label>SIZE</label>

            <div className="select-wrap">

              <select
                value={size}
                onChange={(e) =>
                  setSize(e.target.value)
                }
              >
                <option value="All">
                  All sizes
                </option>

                <option value="XS">XS</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
                <option value="Free Size">
                  Free Size
                </option>
              </select>

              <ChevronDown size={15} />

            </div>

          </div>

          <div className="advanced-filter-item">

            <label>CONDITION</label>

            <div className="select-wrap">

              <select
                value={condition}
                onChange={(e) =>
                  setCondition(e.target.value)
                }
              >
                <option value="All">
                  All conditions
                </option>

                <option value="New">
                  New
                </option>

                <option value="Like New">
                  Like New
                </option>

                <option value="Good">
                  Good
                </option>

                <option value="Fair">
                  Fair
                </option>
              </select>

              <ChevronDown size={15} />

            </div>

          </div>

          <div className="advanced-filter-item">

            <label>SWAP VALUE</label>

            <div className="select-wrap">

              <select
                value={valueRange}
                onChange={(e) =>
                  setValueRange(e.target.value)
                }
              >
                <option value="All">
                  Any swap value
                </option>

                <option value="under500">
                  Under ₹500
                </option>

                <option value="500-1000">
                  ₹500 – ₹1,000
                </option>

                <option value="1000-1500">
                  ₹1,000 – ₹1,500
                </option>

                <option value="above1500">
                  Above ₹1,500
                </option>
              </select>

              <ChevronDown size={15} />

            </div>

          </div>

        </div>

      </section>

      {/* ================= RESULTS ================= */}

      <main className="market-content">

        {/* ================= NEARBY ================= */}

        {userLocation && (
          <section className="nearby-section reveal-on-scroll">

            <div className="nearby-header">

              <div>

                <span className="nearby-small">
                  LOCATION MATCH
                </span>

                <h2>
                  Nearby for you
                </h2>

                <p>
                  Discover clothes available in{" "}
                  <strong>
                    {userLocation}
                  </strong>
                  .
                </p>

              </div>

              <div className="nearby-location">

                <MapPin size={16} />

                <span>
                  {userLocation}
                </span>

              </div>

            </div>

            {nearbyLoading ? (

              <div className="nearby-message">

                <div className="loader"></div>

                <p>
                  Finding clothes near you...
                </p>

              </div>

            ) : filteredNearbyListings.length === 0 ? (

              <div className="nearby-empty">

                <div className="nearby-empty-icon">
                  <MapPin size={27} />
                </div>

                <div>

                  <h3>
                    No nearby clothes yet
                  </h3>

                  <p>
                    There are no available
                    listings in{" "}
                    {userLocation} right now.
                  </p>

                </div>

                <Link to="/create-listing">
                  List clothing
                  <ArrowRight size={16} />
                </Link>

              </div>

            ) : (

              <div className="clothing-grid nearby-grid">

                {filteredNearbyListings.map(
                  (item, index) => (

                    <article
                      className="clothing-card reveal-on-scroll"
                      key={item._id}
                      style={{
                        "--card-delay": `${index * 70}ms`,
                      }}
                      onClick={() =>
                        navigate(
                          `/item/${item._id}`
                        )
                      }
                    >

                      <div className="clothing-image">

                        {item.images?.length > 0 ? (
                          <img
                            src={item.images[0]}
                            alt={item.title}
                            loading="lazy"
                          />
                        ) : (
                          <div className="no-image">
                            <Shirt size={42} />
                          </div>
                        )}

                        <div className="card-image-overlay">

                          <span>
                            VIEW PIECE
                          </span>

                          <ArrowRight size={16} />

                        </div>

                        <span className="available-badge">
                          Available
                        </span>

                        <span className="nearby-badge">
                          📍 Nearby
                        </span>

                      </div>

                      <div className="clothing-info">

                        <div className="item-top">

                          <span className="item-type">
                            {item.type}
                          </span>

                          <span className="item-value">
                            ₹{item.swapValue || 0}
                          </span>

                        </div>

                        <h3>
                          {item.title}
                        </h3>

                        <p className="item-brand">
                          {item.brand ||
                            "No brand"}
                        </p>

                        <div className="item-bottom">

                          <span>
                            Size {item.size}
                          </span>

                          <span className="item-location">

                            <MapPin size={13} />

                            {item.location}

                          </span>

                        </div>

                      </div>

                    </article>

                  )
                )}

              </div>

            )}

          </section>
        )}

        {/* ================= RESULTS HEADER ================= */}

        <div className="results-heading reveal-on-scroll">

          <div>

            <span className="results-small">
              COMMUNITY CLOSET
            </span>

            <h2>
              {search
                ? `Results for "${search}"`
                : "Recently listed"}
            </h2>

          </div>

          <div className="result-count-wrap">

            <span className="result-count">
              {filteredClothing.length}
            </span>

            <span className="result-count-label">
              pieces
            </span>

          </div>

        </div>

        {/* ================= LOADING ================= */}

        {loading ? (

          <div className="market-message">

            <div className="loader"></div>

            <p>
              Curating the community closet...
            </p>

          </div>

        ) : filteredClothing.length === 0 ? (

          <div className="empty-market reveal-on-scroll">

            <div className="empty-market-icon">
              <Shirt size={31} />
            </div>

            <span>
              NOTHING HERE YET
            </span>

            <h3>
              No clothing found.
            </h3>

            <p>
              Try another search or be the
              first to list something new.
            </p>

            <Link to="/create-listing">

              List your clothing

              <ArrowRight size={17} />

            </Link>

          </div>

        ) : (

          <div className="clothing-grid">

            {filteredClothing.map(
              (item, index) => (

                <article
                  className="clothing-card reveal-on-scroll"
                  key={item._id}
                  style={{
                    "--card-delay": `${index * 55}ms`,
                  }}
                  onClick={() =>
                    navigate(
                      `/item/${item._id}`
                    )
                  }
                >

                  <div className="clothing-image">

                    {item.images?.length > 0 ? (
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        loading="lazy"
                      />
                    ) : (
                      <div className="no-image">
                        <Shirt size={42} />
                      </div>
                    )}

                    <div className="card-image-overlay">

                      <span>
                        VIEW PIECE
                      </span>

                      <ArrowRight size={16} />

                    </div>

                    <button
                      className={`heart-btn ${
                        favoriteIds.includes(
                          item._id
                        )
                          ? "favorite-active"
                          : ""
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(
                          item._id
                        );
                      }}
                      disabled={
                        favoriteLoading ===
                        item._id
                      }
                      aria-label={
                        favoriteIds.includes(
                          item._id
                        )
                          ? "Remove from favorites"
                          : "Add to favorites"
                      }
                    >

                      <Heart
                        size={18}
                        fill={
                          favoriteIds.includes(
                            item._id
                          )
                            ? "currentColor"
                            : "none"
                        }
                      />

                    </button>

                    <span className="available-badge">
                      Available
                    </span>

                    {item.location &&
                      currentUser?.location && (
                        <span
                          className={
                            item.location
                              .toLowerCase()
                              .trim() ===
                            currentUser.location
                              .toLowerCase()
                              .trim()
                              ? "nearby-badge"
                              : "other-location-badge"
                          }
                        >
                          {item.location
                            .toLowerCase()
                            .trim() ===
                          currentUser.location
                            .toLowerCase()
                            .trim()
                            ? "📍 Nearby"
                            : "📍 Other location"}
                        </span>
                      )}

                  </div>

                  <div className="clothing-info">

                    <div className="item-top">

                      <span className="item-type">
                        {item.type}
                      </span>

                      <span className="item-value">
                        ₹{item.swapValue || 0}
                      </span>

                    </div>

                    <h3>
                      {item.title}
                    </h3>

                    <p className="item-brand">
                      {item.brand ||
                        "No brand"}
                    </p>

                    <div className="item-bottom">

                      <span>
                        Size {item.size}
                      </span>

                      <span className="item-location">

                        <MapPin size={13} />

                        {item.location ||
                          "Location not set"}

                      </span>

                    </div>

                  </div>

                </article>

              )
            )}

          </div>

        )}

        {/* ================= EDITORIAL CTA ================= */}

        <section className="market-cta reveal-on-scroll">

          <div className="cta-topline">

            <span>
              KEEP IT MOVING
            </span>

            <Sparkles size={17} />

          </div>

          <div className="cta-content">

            <div>

              <span className="cta-small">
                YOUR CLOSET HAS MORE TO GIVE
              </span>

              <h2>
                Don't let good
                <br />
                clothes sit still.
              </h2>

            </div>

            <div className="cta-side">

              <p>
                Give something you no longer
                wear a second life. Someone
                nearby might be looking for
                exactly that piece.
              </p>

              <Link
                to="/create-listing"
                className="cta-button"
              >
                <span>
                  List an item
                </span>

                <ArrowRight size={18} />

              </Link>

            </div>

          </div>

        </section>

        {/* ================= CONTACT / FOOTER ================= */}

        <footer className="market-footer reveal-on-scroll">

          <div className="footer-main">

            <div className="footer-brand">

              <Link
                to="/marketplace"
                className="footer-logo"
              >

                <div className="market-logo-icon">
                  <Shirt size={19} />
                </div>

                <span>
                  ClothSwap
                </span>

              </Link>

              <p>
                A better way to discover,
                exchange and give clothing
                another life.
              </p>

            </div>

            <div className="footer-contact">

              <span className="footer-kicker">
                SAY HELLO
              </span>

              <a
                href="mailto:hello@clothswap.com"
                className="footer-email"
              >
                hello@clothswap.com
                <ArrowRight size={18} />
              </a>

            </div>

          </div>

          <div className="footer-links">

            <div className="footer-link-group">

              <span>
                EXPLORE
              </span>

              <Link to="/marketplace">
                Marketplace
              </Link>

              <Link to="/favorites">
                Favorites
              </Link>

              <Link to="/dashboard">
                Dashboard
              </Link>

            </div>

            <div className="footer-link-group">

              <span>
                CREATE
              </span>

              <Link to="/create-listing">
                List clothing
              </Link>

              <Link to="/swap-value">
                Swap value
              </Link>

            </div>

            <div className="footer-link-group">

              <span>
                CONTACT
              </span>

              <a href="mailto:hello@clothswap.com">
                Email us
              </a>

              <a
                href="#discover"
                onClick={(e) => {
                  e.preventDefault();
                  document
                    .getElementById("discover")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    });
                }}
              >
                Back to discover
              </a>

            </div>

          </div>

          <div className="footer-bottom">

            <span>
              © {new Date().getFullYear()} ClothSwap
            </span>

            <span>
              MADE FOR A MORE CIRCULAR CLOSET
            </span>

            <button
              className="footer-top"
              onClick={() =>
                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                })
              }
            >
              Back to top
              <ArrowRight size={15} />
            </button>

          </div>

        </footer>

      </main>

    </div>
  );
}

export default Marketplace;