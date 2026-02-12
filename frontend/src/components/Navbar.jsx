import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import BackButton from "./BackButton";
import "./navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const [profile, setProfile] = useState(null);

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

  const username = profile?.username || "User";
  const initials = username.slice(0, 2).toUpperCase();

  return (
    <nav className="navbar">
      <div className="navbar-left">
        {/* 🔥 LOGO = HOME */}
        <h1
          className="logo clickable"
          onClick={() => navigate("/")}
          title="Go to Dashboard"
        >
          ISMA
        </h1>
      </div>

      <div className="navbar-right">
        {!isAuthenticated ? (
          <>

            <button className="nav-link" onClick={() => navigate("/about")}>
              About
            </button>

            <button
              className="nav-link ghost"
              onClick={() => navigate("/login")}
            >
              Login
            </button>

            <button className="nav-btn" onClick={() => navigate("/register")}>
              Create Store
            </button>
          </>
        ) : (
          <>
            <span className="welcome-text">👋 Welcome, {username}</span>

            <div
              className="avatar"
              title="Profile"
              onClick={() => navigate("/profile")}
            >
              {initials}
            </div>

            <button className="logout-btn" onClick={logout}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
