import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../api/axios";
import Sidebar from "../dashboard/Sidebar";
import Navbar from "../../components/Navbar";
import BackButton from "../../components/BackButton";
import { useCurrency } from "../../context/CurrencyContext";

import "./Sales.css";

export default function Sales() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { format } = useCurrency();

  /* ================= FETCH SALES ================= */
  useEffect(() => {
    api.get("/sales").then((res) => {
      const grouped = {};

      res.data.forEach((row) => {
        const billId = row.bill_id;

        if (!grouped[billId]) {
          grouped[billId] = {
            bill_id: billId,
            created_at: row.created_at,
            items: [],
            totalINR: 0,
          };
        }

        const qty = Number(row.quantity) || 0;
        const unitPriceINR = Number(row.unit_price) || 0;
        const totalPriceINR =
          Number(row.total_price) || qty * unitPriceINR;

        grouped[billId].items.push({
          name: row.product_name,
          quantity: qty,
          unitPriceINR,
          totalPriceINR,
        });

        grouped[billId].totalINR += totalPriceINR;
      });

      setBills(Object.values(grouped));
      setLoading(false);
    });
  }, []);

  if (loading) return null;

  return (
    <div className="sales-root">
      <Navbar />

      <div className="sales-body">
        <Sidebar />

        <main className="sales-content">
          <div className="sales-header">
            <BackButton />
            <h2>Sales</h2>
          </div>

          {/* ================= EMPTY STATE ================= */}
          {bills.length === 0 ? (
            <div className="sales-empty">
              <div className="sales-empty-card">
                <div className="sales-empty-icon">🧾</div>
                <h3>No Sales Yet</h3>
                <p>
                  You haven’t generated any bills yet.  
                  Start billing to see your sales history here.
                </p>

                <button
                  className="sales-empty-btn"
                  onClick={() => navigate("/billing")}
                >
                  ➕ Create First Bill
                </button>
              </div>
            </div>
          ) : (
            /* ================= SALES LIST ================= */
            bills.map((bill) => (
              <div key={bill.bill_id} className="sales-card">
                <div className="sales-card-header">
                  <span>🧾 {bill.bill_id}</span>
                  <span>
                    {new Date(bill.created_at).toLocaleString()}
                  </span>
                </div>

                <table className="sales-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Qty</th>
                      <th>Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>

                  <tbody>
                    {bill.items.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>{format(item.unitPriceINR)}</td>
                        <td>{format(item.totalPriceINR)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="bill-total">
                  Total: {format(bill.totalINR)}
                </div>
              </div>
            ))
          )}
        </main>
      </div>
    </div>
  );
}
