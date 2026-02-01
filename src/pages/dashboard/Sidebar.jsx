import { NavLink } from "react-router-dom";
import "./Sidebar.css";

export default function Sidebar({ isOpen, onClose }) {
  const linkClass = ({ isActive }) =>
    isActive ? "active" : "";

  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`}>
      
      {/* ❌ CLOSE BUTTON — PHONE ONLY */}
      <button
        className="close-btn"
        aria-label="Close menu"
        onClick={onClose}
      >
        ✕
      </button>

      <h2 className="logo">ISMA</h2>

      <nav onClick={onClose}>
        <NavLink to="/dashboard" className={linkClass}>
          Dashboard
        </NavLink>

        <NavLink to="/inventory" className={linkClass}>
          Inventory
        </NavLink>

        <NavLink to="/billing" className={linkClass}>
          Billing
        </NavLink>

        <NavLink to="/sales" className={linkClass}>
          Sales
        </NavLink>

        <NavLink to="/reports" className={linkClass}>
          Reports
        </NavLink>

        <NavLink to="/settings" className={linkClass}>
          Settings
        </NavLink>
      </nav>
    </aside>
  );
}
