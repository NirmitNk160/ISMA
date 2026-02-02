import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import BackButton from "./BackButton";
import "./navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH PROFILE (SQL) ================= */
  useEffect(() => {
    if (!isAuthenticated) {
      setProfile(null);
      setLoading(false);
      return;
    }

    api
      .get("/auth/profile")
      .then((res) => setProfile(res.data))
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, [isAuthenticated, logout]);

  /* ================= DERIVED VALUES ================= */
  const username =
    profile?.username ||
    profile?.email?.split("@")[0] ||
    "User";

  const shopName =
    profile?.shop_name ||
    profile?.shopName ||
    "ISMA Inventory";

  const avatarText = username
    .slice(0, 2)
    .toUpperCase();

  const showBack =
    !["/", "/dashboard"].includes(location.pathname);

  if (loading) return null;

  return (
    <nav className="navbar">
      {/* LEFT */}
      <div className="navbar-left">
        {showBack && <BackButton />}
        <h1
          className="logo"
          onClick={() => navigate("/dashboard")}
        >
          {shopName}
        </h1>
      </div>

      {/* RIGHT */}
      <div className="navbar-right">
        {!isAuthenticated ? (
          <>
            <button onClick={() => navigate("/login")}>
              Login
            </button>
            <button
              className="nav-btn"
              onClick={() => navigate("/register")}
            >
              Get Started
            </button>
          </>
        ) : (
          <div className="welcome-box">
            <span className="welcome-text">
              👋 Welcome, {username}
            </span>

            {/* AVATAR */}
            <div
              className="avatar"
              title={`${username} • Profile`}
              onClick={() => navigate("/profile")}
            >
              {avatarText}
            </div>

            <button
              className="logout-btn"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
