import { useEffect, useState } from "react";
import axios from "axios";
import "./Sales.css";

import InventoryTopbar from "../Inventory/InventoryTopbar";
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
              created_at: row.created_at,
              status: row.status,
              items: [],
              total: 0,
            };
          }

          grouped[row.bill_id].items.push({
            name: row.product_name,
            qty: row.quantity,
            price: row.unit_price,
            total: row.total_price,
          });

          grouped[row.bill_id].total += row.total_price;
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
            <h2>Sales</h2>
          </div>

          <div className="sales-card">
            <table className="sales-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {bills.map((bill, i) => (
                  <tr key={bill.bill_id}>
                    <td>{i + 1}</td>

                    <td>
                      {bill.items.map((it, idx) => (
                        <div key={idx}>{it.name}</div>
                      ))}
                    </td>

                    <td>
                      {bill.items.map((it, idx) => (
                        <div key={idx}>{it.qty}</div>
                      ))}
                    </td>

                    <td>
                      {bill.items.map((it, idx) => (
                        <div key={idx}>
                          ₹{it.price} × {it.qty} = ₹{it.total}
                        </div>
                      ))}
                      <div style={{ marginTop: 6, fontWeight: 600 }}>
                        Total: ₹{bill.total}
                      </div>
                    </td>

                    <td className={`sale-status ${bill.status.toLowerCase()}`}>
                      {bill.status}
                    </td>

                    <td>
                      {new Date(bill.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}

                {bills.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", opacity: 0.6 }}>
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
