import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import BackButton from "../../components/BackButton";
import "./profile.css";

export default function Profile() {
  const navigate = useNavigate();
  const { logout, loading: authLoading } = useAuth(); // ⭐ IMPORTANT FIX

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ================= SAFE PROFILE FETCH ================= */
  useEffect(() => {
    if (authLoading) return; // ⭐ WAIT FOR AUTH

    let mounted = true;

    const fetchProfile = async () => {
      try {
        const res = await api.get("/auth/profile");

        if (mounted) {
          setProfile(res.data);
        }
      } catch (err) {
        console.error(err);

        if (err.response?.status === 401) {
          logout();
        } else if (mounted) {
          setError("Failed to load profile");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProfile();

    return () => {
      mounted = false;
    };
  }, [authLoading, logout]);

  /* ================= LOADING GUARD ================= */
  if (authLoading || loading) {
    return (
      <div className="profile-loading">
        Loading profile…
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-loading">
        {error || "No profile data"}
      </div>
    );
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
        <section className="profile-header">
          <div className="profile-avatar">{initials}</div>

          <div className="profile-header-text">
            <h2>{profile.username}</h2>
            <p>{profile.email}</p>
          </div>
        </section>

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
