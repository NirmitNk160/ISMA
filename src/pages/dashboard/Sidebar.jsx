import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="sidebar">
      <h2 className="logo">ISMA</h2>

      <nav>
        <a
          className={isActive("/dashboard") ? "active" : ""}
          onClick={() =>
            navigate("/dashboard", { state: { from: "/" } })
          }
        >
          Dashboard
        </a>

        <a
          className={isActive("/inventory") ? "active" : ""}
          onClick={() =>
            navigate("/inventory", { state: { from: "/dashboard" } })
          }
        >
          Inventory
        </a>

        <a className={isActive("/sales") ? "active" : ""}>
          Sales
        </a>

        <a className={isActive("/reports") ? "active" : ""}>
          Reports
        </a>

        <a className={isActive("/settings") ? "active" : ""}>
          Settings
        </a>
      </nav>
    </aside>
  );
}
