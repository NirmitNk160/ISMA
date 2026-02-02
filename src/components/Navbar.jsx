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

  /* ================= FETCH PROFILE ================= */
  useEffect(() => {
    if (!isAuthenticated) {
      setProfile(null);
      return;
    }

    api
      .get("/auth/profile")
      .then((res) => setProfile(res.data))
      .catch(() => logout());
  }, [isAuthenticated, logout]);

  /* ================= VALUES ================= */
  const username = profile?.username || "User";
  const shopName = profile?.shop_name || "ISMA Inventory";
  const avatarText = username.slice(0, 2).toUpperCase();

  const hideBack =
    location.pathname === "/" ||
    location.pathname === "/dashboard";

  return (
    <nav className="navbar">
      {/* LEFT */}
      <div className="navbar-left">
        {!hideBack && <BackButton />}
        <h1 className="logo">{shopName}</h1>
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

            <div
              className="avatar"
              title="Profile"
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
