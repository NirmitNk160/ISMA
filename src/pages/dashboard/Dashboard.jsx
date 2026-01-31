import { useEffect, useState } from "react";
import "./Dashboard.css";

import api from "../../api/axios";
import BackButton from "../../components/BackButton";
import InventoryTopbar from "../Inventory/InventoryTopbar";
import Sidebar from "./Sidebar";
import StatCard from "./StatCard";
import Progress from "./Progress";
import { useCurrency } from "../../context/CurrencyContext";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🔥 GLOBAL CURRENCY (UI ONLY)
  const { format } = useCurrency();

  /* ================= FETCH DASHBOARD DATA ================= */
  useEffect(() => {
    let mounted = true;

    api
      .get("/dashboard")
      .then((res) => {
        if (mounted) {
          setStats(res.data);
        }
      })
      .catch(() => {
        if (mounted) {
          setError("Failed to load dashboard data");
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  /* ================= LOADING ================= */
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

  /* ================= UI ================= */
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

          {/* ================= STATS ================= */}
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

          {/* ================= GRID ================= */}
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
