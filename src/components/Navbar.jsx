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
  const avatarLetter = username.charAt(0).toUpperCase();

  return (
    <nav className="navbar">
      <BackButton />
      <h1 className="logo">ISMA</h1>

      <div className="nav-links">
        {!isAuthenticated ? (
          <>
            <button onClick={() => navigate("/login")}>Login</button>
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
              👋 Welcome {username}
            </span>

            {/* Avatar */}
            <div
              className="avatar"
              onClick={() => navigate("/profile")}
              title={username}
            >
              {avatarLetter}
            </div>

            <button className="logout-btn" onClick={logout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
