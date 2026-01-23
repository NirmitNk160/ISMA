import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./../styles/home.css";

export default function Navbar({ setPage, user, onLogout }) {
  const navigate = useNavigate();
  return (
    <nav className="navbar">
      <h1 className="logo">ISMA</h1>

      <div className="nav-links">
        {!user ? (
          <>
            <button onClick={() => navigate("/login")}>Login</button>
            <button className="nav-btn" onClick={() => navigate("/register")}>
              Get Started
            </button>
          </>
        ) : (
          <div className="welcome-box">
            <span className="welcome-text">
              👋 Welcome {user.role === "admin" ? "Admin" : user.name}
            </span>

            <button className="nav-btn" onClick={onLogout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
