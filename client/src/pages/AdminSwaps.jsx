import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Repeat2,
  UserRound,
  Shirt,
  Clock3,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ShieldCheck,
  Search,
} from "lucide-react";
import API from "../api";
import "./AdminSwaps.css";

function AdminSwaps() {
  const navigate = useNavigate();

  const [swaps, setSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchSwaps();
  }, []);

  const fetchSwaps = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("clothswapToken");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(`${API}/admin/swaps`, {
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
        throw new Error(data.message);
      }

      setSwaps(data.swaps || []);
    } catch (error) {
      console.error("Fetch swaps error:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIcon = (status) => {
    if (status === "accepted" || status === "completed") {
      return <CheckCircle2 size={14} />;
    }

    if (status === "rejected" || status === "cancelled") {
      return <XCircle size={14} />;
    }

    return <Clock3 size={14} />;
  };

  const filteredSwaps = swaps.filter((swap) => {
    const search = searchTerm.toLowerCase().trim();

    const matchesSearch =
      !search ||
      swap.requester?.name?.toLowerCase().includes(search) ||
      swap.receiver?.name?.toLowerCase().includes(search) ||
      swap.requester?.email?.toLowerCase().includes(search) ||
      swap.receiver?.email?.toLowerCase().includes(search) ||
      swap.offeredItem?.title?.toLowerCase().includes(search) ||
      swap.requestedItem?.title?.toLowerCase().includes(search) ||
      swap._id?.toLowerCase().includes(search);

    const matchesStatus =
      statusFilter === "all" ||
      swap.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const pendingCount = swaps.filter(
    (swap) => swap.status === "pending"
  ).length;

  const acceptedCount = swaps.filter(
    (swap) =>
      swap.status === "accepted" ||
      swap.status === "completed"
  ).length;

  const rejectedCount = swaps.filter(
    (swap) =>
      swap.status === "rejected" ||
      swap.status === "cancelled"
  ).length;

  return (
    <div className="admin-swaps-page">

      <header className="swaps-header">

        <button
          className="swaps-back-btn"
          onClick={() => navigate("/admin")}
        >
          <ArrowLeft size={17} />
          Dashboard
        </button>

        <div className="swaps-heading">
          <span className="swaps-eyebrow">
            <ShieldCheck size={13} />
            ADMIN · EXCHANGES
          </span>

          <h1>Swap management</h1>

          <p>
            Monitor clothing exchanges across the community.
          </p>
        </div>

        <button
          className="swaps-refresh-btn"
          onClick={fetchSwaps}
          disabled={loading}
        >
          <RefreshCw size={16} />
          Refresh
        </button>

      </header>

      <main className="swaps-content">

        <div className="swaps-summary-grid">

          <div className="swaps-summary-card">
            <div>
              <span>TOTAL REQUESTS</span>
              <strong>{swaps.length}</strong>
              <small>All exchange requests</small>
            </div>

            <div className="swaps-summary-icon">
              <Repeat2 size={21} />
            </div>
          </div>

          <div className="swaps-summary-card">
            <div>
              <span>PENDING</span>
              <strong>{pendingCount}</strong>
              <small>Awaiting response</small>
            </div>

            <div className="swaps-summary-icon pending-summary-icon">
              <Clock3 size={21} />
            </div>
          </div>

          <div className="swaps-summary-card">
            <div>
              <span>COMPLETED</span>
              <strong>{acceptedCount}</strong>
              <small>Accepted exchanges</small>
            </div>

            <div className="swaps-summary-icon completed-summary-icon">
              <CheckCircle2 size={21} />
            </div>
          </div>

          <div className="swaps-summary-card">
            <div>
              <span>DECLINED</span>
              <strong>{rejectedCount}</strong>
              <small>Rejected or cancelled</small>
            </div>

            <div className="swaps-summary-icon declined-summary-icon">
              <XCircle size={21} />
            </div>
          </div>

        </div>

        <div className="swaps-toolbar">

          <div className="swaps-search">
            <Search size={17} />

            <input
              type="text"
              placeholder="Search users, items, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {searchTerm && (
              <button
                className="clear-swaps-search"
                onClick={() => setSearchTerm("")}
                type="button"
              >
                ×
              </button>
            )}
          </div>

          <div className="swap-filter-group">

            {["all", "pending", "accepted", "rejected"].map(
              (status) => (
                <button
                  key={status}
                  type="button"
                  className={
                    statusFilter === status
                      ? "swap-filter active"
                      : "swap-filter"
                  }
                  onClick={() => setStatusFilter(status)}
                >
                  {status === "all"
                    ? "All"
                    : status.charAt(0).toUpperCase() +
                      status.slice(1)}
                </button>
              )
            )}

          </div>

        </div>

        <div className="swaps-results-count">
          {filteredSwaps.length}{" "}
          {filteredSwaps.length === 1 ? "swap" : "swaps"}
        </div>

        {loading ? (
          <div className="swaps-state">
            <div className="swaps-loader"></div>
            <p>Loading swap requests...</p>
          </div>
        ) : swaps.length === 0 ? (
          <div className="swaps-state">
            <Repeat2 size={38} />
            <h3>No swap requests</h3>
            <p>No exchanges have been created yet.</p>
          </div>
        ) : filteredSwaps.length === 0 ? (
          <div className="swaps-state">
            <Search size={35} />
            <h3>No matching swaps</h3>
            <p>Try a different search or status filter.</p>

            <button
              className="clear-swaps-btn"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
              }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="swaps-list">

            {filteredSwaps.map((swap) => (

              <article
                className="admin-swap-card"
                key={swap._id}
              >

                <div className="swap-card-top">

                  <div className="swap-id">
                    SWAP · {swap._id.slice(-6).toUpperCase()}
                  </div>

                  <span
                    className={`swap-status ${swap.status}`}
                  >
                    {getStatusIcon(swap.status)}
                    {swap.status}
                  </span>

                </div>

                <div className="swap-people">

                  <div className="swap-person">

                    <div className="swap-avatar">
                      {swap.requester?.name
                        ?.charAt(0)
                        .toUpperCase() || "U"}
                    </div>

                    <div>
                      <span>REQUESTER</span>

                      <strong>
                        {swap.requester?.name || "Unknown"}
                      </strong>

                      <small>
                        {swap.requester?.email || "No email"}
                      </small>
                    </div>

                  </div>

                  <div className="swap-arrow">
                    <Repeat2 size={19} />
                  </div>

                  <div className="swap-person">

                    <div className="swap-avatar receiver-avatar">
                      {swap.receiver?.name
                        ?.charAt(0)
                        .toUpperCase() || "U"}
                    </div>

                    <div>
                      <span>RECEIVER</span>

                      <strong>
                        {swap.receiver?.name || "Unknown"}
                      </strong>

                      <small>
                        {swap.receiver?.email || "No email"}
                      </small>
                    </div>

                  </div>

                </div>

                <div className="swap-items">

                  <div className="swap-item">

                    <div className="swap-item-icon">
                      <Shirt size={19} />
                    </div>

                    <div>
                      <span>OFFERED ITEM</span>

                      <strong>
                        {swap.offeredItem?.title ||
                          "Item unavailable"}
                      </strong>

                      <small>
                        {swap.offeredItem?.type || "—"}
                      </small>
                    </div>

                  </div>

                  <div className="swap-item-divider">
                    →
                  </div>

                  <div className="swap-item">

                    <div className="swap-item-icon">
                      <Shirt size={19} />
                    </div>

                    <div>
                      <span>REQUESTED ITEM</span>

                      <strong>
                        {swap.requestedItem?.title ||
                          "Item unavailable"}
                      </strong>

                      <small>
                        {swap.requestedItem?.type || "—"}
                      </small>
                    </div>

                  </div>

                </div>

                {swap.message && (
                  <div className="swap-message">
                    <span>MESSAGE</span>
                    <p>"{swap.message}"</p>
                  </div>
                )}

                <div className="swap-card-footer">

                  <div className="swap-date">
                    <Clock3 size={14} />
                    {formatDate(swap.createdAt)}
                    <span>·</span>
                    {formatTime(swap.createdAt)}
                  </div>

                  <div className="swap-record">
                    <UserRound size={13} />
                    Exchange record
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

export default AdminSwaps;