import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

export default function InventoryTopbar() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    api
      .get("/auth/profile")
      .then((res) => setProfile(res.data))
      .catch((err) => {
        if (err.response?.status === 401) {
          logout();
        }
      });
  }, [isAuthenticated, logout]);

  const initials = profile?.username
    ? profile.username.slice(0, 2).toUpperCase()
    : "U";

  return (
    <header className="topbar">
      <h1>ISMA Inventory</h1>

      <div className="user-info">
        <span>
          Welcome, {profile?.username || "User"} 👋
        </span>

        <button
          className="avatar"
          onClick={() => navigate("/profile")}
          aria-label="Go to profile"
        >
          {initials}
        </button>
      </div>
    </header>
  );
}
