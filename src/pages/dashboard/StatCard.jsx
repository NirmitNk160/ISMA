import React from "react";

export default function StatCard({
  title,
  value,
  change,
  trend, // "up" | "down" | "neutral"
}) {
  let trendClass = "";
  let trendSymbol = "";

  if (trend === "up") {
    trendClass = "success";
    trendSymbol = "▲";
  } else if (trend === "down") {
    trendClass = "danger";
    trendSymbol = "▼";
  } else if (trend === "neutral") {
    trendClass = "neutral";
    trendSymbol = "•";
  }

  return (
    <div className="card stat-card">
      <p className="stat-title">{title}</p>

      <h2 className="stat-value">{value}</h2>

      {change !== undefined && (
        <span className={`stat-change ${trendClass}`}>
          {trendSymbol} {change}
        </span>
      )}
    </div>
  );
}
