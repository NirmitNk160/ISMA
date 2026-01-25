import React from "react";
import { useNavigate } from "react-router-dom";

export default function Topbar() {
  const navigate = useNavigate();

  return (
    <header className="topbar">
      <h1>ISMA Dashboard</h1>

      <div className="user-info">
        <span>Welcome, NK 👋</span>

        {/* Clickable avatar */}
        <div
          className="avatar"
          onClick={() => navigate("/profile", {
            state: { from: "/dashboard" },
          })}
          role="button"
          aria-label="Go to profile"
        >
          NK
        </div>
      </div>
    </header>
  );
}
