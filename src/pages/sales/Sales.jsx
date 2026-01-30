import { useEffect, useState } from "react";
import axios from "axios";
import "./Sales.css";

import InventoryTopbar from "../inventory/InventoryTopbar";
import Sidebar from "../dashboard/Sidebar";
import BackButton from "../../components/BackButton";

export default function Sales() {
  const [bills, setBills] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/sales", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const grouped = {};

        res.data.forEach((row) => {
          if (!grouped[row.bill_id]) {
            grouped[row.bill_id] = {
              bill_id: row.bill_id,
              status: row.status,
              created_at: row.created_at,
              items: [],
            };
          }

          grouped[row.bill_id].items.push({
            product: row.product_name,
            quantity: Number(row.quantity),
            unit_price: Number(row.unit_price),
            total_price: Number(row.total_price),
          });
        });

        setBills(Object.values(grouped));
      })
      .catch(() => alert("Failed to load sales"));
  }, [token]);

  return (
    <div className="sales-root">
      <InventoryTopbar />

      <div className="sales-body">
        <Sidebar />

        <main className="sales-content">
          <div className="sales-header">
            <BackButton />
            <h2 className="sales-title">Sales</h2>
          </div>

          <div className="sales-card">
            <table className="sales-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Bill ID</th>
                  <th>Products</th>
                  <th>Qty</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {bills.map((bill, i) => {
                  const billTotal = bill.items.reduce(
                    (sum, it) => sum + it.total_price,
                    0
                  );

                  return (
                    <tr key={bill.bill_id}>
                      <td>{i + 1}</td>

                      <td>{bill.bill_id}</td>

                      <td>
                        {bill.items.map((it, idx) => (
                          <div key={idx}>{it.product}</div>
                        ))}
                      </td>

                      <td>
                        {bill.items.map((it, idx) => (
                          <div key={idx}>{it.quantity}</div>
                        ))}
                      </td>

                      <td>
                        {bill.items.map((it, idx) => (
                          <div key={idx}>
                            ₹{it.unit_price} × {it.quantity} = ₹{it.total_price}
                          </div>
                        ))}
                        <div style={{ marginTop: 6, fontWeight: 600 }}>
                          Total: ₹{billTotal}
                        </div>
                      </td>

                      <td className={`sale-status ${bill.status.toLowerCase()}`}>
                        {bill.status}
                      </td>

                      <td>
                        {new Date(bill.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}

                {bills.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", opacity: 0.6 }}>
                      No sales recorded
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
