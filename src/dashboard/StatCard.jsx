import React from "react";

export default function StatCard({ title, value, change, danger }) {
  return (
    <div className="card stat-card">
      <p>{title}</p>
      <h2>{value}</h2>
      <span className={danger ? "danger" : "success"}>
        {change}
      </span>
    </div>
  );
}
