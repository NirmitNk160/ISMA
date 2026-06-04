import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  BarChart,
  Bar,
} from "recharts";

import "./Dashboard.css";

import api from "../../api/axios";
import BackButton from "../../components/BackButton";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import StatCard from "./StatCard";
import Progress from "./Progress";
import { useCurrency } from "../../context/CurrencyContext";
import { useAuth } from "../../context/AuthContext";

export default function Dashboard() {
  const { format } = useCurrency();
  const { user, loading: authLoading, isAuthenticated } = useAuth();

  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [lowStock, setLowStock] = useState([]);
  const [expiryAlerts, setExpiryAlerts] = useState([]);

  /* ================= STAT OPTIONS ================= */

  const statOptions = [
    { key: "totalRevenue", label: "Total Revenue", currency: true },
    { key: "totalProfit", label: "Total Profit", currency: true },
    { key: "totalExpenses", label: "Total Expenses", currency: true },
    { key: "todaySales", label: "Today's Sales", currency: true },
    { key: "inventoryValue", label: "Inventory Value", currency: true },
    { key: "monthlyRevenue", label: "Monthly Revenue", currency: true },
    { key: "itemsSold", label: "Items Sold" },
    { key: "activeProducts", label: "Active Products" },
    { key: "outOfStock", label: "Out of Stock" },
  ];

  const [selectedStats, setSelectedStats] = useState([]);
  useEffect(() => {
    if (!user) return;

    const saved = localStorage.getItem(`dashboardStats_${user.id}`);

    setSelectedStats(saved ? JSON.parse(saved) : statOptions.map((s) => s.key));
  }, [user]);

  const toggleStat = (key) => {
    const updated = selectedStats.includes(key)
      ? selectedStats.filter((s) => s !== key)
      : [...selectedStats, key];

    setSelectedStats(updated);
    localStorage.setItem(`dashboardStats_${user.id}`, JSON.stringify(updated));
  };

  /* ================= EXPIRY TEXT ================= */

  const getExpiryText = (date) => {
    if (!date) return "";

    const today = new Date();
    const expiry = new Date(date);

    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((expiry - today) / 86400000);

    if (diffDays < 0) return `Expired ${Math.abs(diffDays)} day(s) ago`;
    if (diffDays === 0) return "Expires today";
    if (diffDays <= 7) return `${diffDays} day(s) left`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} week(s) left`;

    return expiry.toLocaleDateString();
  };

  /* ================= DATA FETCH ================= */

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;

    let mounted = true;

    const fetchAll = async () => {
      try {
        const [dashboardRes, lowStockRes, expiryRes] = await Promise.all([
          api.get("/dashboard"),
          api.get("/inventory/low-stock"),
          api.get("/inventory/expiry-alerts"),
        ]);

        if (!mounted) return;

        setStats(dashboardRes.data || {});
        setLowStock(lowStockRes.data || []);
        setExpiryAlerts(expiryRes.data || []);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        if (mounted) setError("Failed to load dashboard data");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAll();

    return () => {
      mounted = false;
    };
  }, [authLoading, isAuthenticated]);

  /* ================= LOADING ================= */

  if (authLoading || loading) {
    return (
      <div className="dashboard-root">
        <Navbar />
        <div className="dashboard-body">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main className="content dashboard-loading">Loading dashboard…</main>
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

        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="content">
          {/* HEADER */}

          <div className="page-header">
            <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
              ☰
            </button>

            <BackButton />
            <h2 className="page-title">Analytics</h2>
          </div>

          {error && <div className="error-msg">❌ {error}</div>}

          {/* ================= STAT CUSTOMIZER ================= */}

          <div className="stats-filter">
            <details>
              <summary>Customize Stats ⚙️</summary>

              <div className="stats-dropdown">
                {statOptions.map((s) => (
                  <label key={s.key}>
                    <input
                      type="checkbox"
                      checked={selectedStats.includes(s.key)}
                      onChange={() => toggleStat(s.key)}
                    />
                    {s.label}
                  </label>
                ))}
              </div>
            </details>
          </div>

          {/* ================= STATS ================= */}

          <section className="stats">
            {statOptions
              .filter((s) => selectedStats.includes(s.key))
              .map((s) => (
                <StatCard
                  key={s.key}
                  title={s.label}
                  value={Number(stats[s.key] ?? 0)}
                  currency={s.currency}
                />
              ))}
          </section>

          {/* ================= LOW STOCK ================= */}

          {lowStock.length > 0 && (
            <section className="low-stock-card">
              <h3>⚠️ Low Stock Alerts</h3>

              {lowStock.map((p) => (
                <div key={p.id} className="low-stock-item">
                  <span className="low-stock-name">{p.name}</span>
                  <span className="low-stock-badge">{p.stock} left</span>
                </div>
              ))}
            </section>
          )}

          {/* ================= EXPIRY ALERT ================= */}

          {expiryAlerts.length > 0 && (
            <section className="low-stock-card">
              <h3>⏳ Expiry Alerts</h3>

              {expiryAlerts.map((p) => (
                <div key={p.id} className="low-stock-item">
                  <span>{p.name}</span>

                  <span
                    className={`low-stock-badge ${
                      new Date(p.expiry_date) - new Date() < 3 * 86400000
                        ? "danger"
                        : new Date(p.expiry_date) - new Date() < 7 * 86400000
                          ? "warning"
                          : ""
                    }`}
                  >
                    {getExpiryText(p.expiry_date)}
                  </span>
                </div>
              ))}
            </section>
          )}

          {/* ================= DEAD STOCK ================= */}

          {stats?.deadStock?.length > 0 && (
            <section className="low-stock-card">
              <h3>📦 Dead Stock (30+ days)</h3>

              {stats.deadStock.map((p, i) => (
                <div key={i} className="low-stock-item">
                  <span>{p.name}</span>

                  <span className="low-stock-badge danger">
                    {p.daysWithoutSale
                      ? `${p.daysWithoutSale} days`
                      : "Never sold"}
                  </span>
                </div>
              ))}
            </section>
          )}

          {/* ================= LOW PROFIT PRODUCTS ================= */}

          {stats?.lowProfitProducts?.length > 0 && (
            <section className="low-stock-card">
              <h3>📉 Low Profit Products</h3>

              {stats.lowProfitProducts.map((p, i) => (
                <div key={i} className="low-stock-item">
                  <span>{p.name}</span>

                  <span className="low-stock-badge warning">
                    {format(Number(p.profit ?? 0))}
                  </span>
                </div>
              ))}
            </section>
          )}

          {/* ================= SALES BY CATEGORY ================= */}

          <div className="card">
            <h3>Sales by Category</h3>

            {stats?.salesByCategory?.length ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={stats.salesByCategory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sold" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p>No category sales yet</p>
            )}
          </div>

          {/* ================= SALES TREND + TOP PRODUCTS ================= */}

          <section className="grid">
            <div className="card chart">
              <h3>Sales Trend (Last 30 Days)</h3>

              {stats?.salesTrend?.length ? (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={stats.salesTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <Legend />

                    <XAxis
                      dataKey="date"
                      tickFormatter={(d) =>
                        new Date(d).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                        })
                      }
                    />

                    <YAxis tickFormatter={(v) => format(v)} />

                    <Tooltip
                      formatter={(value, name) => {
                        if (name === "Orders") {
                          return [`${value} orders`, "Orders"];
                        }
                        return [format(value), name];
                      }}
                    />

                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#4f46e5"
                      strokeWidth={3}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="profit"
                      stroke="#16a34a"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="expenses"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="orders"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p>No recent sales</p>
              )}
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
