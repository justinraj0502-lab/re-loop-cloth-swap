import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Shirt,
  Repeat2,
  Clock3,
  ArrowUpRight,
  LogOut,
  ShieldCheck,
  Activity,
  BarChart3,
} from "lucide-react";
import API from "../api";
import "./AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalListings: 0,
    totalSwaps: 0,
    pendingSwaps: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("clothswapToken");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(`${API}/admin/stats`, {
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

      setStats(data.stats);
    } catch (error) {
      console.error("Admin stats error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("clothswapToken");
    localStorage.removeItem("clothswapUser");
    navigate("/login", { replace: true });
  };

  return (
    <div className="admin-page">

      {/* Sidebar */}
      <aside className="admin-sidebar">

        <div className="admin-brand">
          <div className="admin-brand-icon">
            <ShieldCheck size={21} />
          </div>

          <div>
            <strong>ClothSwap</strong>
            <span>ADMIN PANEL</span>
          </div>
        </div>

        <nav className="admin-nav">

          <button className="admin-nav-item active">
            <LayoutDashboard size={18} />
            Dashboard
          </button>

          <button
            className="admin-nav-item"
            onClick={() => navigate("/admin/users")}
          >
            <Users size={18} />
            Users
          </button>

          <button
            className="admin-nav-item"
            onClick={() => navigate("/admin/listings")}
          >
            <Shirt size={18} />
            Listings
          </button>

          <button
            className="admin-nav-item"
            onClick={() => navigate("/admin/swaps")}
          >
            <Repeat2 size={18} />
            Swaps
          </button>

          <button
            className="admin-nav-item"
            onClick={() => navigate("/admin/analytics")}
          >
            <BarChart3 size={18} />
            Analytics
          </button>

        </nav>

        <button
          className="admin-logout"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          Sign out
        </button>

      </aside>

      {/* Main */}
      <main className="admin-main">

        <header className="admin-header">

          <div>
            <span className="admin-eyebrow">
              <span className="admin-status-dot"></span>
              SYSTEM ONLINE
            </span>

            <h1>Dashboard</h1>

            <p>
              Monitor and manage your ClothSwap community.
            </p>
          </div>

          <div className="admin-header-actions">

            <button
              className="view-site-btn"
              onClick={() => navigate("/marketplace")}
            >
              View marketplace
              <ArrowUpRight size={16} />
            </button>

          </div>

        </header>

        {/* Stats */}
        <section className="admin-stats">

          <div className="admin-stat-card">

            <div className="stat-top">
              <div className="stat-icon">
                <Users size={19} />
              </div>

              <span className="stat-label">
                COMMUNITY
              </span>
            </div>

            <strong>
              {loading ? "—" : stats.totalUsers}
            </strong>

            <p>Total registered users</p>

          </div>

          <div className="admin-stat-card">

            <div className="stat-top">
              <div className="stat-icon">
                <Shirt size={19} />
              </div>

              <span className="stat-label">
                CLOTHING
              </span>
            </div>

            <strong>
              {loading ? "—" : stats.totalListings}
            </strong>

            <p>Total clothing listings</p>

          </div>

          <div className="admin-stat-card">

            <div className="stat-top">
              <div className="stat-icon">
                <Repeat2 size={19} />
              </div>

              <span className="stat-label">
                SWAPS
              </span>
            </div>

            <strong>
              {loading ? "—" : stats.totalSwaps}
            </strong>

            <p>Total swap requests</p>

          </div>

          <div className="admin-stat-card pending-card">

            <div className="stat-top">
              <div className="stat-icon">
                <Clock3 size={19} />
              </div>

              <span className="stat-label">
                ATTENTION
              </span>
            </div>

            <strong>
              {loading ? "—" : stats.pendingSwaps}
            </strong>

            <p>Pending swap requests</p>

          </div>

        </section>

        {/* Management */}
        <section className="admin-management">

          <div className="management-heading">

            <div>
              <span>CONTROL CENTER</span>
              <h2>Manage your platform</h2>
            </div>

            <Activity size={22} />

          </div>

          <div className="management-grid">

            <button
              className="management-card"
              onClick={() => navigate("/admin/users")}
            >
              <div className="management-icon">
                <Users size={22} />
              </div>

              <div>
                <h3>Manage users</h3>
                <p>View and monitor community members.</p>
              </div>

              <ArrowUpRight size={19} />
            </button>

            <button
              className="management-card"
              onClick={() => navigate("/admin/listings")}
            >
              <div className="management-icon">
                <Shirt size={22} />
              </div>

              <div>
                <h3>Manage listings</h3>
                <p>Review clothing posted by users.</p>
              </div>

              <ArrowUpRight size={19} />
            </button>

            <button
              className="management-card"
              onClick={() => navigate("/admin/swaps")}
            >
              <div className="management-icon">
                <Repeat2 size={22} />
              </div>

              <div>
                <h3>Manage swaps</h3>
                <p>Monitor exchange requests and status.</p>
              </div>

              <ArrowUpRight size={19} />
            </button>

            <button
              className="management-card"
              onClick={() => navigate("/admin/analytics")}
            >
              <div className="management-icon">
                <BarChart3 size={22} />
              </div>

              <div>
                <h3>View analytics</h3>
                <p>Track community activity and performance.</p>
              </div>

              <ArrowUpRight size={19} />
            </button>

          </div>

        </section>

      </main>

    </div>
  );
}

export default AdminDashboard;