import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ShieldCheck,
  UserRound,
  MapPin,
  Mail,
  CalendarDays,
  RefreshCw,
  Search,
  Users,
  UserCheck,
} from "lucide-react";
import "./AdminUsers.css";

function AdminUsers() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("clothswapToken");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/admin/users",
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
        throw new Error(data.message || "Unable to load users.");
      }

      setUsers(data.users || []);
    } catch (error) {
      console.error("Fetch users error:", error);
    } finally {
      setLoading(false);
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

  const adminCount = users.filter(
    (user) => user.role === "admin"
  ).length;

  const memberCount = users.filter(
    (user) => user.role !== "admin"
  ).length;

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return users;

    return users.filter((user) => {
      return (
        user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.location?.toLowerCase().includes(query) ||
        user.role?.toLowerCase().includes(query)
      );
    });
  }, [users, search]);

  return (
    <div className="admin-users-page">
      {/* Header */}
      <header className="users-page-header">
        <button
          className="back-admin-btn"
          onClick={() => navigate("/admin")}
        >
          <ArrowLeft size={17} />
          Dashboard
        </button>

        <div className="users-title-area">
          <span className="users-eyebrow">
            <ShieldCheck size={13} />
            ADMIN · COMMUNITY
          </span>

          <h1>User management</h1>

          <p>
            View and monitor everyone using ClothSwap.
          </p>
        </div>

        <button
          className="refresh-users-btn"
          onClick={fetchUsers}
          disabled={loading}
        >
          <RefreshCw
            size={16}
            className={loading ? "refresh-spinning" : ""}
          />
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </header>

      <main className="users-content">
        {/* Summary cards */}
        <section className="users-summary-grid">
          <div className="users-summary-card">
            <div>
              <span>TOTAL USERS</span>
              <strong>{users.length}</strong>
              <small>All registered accounts</small>
            </div>

            <div className="summary-icon">
              <Users size={21} />
            </div>
          </div>

          <div className="users-summary-card">
            <div>
              <span>MEMBERS</span>
              <strong>{memberCount}</strong>
              <small>Regular ClothSwap users</small>
            </div>

            <div className="summary-icon">
              <UserCheck size={21} />
            </div>
          </div>

          <div className="users-summary-card">
            <div>
              <span>ADMINS</span>
              <strong>{adminCount}</strong>
              <small>Platform administrators</small>
            </div>

            <div className="summary-icon admin-summary-icon">
              <ShieldCheck size={21} />
            </div>
          </div>
        </section>

        {/* Search */}
        {!loading && users.length > 0 && (
          <div className="users-toolbar">
            <div className="users-search">
              <Search size={17} />

              <input
                type="text"
                placeholder="Search users, email, location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              {search && (
                <button
                  className="clear-search-btn"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>

            <span className="results-count">
              {filteredUsers.length}{" "}
              {filteredUsers.length === 1
                ? "user"
                : "users"}
            </span>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="users-state">
            <div className="users-loader"></div>
            <p>Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          /* No users */
          <div className="users-state">
            <UserRound size={35} />
            <h3>No users found</h3>
            <p>
              There are no registered users yet.
            </p>
          </div>
        ) : filteredUsers.length === 0 ? (
          /* No search results */
          <div className="users-state">
            <Search size={35} />
            <h3>No matching users</h3>
            <p>
              Try searching with a different name,
              email, or location.
            </p>

            <button
              className="clear-results-btn"
              onClick={() => setSearch("")}
            >
              Clear search
            </button>
          </div>
        ) : (
          /* User table */
          <div className="users-table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>USER</th>
                  <th>EMAIL</th>
                  <th>LOCATION</th>
                  <th>ROLE</th>
                  <th>JOINED</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id}>
                    {/* User */}
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar">
                          {user.name
                            ?.charAt(0)
                            .toUpperCase() || "U"}
                        </div>

                        <div className="user-main-info">
                          <strong>
                            {user.name || "Unnamed user"}
                          </strong>

                          <small>
                            #{user._id?.slice(-6)}
                          </small>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td>
                      <div className="user-email">
                        <Mail size={14} />
                        <span>{user.email}</span>
                      </div>
                    </td>

                    {/* Location */}
                    <td>
                      <div className="user-location">
                        <MapPin size={14} />
                        <span>
                          {user.location || "Not set"}
                        </span>
                      </div>
                    </td>

                    {/* Role */}
                    <td>
                      <span
                        className={
                          user.role === "admin"
                            ? "role-badge admin-role"
                            : "role-badge user-role"
                        }
                      >
                        {user.role === "admin" ? (
                          <ShieldCheck size={13} />
                        ) : (
                          <UserRound size={13} />
                        )}

                        {user.role === "admin"
                          ? "Admin"
                          : "User"}
                      </span>
                    </td>

                    {/* Joined */}
                    <td>
                      <div className="joined-date">
                        <CalendarDays size={14} />
                        {formatDate(user.createdAt)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminUsers;