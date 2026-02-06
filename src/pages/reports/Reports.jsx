import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";

import Sidebar from "../dashboard/Sidebar";
import Navbar from "../../components/Navbar";
import BackButton from "../../components/BackButton";
import { useCurrency } from "../../context/CurrencyContext";
import { useSettings } from "../../context/SettingsContext";
import { useAuth } from "../../context/AuthContext";

import "./Reports.css";

export default function Reports() {
  const [inventory, setInventory] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { settings } = useSettings();
  const { format } = useCurrency();
  const { loading: authLoading } = useAuth(); // ⭐ IMPORTANT FIX

  /* ================= SAFE FETCH DATA ================= */
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await api.get("/endpoint");
        setData(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load data");
      } finally {
        setLoading(false); // ALWAYS
      }
    };

    loadData();
  }, []);

  /* ================= DERIVED REPORT ================= */
  const report = useMemo(() => {
    const totalProducts = inventory.length;
    const totalStock = inventory.reduce((a, b) => a + Number(b.stock || 0), 0);

    let totalRevenueINR = 0;
    let totalItemsSold = 0;
    const salesMap = {};

    sales.forEach((s) => {
      totalRevenueINR += Number(s.total_price || 0);
      totalItemsSold += Number(s.quantity || 0);

      salesMap[s.product_name] =
        (salesMap[s.product_name] || 0) + Number(s.quantity || 0);
    });

    const alerts = [];
    let healthScore = 100;

    inventory.forEach((p) => {
      const sold = salesMap[p.name] || 0;
      const stock = Number(p.stock || 0);

      if (stock === 0) {
        alerts.push({
          type: "danger",
          title: "Out of Stock",
          msg: `${p.name} is completely out of stock`,
        });
        healthScore -= 10;
      } else if (stock <= settings.lowStockThreshold) {
        alerts.push({
          type: "danger",
          title: "Very Low Stock",
          msg: `${p.name} has only ${stock} units left`,
        });
        healthScore -= 7;
      } else if (stock <= 15) {
        alerts.push({
          type: "warning",
          title: "Low Stock",
          msg: `${p.name} stock is running low`,
        });
        healthScore -= 4;
      }

      if (sold === 0 && stock > 0) {
        alerts.push({
          type: "warning",
          title: "Dead Stock",
          msg: `${p.name} has never been sold`,
        });
        healthScore -= 6;
      } else if (sold <= 2 && stock > 20) {
        alerts.push({
          type: "info",
          title: "Slow Moving",
          msg: `${p.name} has slow sales velocity`,
        });
        healthScore -= 3;
      }
    });

    const entries = Object.entries(salesMap);
    if (entries.length) {
      const totalSold = entries.reduce((a, b) => a + b[1], 0);
      const [topName, topQty] = entries.sort((a, b) => b[1] - a[1])[0];

      if (topQty / totalSold > 0.6) {
        alerts.push({
          type: "info",
          title: "Sales Dependency Risk",
          msg: `${topName} contributes over 60% of total sales`,
        });
        healthScore -= 6;
      }
    }

    healthScore = Math.max(0, Math.min(100, healthScore));

    return {
      totalProducts,
      totalStock,
      totalRevenueINR,
      totalItemsSold,
      alerts,
      healthScore,
    };
  }, [inventory, sales, settings.lowStockThreshold]);

  /* ================= LOADING GUARD ================= */
  if (authLoading || loading) {
    return (
      <div className="reports-root">
        <Navbar />
        <div className="reports-body">
          <Sidebar />
          <main className="reports-content">
            <p style={{ padding: "2rem" }}>Loading reports…</p>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-root">
      <Navbar />

      <div className="reports-body">
        <Sidebar />

        <main className="reports-content">
          <div className="reports-header">
            <BackButton />
            <h2>Reports & Business Insights</h2>
          </div>

          {error && <div className="error-msg">❌ {error}</div>}

          {/* SUMMARY */}
          <section className="report-summary">
            <div className="summary-card">
              <span>📦 Total Products</span>
              <strong>{report.totalProducts}</strong>
            </div>

            <div className="summary-card">
              <span>📊 Total Stock</span>
              <strong>{report.totalStock}</strong>
            </div>

            <div className="summary-card">
              <span>💰 Total Revenue</span>
              <strong>{format(report.totalRevenueINR)}</strong>
            </div>

            <div className="summary-card">
              <span>🛒 Items Sold</span>
              <strong>{report.totalItemsSold}</strong>
            </div>
          </section>

          {/* HEALTH */}
          <section className="health-section">
            <h3>📈 Store Health</h3>

            <div
              className={`health-bar ${
                report.healthScore > 70
                  ? "good"
                  : report.healthScore > 40
                    ? "warning"
                    : "danger"
              }`}
            >
              <div style={{ width: `${report.healthScore}%` }} />
            </div>

            <p>
              Health Score: <strong>{report.healthScore}%</strong>
            </p>
          </section>

          {/* ALERTS */}
          <section className="alerts-section">
            <h3>⚠ Alerts & Risks</h3>

            <div className="alerts-grid">
              {report.alerts.length ? (
                report.alerts.map((a, i) => (
                  <div key={i} className={`alert-card ${a.type}`}>
                    <strong>{a.title}</strong>
                    <p>{a.msg}</p>
                  </div>
                ))
              ) : (
                <div className="alert-card success">
                  <strong>All Good</strong>
                  <p>No risks detected</p>
                </div>
              )}
            </div>
          </section>

          {/* ACTIONS */}
          <section className="actions-section">
            <h3>✅ Recommended Actions</h3>
            <ul>
              <li>Restock low and out-of-stock products</li>
              <li>Run promotions for slow-moving items</li>
              <li>Diversify sales across more products</li>
              <li>Review dead stock for clearance or removal</li>
            </ul>
          </section>
        </main>
      </div>
    </div>
  );
}
