import React from "react";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <h2 className="logo">ISMA</h2>
      <nav>
        <a className="active">Dashboard</a>
        <a>Inventory</a>
        <a>Sales</a>
        <a>Reports</a>
        <a>Settings</a>
      </nav>
    </aside>
  );
}
