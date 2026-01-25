import React from "react";
import "./Dashboard.css";

import BackButton from "../../components/BackButton";
import Topbar from "./Topbar";
import Sidebar from "./Sidebar";
import StatCard from "./StatCard";
import Progress from "./Progress";

export default function Dashboard() {
  return (
    <div className="dashboard-root">
      {/* GLOBAL TOP BAR */}
      <Topbar />

      <div className="dashboard-body">
        {/* SIDEBAR */}
        <Sidebar />

        {/* MAIN CONTENT */}
        <main className="content">
          {/* PAGE HEADER (Back + Title) */}
          <div className="page-header">
            <BackButton />
            <h2 className="page-title">Inventory</h2>
          </div>

          {/* STATS */}
          <section className="stats">
            <StatCard
              title="Monthly Earnings"
              value="₹40,000"
              change="+3.48%"
            />
            <StatCard title="Sales" value="650" change="+12%" />
            <StatCard title="New Users" value="366" change="+20.4%" />
            <StatCard
              title="Pending Requests"
              value="18"
              change="-1.1%"
              danger
            />
          </section>

          {/* GRID SECTION */}
          <section className="grid">
            <div className="card chart">
              <h3>Monthly Recap Report</h3>
              <div className="chart-placeholder">📈 Chart goes here</div>
            </div>

            <div className="card">
              <h3>Products Sold</h3>
              <Progress label="Oblong T-Shirt" value={75} />
              <Progress label="Gundam Editions" value={62} />
              <Progress label="Rounded Hat" value={57} />
              <Progress label="Indomie Goreng" value={50} />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
