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
        if (err.response?.status === 401) {
          logout();
        } else {
          setError("Failed to load profile");
        }
      })
      .finally(() => setLoading(false));
  }, [logout]);

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        Loading profile…
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        {error || "Profile unavailable"}
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      {/* PROFILE TOPBAR */}
      <header className="profile-topbar">
        <div className="profile-topbar-inner">
          <BackButton />

          <div className="profile-brand">
            <span className="brand">ISMA</span>
            <span className="welcome">👋 Welcome</span>

            <button
              className="profile-pill home-pill"
              onClick={() => navigate("/")}
              title="Go to Home"
            >
              🏠 Home
            </button>
          </div>
        </div>
      </header>

      {/* PROFILE CONTENT */}
      <section className="profile-page">
        <h2 className="profile-title">My Profile</h2>

        <div className="profile-card">
          <div className="profile-row">
            <span>Shop Name</span>
            <strong>{profile.shop_name}</strong>
          </div>

          <div className="profile-row">
            <span>Username</span>
            <strong>{profile.username}</strong>
          </div>

          <div className="profile-row">
            <span>Email</span>
            <strong>{profile.email}</strong>
          </div>

          <div className="profile-row">
            <span>Mobile</span>
            <strong>{profile.mobile}</strong>
          </div>
        </div>

        <div className="profile-actions">
          <button
            className="primary"
            onClick={() => navigate("/dashboard")}
          >
            Back to Dashboard
          </button>

          <button
            className="secondary"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </section>
    </>
  );
}
