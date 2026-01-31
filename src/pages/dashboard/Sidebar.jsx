import { NavLink } from "react-router-dom";
import "./sidebar.css";

export default function Sidebar() {
  const linkClass = ({ isActive }) =>
    isActive ? "active" : "";

  return (
    <aside className="sidebar">
      <h2 className="logo">ISMA</h2>

      <nav>
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
