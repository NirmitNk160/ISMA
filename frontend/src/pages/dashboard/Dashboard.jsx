import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

import api from "../../api/axios";
import BackButton from "../../components/BackButton";
import Navbar from "../../components/Navbar";
import Sidebar from "./Sidebar";
import StatCard from "./StatCard";
import Progress from "./Progress";
import { useCurrency } from "../../context/CurrencyContext";
import { useAuth } from "../../context/AuthContext";

export default function Dashboard() {
  const navigate = useNavigate();
  const { format } = useCurrency();

  const { loading: authLoading, isAuthenticated } = useAuth();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* ================= SAFE FETCH ================= */
  useEffect(() => {
    if (authLoading || !isAuthenticated) return;

    let mounted = true;

    const fetchData = async () => {
      try {
        const res = await api.get("/dashboard");

        if (mounted) {
          setStats(res.data || {});
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        if (mounted) setError("Failed to load dashboard data");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [authLoading, isAuthenticated]);

  /* ================= LOADING GUARD ================= */
  if (authLoading || loading) {
    return (
      <div className="dashboard-root">
        <Navbar />
        <div className="dashboard-body">
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
          <main className="content">Loading dashboard…</main>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-root">
      <Navbar />

      <div className="dashboard-body">
        {sidebarOpen && (
          <div
            className="sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="content">
          <div className="page-header">
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
