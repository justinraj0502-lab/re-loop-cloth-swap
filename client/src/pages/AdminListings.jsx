import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Shirt,
  MapPin,
  IndianRupee,
  Trash2,
  RefreshCw,
  ShieldCheck,
  Tag,
  Search,
  PackageCheck,
  ArrowLeftRight,
} from "lucide-react";
import API from "../api";
import "./AdminListings.css";

function AdminListings() {
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("clothswapToken");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(`${API}/admin/listings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.status === 403) {
        alert("Admin access required.");
        navigate("/marketplace");
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load listings."
        );
      }

      setListings(data.listings || []);
    } catch (error) {
      console.error("Fetch listings error:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteListing = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this listing?"
    );

    if (!confirmed) return;

    try {
      const token = localStorage.getItem("clothswapToken");

      setDeletingId(id);

      const response = await fetch(
        `${API}/admin/listings/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to remove listing."
        );
      }

      setListings((current) =>
        current.filter((listing) => listing._id !== id)
      );

      alert("Listing removed successfully.");
    } catch (error) {
      console.error("Delete listing error:", error);
      alert(
        error.message || "Unable to remove listing."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const availableCount = listings.filter(
    (item) => item.status === "available"
  ).length;

  const swappedCount = listings.filter(
    (item) => item.status === "swapped"
  ).length;

  const filteredListings = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return listings;

    return listings.filter((item) => {
      return (
        item.title?.toLowerCase().includes(query) ||
        item.type?.toLowerCase().includes(query) ||
        item.brand?.toLowerCase().includes(query) ||
        item.location?.toLowerCase().includes(query) ||
        item.owner?.name?.toLowerCase().includes(query) ||
        item.status?.toLowerCase().includes(query)
      );
    });
  }, [listings, search]);

  return (
    <div className="admin-listings-page">

      {/* Header */}
      <header className="listings-header">

        <button
          className="listing-back-btn"
          onClick={() => navigate("/admin")}
        >
          <ArrowLeft size={17} />
          Dashboard
        </button>

        <div className="listings-heading">
          <span className="listings-eyebrow">
            <ShieldCheck size={13} />
            ADMIN · MARKETPLACE
          </span>

          <h1>Listing management</h1>

          <p>
            Review and manage clothing posted by the community.
          </p>
        </div>

        <button
          className="listing-refresh-btn"
          onClick={fetchListings}
          disabled={loading}
        >
          <RefreshCw
            size={16}
            className={
              loading ? "listing-refresh-spinning" : ""
            }
          />
          {loading ? "Refreshing..." : "Refresh"}
        </button>

      </header>

      <main className="listings-content">

        {/* Summary cards */}
        <section className="listings-summary-grid">

          <div className="listings-summary-card">
            <div>
              <span>TOTAL LISTINGS</span>
              <strong>{listings.length}</strong>
              <small>All marketplace listings</small>
            </div>

            <div className="listings-summary-icon">
              <Shirt size={21} />
            </div>
          </div>

          <div className="listings-summary-card">
            <div>
              <span>AVAILABLE</span>
              <strong>{availableCount}</strong>
              <small>Open for swapping</small>
            </div>

            <div className="listings-summary-icon">
              <PackageCheck size={21} />
            </div>
          </div>

          <div className="listings-summary-card">
            <div>
              <span>SWAPPED</span>
              <strong>{swappedCount}</strong>
              <small>Completed exchanges</small>
            </div>

            <div className="listings-summary-icon swapped-summary-icon">
              <ArrowLeftRight size={21} />
            </div>
          </div>

        </section>

        {/* Search */}
        {!loading && listings.length > 0 && (
          <div className="listings-toolbar">

            <div className="listings-search">
              <Search size={17} />

              <input
                type="text"
                placeholder="Search listings, brands, owners..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              {search && (
                <button
                  className="clear-listings-search"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>

            <span className="listings-results-count">
              {filteredListings.length}{" "}
              {filteredListings.length === 1
                ? "listing"
                : "listings"}
            </span>

          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="listings-state">
            <div className="listing-loader"></div>
            <p>Loading listings...</p>
          </div>

        ) : listings.length === 0 ? (

          <div className="listings-state">
            <Shirt size={38} />
            <h3>No listings found</h3>
            <p>
              The marketplace doesn't have any listings yet.
            </p>
          </div>

        ) : filteredListings.length === 0 ? (

          <div className="listings-state">
            <Search size={38} />
            <h3>No matching listings</h3>
            <p>
              Try searching with another title, brand, or owner.
            </p>

            <button
              className="clear-listings-btn"
              onClick={() => setSearch("")}
            >
              Clear search
            </button>
          </div>

        ) : (

          /* Listings */
          <div className="listings-grid">

            {filteredListings.map((item) => (

              <article
                className="admin-listing-card"
                key={item._id}
              >

                {/* Image */}
                <div className="admin-listing-image">

                  {item.images?.[0] ? (
                    <img
                      src={item.images[0]}
                      alt={item.title}
                    />
                  ) : (
                    <div className="listing-no-image">
                      <Shirt size={42} />
                      <span>No image</span>
                    </div>
                  )}

                  <span
                    className={`listing-status ${item.status}`}
                  >
                    {item.status || "available"}
                  </span>

                </div>

                {/* Body */}
                <div className="admin-listing-body">

                  <div className="listing-title-row">

                    <div>
                      <span className="listing-type">
                        {item.type || "Clothing"}
                      </span>

                      <h2>
                        {item.title || "Untitled listing"}
                      </h2>
                    </div>

                    <div className="listing-value">
                      <IndianRupee size={13} />
                      {item.swapValue || 0}
                    </div>

                  </div>

                  {/* Details */}
                  <div className="listing-details">

                    <div>
                      <Tag size={14} />
                      <span>
                        {item.brand || "No brand"}
                      </span>
                    </div>

                    <div>
                      <span className="detail-label">
                        Size
                      </span>
                      <strong>
                        {item.size || "—"}
                      </strong>
                    </div>

                    <div>
                      <span className="detail-label">
                        Condition
                      </span>
                      <strong>
                        {item.condition || "—"}
                      </strong>
                    </div>

                  </div>

                  {/* Owner */}
                  <div className="listing-owner">

                    <div className="owner-avatar">
                      {item.owner?.name
                        ?.charAt(0)
                        .toUpperCase() || "U"}
                    </div>

                    <div className="owner-info">
                      <span>LISTED BY</span>
                      <strong>
                        {item.owner?.name ||
                          "Unknown user"}
                      </strong>
                    </div>

                    <div className="owner-location">
                      <MapPin size={13} />
                      {item.location || "Not set"}
                    </div>

                  </div>

                  {/* Footer */}
                  <div className="listing-footer">

                    <span className="listing-date">
                      {formatDate(item.createdAt)}
                    </span>

                    <button
                      className="delete-listing-btn"
                      onClick={() =>
                        deleteListing(item._id)
                      }
                      disabled={
                        deletingId === item._id
                      }
                    >
                      <Trash2 size={15} />

                      {deletingId === item._id
                        ? "Removing..."
                        : "Remove"}
                    </button>

                  </div>

                </div>

              </article>

            ))}

          </div>
        )}

      </main>
    </div>
  );
}

export default AdminListings;