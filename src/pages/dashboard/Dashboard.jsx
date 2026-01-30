import { useEffect, useState } from "react";
import "./Dashboard.css";

import api from "../../api/axios";
import BackButton from "../../components/BackButton";
import InventoryTopbar from "../Inventory/InventoryTopbar";
import Sidebar from "./Sidebar";
import StatCard from "./StatCard";
import Progress from "./Progress";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ---------------- FETCH DASHBOARD DATA ---------------- */
  useEffect(() => {
    api
      .get("/dashboard")
      .then((res) => {
        setStats(res.data);
      })
      .catch(() => {
        setError("Failed to load dashboard data");
      })
      .finally(() => setLoading(false));
  }, []);

  /* ---------------- LOADING ---------------- */
  if (loading) {
    return (
      <div className="dashboard-root">
        <InventoryTopbar />
        <div className="dashboard-body">
          <Sidebar />
          <main className="content">
            <p style={{ padding: "2rem" }}>
              Loading dashboard…
            </p>
          </main>
        </div>
      </div>
    );
  }

  /* ---------------- UI ---------------- */
  return (
    <div className="dashboard-root">
      <InventoryTopbar />

      <div className="dashboard-body">
        <Sidebar />

        <main className="content">
          <div className="page-header">
            <BackButton />
            <h2 className="page-title">Analytics</h2>
          </div>

          {error && (
            <div className="error-msg">❌ {error}</div>
          )}

          {/* STATS */}
          <section className="stats">
            <StatCard
              title="Total Revenue"
              value={`₹${stats?.totalRevenue ?? 0}`}
            />
            <StatCard
              title="Items Sold"
              value={stats?.itemsSold ?? 0}
            />
            <StatCard
              title="Active Products"
              value={stats?.activeProducts ?? 0}
            />
          </section>

          {/* GRID */}
          <section className="grid">
            <div className="card chart">
              <h3>Monthly Recap</h3>
              <div className="chart-placeholder">
                📊 Chart coming soon
              </div>
            </div>

            <div className="card">
              <h3>Top Products</h3>

              {stats?.topProducts?.length ? (
                stats.topProducts.map((p) => (
                  <Progress
                    key={p.name}
                    label={p.name}
                    value={p.sold}
                  />
                ))
              ) : (
                <p>No sales yet</p>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
