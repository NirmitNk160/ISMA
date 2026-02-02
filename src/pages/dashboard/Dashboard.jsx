import { useEffect, useState } from "react";
import "./Dashboard.css";

import api from "../../api/axios";
import BackButton from "../../components/BackButton";
import Navbar from "../../components/Navbar";
import Sidebar from "./Sidebar";
import StatCard from "./StatCard";
import Progress from "./Progress";
import { useCurrency } from "../../context/CurrencyContext";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ MOBILE SIDEBAR STATE
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { format } = useCurrency();

  useEffect(() => {
    api
      .get("/dashboard")
      .then((res) => setStats(res.data))
      .catch(() => setError("Failed to load dashboard data"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="dashboard-root">
        <Navbar />
        <div className="dashboard-body">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main className="content">Loading…</main>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-root">
      <Navbar />

      <div className="dashboard-body">
        {/* ✅ DARK OVERLAY (MOBILE ONLY VIA CSS) */}
        {sidebarOpen && (
          <div
            className="sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ✅ SIDEBAR */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* ✅ MAIN CONTENT */}
        <main className="content">
          <div className="page-header">
            {/* ☰ MENU BUTTON (CSS HIDES ON DESKTOP) */}
            <button
              className="menu-btn"
              aria-label="Open menu"
              onClick={() => setSidebarOpen(true)}
            >
              ☰
            </button>

            <BackButton />
            <h2 className="page-title">Analytics</h2>
          </div>

          {error && <div className="error-msg">❌ {error}</div>}

          <section className="stats">
            <StatCard
              title="Total Revenue"
              value={format(Number(stats?.totalRevenue ?? 0))}
            />
            <StatCard
              title="Items Sold"
              value={Number(stats?.itemsSold ?? 0)}
            />
            <StatCard
              title="Active Products"
              value={Number(stats?.activeProducts ?? 0)}
            />
          </section>

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
                    value={Number(p.sold ?? 0)}
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
