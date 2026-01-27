import React from "react";
import { useNavigate } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      <h2 className="logo">ISMA</h2>
      <nav>
        <a onClick={() => navigate("/dashboard", {
            state: { from: "/" },
          })}>
        Dashboard
        </a>
        <a onClick={() => navigate("/inventory", {
            state: { from: "/dashboard" },
          })}>
        Inventory
        </a>
        <a>Sales</a>
        <a>Reports</a>
        <a>Settings</a>
      </nav>
    </aside>
  );
}
