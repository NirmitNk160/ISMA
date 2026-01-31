import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import BackButton from "../../components/BackButton";
import "./profile.css";

export default function Profile() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/auth/profile")
      .then((res) => setProfile(res.data))
      .catch((err) => {
        if (err.response?.status === 401) logout();
        else setError("Failed to load profile");
      })
      .finally(() => setLoading(false));
  }, [logout]);

  if (loading) {
    return <div className="profile-loading">Loading profile…</div>;
  }

  if (!profile) {
    return <div className="profile-loading">{error}</div>;
  }

  const initials =
    profile.username?.slice(0, 2).toUpperCase() || "U";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      {/* TOP BAR */}
      <header className="profile-topbar">
        <div className="profile-topbar-inner">
          <BackButton />

          <div className="profile-brand">
            <span className="brand">ISMA</span>
            <span className="welcome">👋 Welcome</span>

            <button
              className="profile-pill"
              onClick={() => navigate("/")}
            >
              🏠 Home
            </button>
          </div>
        </div>
      </header>

      {/* PAGE */}
      <main className="profile-page">
        {/* HEADER */}
        <section className="profile-header">
          <div className="profile-avatar">{initials}</div>

          <div className="profile-header-text">
            <h2>{profile.username}</h2>
            <p>{profile.email}</p>
          </div>
        </section>

        {/* CARD */}
        <section className="profile-card">
          <div className="profile-grid">
            <div>
              <span>Shop Name</span>
              <strong>{profile.shop_name}</strong>
            </div>

            <div>
              <span>Username</span>
              <strong>{profile.username}</strong>
            </div>

            <div>
              <span>Email</span>
              <strong>{profile.email}</strong>
            </div>

            <div>
              <span>Mobile</span>
              <strong>{profile.mobile}</strong>
            </div>
          </div>
        </section>

        {/* ACTIONS */}
        <section className="profile-actions">
          <button
            className="primary"
            onClick={() => navigate("/dashboard")}
          >
            Back to Dashboard
          </button>

          <button
            className="danger"
            onClick={handleLogout}
          >
            Logout
          </button>
        </section>
      </main>
    </>
  );
}
