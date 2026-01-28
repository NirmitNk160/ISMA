import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Topbar() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Get initials safely
  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : "U";

  return (
    <header className="topbar">
      <h1>ISMA Dashboard</h1>

      <div className="user-info">
        <span>
          Welcome, {user?.username || "User"} 👋
        </span>

        {/* Avatar */}
        <div
          className="avatar"
          onClick={() =>
            navigate("/profile", {
              state: { from: "/dashboard" },
            })
          }
          role="button"
          aria-label="Go to profile"
        >
          {initials}
        </div>
      </div>
    </header>
  );
}
