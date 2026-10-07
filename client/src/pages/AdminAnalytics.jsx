import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BarChart3,
  Users,
  Shirt,
  Repeat2,
  CheckCircle2,
  Clock3,
  XCircle,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import "./AdminAnalytics.css";

function AdminAnalytics() {
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  fetchAnalytics();

  const interval = setInterval(() => {
    fetchAnalytics();
  }, 30000);

  return () => clearInterval(interval);
}, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("clothswapToken");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/admin/analytics",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.status === 403) {
        alert("Admin access required.");
        navigate("/marketplace");
        return;
      }

      if (!response.ok) {
        throw new Error(data.message);
      }

      setAnalytics(data.analytics);
    } catch (error) {
      console.error("Fetch analytics error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-analytics-page">

      <header className="analytics-header">

        <button
          className="analytics-back-btn"
          onClick={() => navigate("/admin")}
        >
          <ArrowLeft size={17} />
          Dashboard
        </button>

        <div className="analytics-heading">
          <span className="analytics-eyebrow">
            <ShieldCheck size={13} />
            ADMIN · ANALYTICS
          </span>

          <h1>Community analytics</h1>

          <p>
            Track ClothSwap activity and exchange performance.
          </p>
        </div>

        <button
          className="analytics-refresh-btn"
          onClick={fetchAnalytics}
          disabled={loading}
        >
          <RefreshCw size={16} />
          Refresh
        </button>

      </header>

      <main className="analytics-content">

        {loading ? (
          <div className="analytics-state">
            <div className="analytics-loader"></div>
            <p>Loading analytics...</p>
          </div>
        ) : !analytics ? (
          <div className="analytics-state">
            <BarChart3 size={38} />
            <h3>Analytics unavailable</h3>
            <p>Unable to load community statistics.</p>
          </div>
        ) : (
          <>
            <section className="analytics-stats-grid">

              <div className="analytics-stat-card">
                <div>
                  <span>TOTAL USERS</span>
                  <strong>{analytics.totalUsers}</strong>
                  <small>Registered community members</small>
                </div>

                <div className="analytics-stat-icon">
                  <Users size={21} />
                </div>
              </div>

              <div className="analytics-stat-card">
                <div>
                  <span>TOTAL LISTINGS</span>
                  <strong>{analytics.totalListings}</strong>
                  <small>Clothes listed for swapping</small>
                </div>

                <div className="analytics-stat-icon">
                  <Shirt size={21} />
                </div>
              </div>

              <div className="analytics-stat-card">
                <div>
                  <span>SWAP REQUESTS</span>
                  <strong>{analytics.totalSwaps}</strong>
                  <small>Exchange requests created</small>
                </div>

                <div className="analytics-stat-icon">
                  <Repeat2 size={21} />
                </div>
              </div>

              <div className="analytics-stat-card">
                <div>
                  <span>SUCCESS RATE</span>
                  <strong>{analytics.successRate}%</strong>
                  <small>Accepted exchanges</small>
                </div>

                <div className="analytics-stat-icon success-icon">
                  <CheckCircle2 size={21} />
                </div>
              </div>

            </section>

            <section className="analytics-breakdown">

              <div className="analytics-section-title">
                <div>
                  <span>SWAP BREAKDOWN</span>
                  <h2>Exchange activity</h2>
                </div>

                <BarChart3 size={22} />
              </div>

              <div className="breakdown-grid">

                <div className="breakdown-card">
                  <div className="breakdown-icon pending">
                    <Clock3 size={18} />
                  </div>

                  <div>
                    <span>Pending</span>
                    <strong>{analytics.pendingSwaps}</strong>
                  </div>
                </div>

                <div className="breakdown-card">
                  <div className="breakdown-icon accepted">
                    <CheckCircle2 size={18} />
                  </div>

                  <div>
                    <span>Accepted</span>
                    <strong>{analytics.acceptedSwaps}</strong>
                  </div>
                </div>

                <div className="breakdown-card">
                  <div className="breakdown-icon rejected">
                    <XCircle size={18} />
                  </div>

                  <div>
                    <span>Rejected</span>
                    <strong>{analytics.rejectedSwaps}</strong>
                  </div>
                </div>

              </div>

            </section>
          </>
        )}

      </main>
    </div>
  );
}

export default AdminAnalytics;