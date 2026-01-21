import React from "react";

export default function Progress({ label, value }) {
  return (
    <div className="progress">
      <div className="progress-header">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="progress-bar">
        <div style={{ width: `${value}%` }}></div>
      </div>
    </div>
  );
}
