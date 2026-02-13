import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
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

      {/* LOGO */}
      <div className="navbar-left">
        <h1 className="logo" onClick={() => navigate("/")}>
          ISMA
        </h1>
      </div>

      {/* RIGHT */}
      <div className="navbar-right">
        {!isAuthenticated ? (
          <>
            <button onClick={() => navigate("/about")}>
              About
            </button>

            <button onClick={() => navigate("/login")}>
              Login
            </button>

            <button
              className="nav-btn"
              onClick={() => navigate("/register")}
            >
              Create Store
            </button>
          </>
        ) : (
          <>
            <span className="welcome-text">
              👋 {username}
            </span>

            <div
              className="avatar"
              onClick={() => navigate("/profile")}
              title="Profile"
            >
              {initials}
            </div>

            <button
              className="logout-btn"
              onClick={logout}
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
