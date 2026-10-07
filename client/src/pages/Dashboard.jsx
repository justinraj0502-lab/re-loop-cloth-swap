import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Clock3,
  Inbox,
  LogOut,
  MessageCircle,
  Repeat2,
  Send,
  X,
} from "lucide-react";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  const token = localStorage.getItem("clothswapToken");

  const user = JSON.parse(
    localStorage.getItem("clothswapUser") || "null"
  );

  const currentUserId = user?.id || user?._id;

  useEffect(() => {
    if (!token || !user) {
      navigate("/login");
      return;
    }

    const loadRequests = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/swap-requests/mine",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          alert(data.message || "Unable to load swap requests.");
          return;
        }

        const loadedRequests = data.requests || [];

        setRequests(loadedRequests);

        const unreadCounts = {};

        for (const request of loadedRequests) {
          try {
            const messageResponse = await fetch(
              `http://localhost:5000/api/messages/${request._id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            const messageData = await messageResponse.json();

            if (messageResponse.ok) {
              const unreadCount = (
                messageData.messages || []
              ).filter(
                (message) =>
                  String(message.receiver?._id) ===
                    String(currentUserId) &&
                  message.isRead !== true
              ).length;

              if (unreadCount > 0) {
                unreadCounts[request._id] = unreadCount;
              }
            }
          } catch (error) {
            console.error(
              `Unable to check messages for ${request._id}:`,
              error
            );
          }
        }

        setUnreadMessages(unreadCounts);
      } catch (error) {
        console.error("Dashboard error:", error);
        alert("Unable to load your swaps.");
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
  }, [navigate, token, currentUserId]);

  /*
   * SENT REQUESTS
   * These are requests created by the current user.
   */
  const sentRequests = useMemo(
    () =>
      requests.filter(
        (request) =>
          String(request.requester?._id) ===
          String(currentUserId)
      ),
    [requests, currentUserId]
  );

  /*
   * RECEIVED REQUESTS
   * These are requests sent to the current user.
   *
   * IMPORTANT:
   * This list is completely independent from statusFilter.
   */
  const receivedRequests = useMemo(
    () =>
      requests.filter(
        (request) =>
          String(request.receiver?._id) ===
          String(currentUserId)
      ),
    [requests, currentUserId]
  );

  /*
   * STATUS COUNTS
   */
  const pendingCount = requests.filter(
    (request) => request.status === "pending"
  ).length;

  const acceptedCount = requests.filter(
    (request) => request.status === "accepted"
  ).length;

  const rejectedCount = requests.filter(
    (request) => request.status === "rejected"
  ).length;

  /*
   * IMPORTANT:
   * Status filters ONLY control sent requests.
   */
  const filteredSentRequests = useMemo(
    () =>
      sentRequests.filter(
        (request) =>
          statusFilter === "all" ||
          request.status === statusFilter
      ),
    [sentRequests, statusFilter]
  );

  const handleStatusUpdate = async (requestId, status) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/swap-requests/${requestId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Unable to update request.");
        return;
      }

      setRequests((currentRequests) =>
        currentRequests.map((request) =>
          request._id === requestId
            ? {
                ...request,
                status,
              }
            : request
        )
      );
    } catch (error) {
      console.error("Status update error:", error);
      alert("Unable to update swap request.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("clothswapToken");
    localStorage.removeItem("clothswapUser");

    navigate("/login", {
      replace: true,
    });
  };

  const getStatusClass = (status) => {
    return `status-badge status-${status}`;
  };

  const getImage = (item) => {
    return item?.images?.[0] || "";
  };

  const getValueDifference = (firstItem, secondItem) => {
    const firstValue = Number(firstItem?.swapValue) || 0;
    const secondValue = Number(secondItem?.swapValue) || 0;

    return firstValue - secondValue;
  };

  const formatValue = (value) => {
    return Number(value || 0).toLocaleString("en-IN");
  };

  const formatDate = (date) => {
    if (!date) return "Recently";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Recently";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusLabel = (status) => {
    if (!status) return "Unknown";

    return (
      status.charAt(0).toUpperCase() +
      status.slice(1)
    );
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-circle"></div>
        <p>Loading your swaps...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* =====================================================
          HEADER
      ====================================================== */}
      <header className="dashboard-header">
        <button
          className="dashboard-back"
          onClick={() => navigate("/marketplace")}
        >
          <ArrowLeft size={18} />
          <span>Marketplace</span>
        </button>

        <div className="dashboard-logo">
          <span>♻</span>
          ClothSwap
        </div>

        <button
          className="logout-btn"
          onClick={handleLogout}
        >
          <LogOut size={17} />
          <span>Logout</span>
        </button>
      </header>

      <main className="dashboard-container">
        {/* =====================================================
            HERO
        ====================================================== */}
        <section className="dashboard-hero">
          <div>
            <span className="dashboard-eyebrow">
              YOUR CLOTHSWAP
            </span>

            <h1>
              Welcome back,
              <br />
              <em>{user?.name || "Swapper"}.</em>
            </h1>

            <p>
              Track your clothing exchanges, manage swap
              requests, and discover your next perfect swap.
            </p>
          </div>

          <button
            className="browse-btn"
            onClick={() => navigate("/marketplace")}
          >
            Browse clothes
            <ArrowLeft
              size={18}
              style={{ transform: "rotate(180deg)" }}
            />
          </button>
        </section>

        {/* =====================================================
            STATS
        ====================================================== */}
        <section className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon">
              <Send size={20} />
            </div>

            <div>
              <span>Sent</span>
              <strong>{sentRequests.length}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Inbox size={20} />
            </div>

            <div>
              <span>Received</span>
              <strong>{receivedRequests.length}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Clock3 size={20} />
            </div>

            <div>
              <span>Pending</span>
              <strong>{pendingCount}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Check size={20} />
            </div>

            <div>
              <span>Accepted</span>
              <strong>{acceptedCount}</strong>
            </div>
          </div>
        </section>

        {/* =====================================================
            RECEIVED REQUESTS
            ALWAYS INDEPENDENT FROM SENT REQUEST FILTERS
        ====================================================== */}
        <section className="swap-section received-section">
          <div className="section-heading">
            <div>
              <span>INCOMING</span>

              <h2>Received requests</h2>

              <p className="section-description">
                People interested in swapping with your items.
              </p>
            </div>

            <div className="section-heading-right">
              <small>
                {receivedRequests.length}{" "}
                {receivedRequests.length === 1
                  ? "request"
                  : "requests"}
              </small>
            </div>
          </div>

          {receivedRequests.length === 0 ? (
            <div className="empty-card">
              <div className="empty-icon">
                <Inbox size={26} />
              </div>

              <h3>No received requests</h3>

              <p>
                When someone wants to swap with you,
                their request will appear here.
              </p>
            </div>
          ) : (
            <div className="swap-list">
              {receivedRequests.map((request) => {
                const valueDifference =
                  getValueDifference(
                    request.offeredItem,
                    request.requestedItem
                  );

                return (
                  <div
                    className="swap-card received-card"
                    key={request._id}
                  >
                    {/* REQUEST HEADER */}
                    <div className="card-topline">
                      <div className="request-date">
                        <Clock3 size={13} />
                        Received{" "}
                        {formatDate(request.createdAt)}
                      </div>

                      <span
                        className={getStatusClass(
                          request.status
                        )}
                      >
                        {getStatusLabel(request.status)}
                      </span>
                    </div>

                    {/* REQUESTER */}
                    <div className="requester-info">
                      <div className="avatar">
                        {request.requester?.name
                          ?.charAt(0)
                          .toUpperCase() || "U"}
                      </div>

                      <div>
                        <span>SWAP REQUEST FROM</span>

                        <h3>
                          {request.requester?.name ||
                            "Unknown user"}
                        </h3>

                        <p>
                          {request.requester?.location ||
                            "Location not provided"}
                        </p>
                      </div>
                    </div>

                    {/* ITEMS */}
                    <div className="swap-items">
                      <div className="swap-item">
                        <div className="swap-image">
                          {getImage(
                            request.offeredItem
                          ) ? (
                            <img
                              src={getImage(
                                request.offeredItem
                              )}
                              alt={
                                request.offeredItem
                                  ?.title ||
                                "Offered clothing"
                              }
                            />
                          ) : (
                            <span>♻</span>
                          )}
                        </div>

                        <div>
                          <small>THEY OFFER</small>

                          <h3>
                            {request.offeredItem
                              ?.title || "Untitled item"}
                          </h3>

                          <p>
                            {request.offeredItem?.brand ||
                              "No brand"}
                            {" · "}₹
                            {formatValue(
                              request.offeredItem
                                ?.swapValue
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="swap-arrow">
                        <Repeat2 size={25} />
                      </div>

                      <div className="swap-item">
                        <div className="swap-image">
                          {getImage(
                            request.requestedItem
                          ) ? (
                            <img
                              src={getImage(
                                request.requestedItem
                              )}
                              alt={
                                request.requestedItem
                                  ?.title ||
                                "Requested clothing"
                              }
                            />
                          ) : (
                            <span>♻</span>
                          )}
                        </div>

                        <div>
                          <small>YOUR ITEM</small>

                          <h3>
                            {request.requestedItem
                              ?.title || "Untitled item"}
                          </h3>

                          <p>
                            {request.requestedItem?.brand ||
                              "No brand"}
                            {" · "}₹
                            {formatValue(
                              request.requestedItem
                                ?.swapValue
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* VALUE COMPARISON */}
                    <div className="received-value-summary">
                      <div>
                        <span>THEY OFFER</span>

                        <strong>
                          ₹
                          {formatValue(
                            request.offeredItem
                              ?.swapValue
                          )}
                        </strong>
                      </div>

                      <Repeat2 size={18} />

                      <div>
                        <span>YOUR ITEM</span>

                        <strong>
                          ₹
                          {formatValue(
                            request.requestedItem
                              ?.swapValue
                          )}
                        </strong>
                      </div>

                      <div className="received-value-difference">
                        <span>Difference</span>

                        <strong
                          className={
                            valueDifference >= 0
                              ? "value-positive"
                              : "value-negative"
                          }
                        >
                          ₹
                          {formatValue(
                            Math.abs(valueDifference)
                          )}
                        </strong>
                      </div>
                    </div>

                    {/* MESSAGE */}
                    {request.message && (
                      <div className="swap-message">
                        <span>MESSAGE</span>
                        <p>“{request.message}”</p>
                      </div>
                    )}

                    {/* FOOTER */}
                    <div className="card-footer">
                      <Link
                        to={`/chat/${request._id}`}
                        className="chat-btn"
                      >
                        <MessageCircle size={16} />
                        Chat

                        {unreadMessages[
                          request._id
                        ] > 0 && (
                          <span className="unread-badge">
                            {
                              unreadMessages[
                                request._id
                              ]
                            }
                          </span>
                        )}
                      </Link>

                      <span className="request-id">
                        Request #
                        {String(request._id).slice(-6)}
                      </span>
                    </div>

                    {/* ACTIONS */}
                    {request.status === "pending" && (
                      <div className="request-actions">
                        <button
                          className="reject-btn"
                          onClick={() =>
                            handleStatusUpdate(
                              request._id,
                              "rejected"
                            )
                          }
                        >
                          <X size={17} />
                          Reject
                        </button>

                        <button
                          className="accept-btn"
                          onClick={() =>
                            handleStatusUpdate(
                              request._id,
                              "accepted"
                            )
                          }
                        >
                          <Check size={17} />
                          Accept
                        </button>
                      </div>
                    )}

                    {request.status === "accepted" && (
                      <div className="request-state accepted-state">
                        <Check size={16} />
                        Swap accepted
                      </div>
                    )}

                    {request.status === "rejected" && (
                      <div className="request-state rejected-state">
                        <X size={16} />
                        Request rejected
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* =====================================================
            SWAP ACTIVITY / SENT REQUESTS
            STATUS FILTERS LIVE ONLY HERE
        ====================================================== */}
        <section className="swap-section sent-activity-section">
          <div className="section-heading">
            <div>
              <span>SWAP ACTIVITY</span>

              <h2>Your sent requests</h2>

              <p className="section-description">
                Track every swap request you have sent.
              </p>
            </div>

            <div className="section-heading-right">
              <small>
                {sentRequests.length}{" "}
                {sentRequests.length === 1
                  ? "request"
                  : "requests"}
              </small>

              <div className="dashboard-filters">
                {[
                  ["all", "All"],
                  ["pending", "Pending"],
                  ["accepted", "Accepted"],
                  ["rejected", "Rejected"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    className={
                      statusFilter === value
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setStatusFilter(value)
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {filteredSentRequests.length === 0 ? (
            <div className="empty-card">
              <div className="empty-icon">
                <Send size={26} />
              </div>

              <h3>
                {sentRequests.length === 0
                  ? "No sent requests yet"
                  : "No matching requests"}
              </h3>

              <p>
                {sentRequests.length === 0
                  ? "Find something you love and send your first swap request."
                  : "Try another status filter to see more requests."}
              </p>

              {sentRequests.length === 0 && (
                <button
                  onClick={() =>
                    navigate("/marketplace")
                  }
                >
                  Browse marketplace
                </button>
              )}
            </div>
          ) : (
            <div className="swap-list">
              {filteredSentRequests.map((request) => {
                const valueDifference =
                  getValueDifference(
                    request.offeredItem,
                    request.requestedItem
                  );

                return (
                  <div
                    className="swap-card sent-card"
                    key={request._id}
                  >
                    {/* REQUEST HEADER */}
                    <div className="card-topline">
                      <div className="request-date">
                        <Clock3 size={13} />
                        Sent {formatDate(request.createdAt)}
                      </div>

                      <span
                        className={getStatusClass(
                          request.status
                        )}
                      >
                        {getStatusLabel(request.status)}
                      </span>
                    </div>

                    {/* ITEMS */}
                    <div className="swap-items">
                      <div className="swap-item">
                        <div className="swap-image">
                          {getImage(
                            request.offeredItem
                          ) ? (
                            <img
                              src={getImage(
                                request.offeredItem
                              )}
                              alt={
                                request.offeredItem
                                  ?.title ||
                                "Offered clothing"
                              }
                            />
                          ) : (
                            <span>♻</span>
                          )}
                        </div>

                        <div>
                          <small>YOU OFFERED</small>

                          <h3>
                            {request.offeredItem
                              ?.title || "Untitled item"}
                          </h3>

                          <p>
                            {request.offeredItem?.brand ||
                              "No brand"}
                            {" · "}
                            {request.offeredItem?.size ||
                              "Size N/A"}
                          </p>
                        </div>
                      </div>

                      <div className="swap-arrow">
                        <Repeat2 size={25} />
                      </div>

                      <div className="swap-item">
                        <div className="swap-image">
                          {getImage(
                            request.requestedItem
                          ) ? (
                            <img
                              src={getImage(
                                request.requestedItem
                              )}
                              alt={
                                request.requestedItem
                                  ?.title ||
                                "Requested clothing"
                              }
                            />
                          ) : (
                            <span>♻</span>
                          )}
                        </div>

                        <div>
                          <small>YOU REQUESTED</small>

                          <h3>
                            {request.requestedItem
                              ?.title || "Untitled item"}
                          </h3>

                          <p>
                            {request.requestedItem?.brand ||
                              "No brand"}
                            {" · "}
                            {request.requestedItem?.size ||
                              "Size N/A"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* VALUE / RECEIVER */}
                    <div className="swap-meta">
                      <div>
                        <span>Sent to</span>

                        <strong>
                          {request.receiver?.name ||
                            "Unknown user"}
                        </strong>
                      </div>

                      <div className="swap-value-summary">
                        <span>Value difference</span>

                        <strong
                          className={
                            valueDifference >= 0
                              ? "value-positive"
                              : "value-negative"
                          }
                        >
                          {valueDifference >= 0
                            ? "+"
                            : "-"}
                          ₹
                          {formatValue(
                            Math.abs(valueDifference)
                          )}
                        </strong>
                      </div>
                    </div>

                    {/* MESSAGE */}
                    {request.message && (
                      <div className="swap-message">
                        <span>YOUR MESSAGE</span>
                        <p>“{request.message}”</p>
                      </div>
                    )}

                    {/* FOOTER */}
                    <div className="card-footer">
                      <Link
                        to={`/chat/${request._id}`}
                        className="chat-btn"
                      >
                        <MessageCircle size={16} />
                        Chat

                        {unreadMessages[
                          request._id
                        ] > 0 && (
                          <span className="unread-badge">
                            {
                              unreadMessages[
                                request._id
                              ]
                            }
                          </span>
                        )}
                      </Link>

                      <span className="request-id">
                        Request #
                        {String(request._id).slice(-6)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* =====================================================
            DASHBOARD SUMMARY
        ====================================================== */}
        <section className="dashboard-summary">
          <div>
            <span>ACTIVITY OVERVIEW</span>

            <strong>
              {requests.length} total requests
            </strong>
          </div>

          <div className="summary-statuses">
            <div>
              <span>Pending</span>
              <strong>{pendingCount}</strong>
            </div>

            <div>
              <span>Accepted</span>
              <strong>{acceptedCount}</strong>
            </div>

            <div>
              <span>Rejected</span>
              <strong>{rejectedCount}</strong>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;