import { useEffect, useState } from "react";
import axios from "axios";
import "./Sales.css";

import InventoryTopbar from "../inventory/InventoryTopbar";
import Sidebar from "../dashboard/Sidebar";
import BackButton from "../../components/BackButton";

export default function Sales() {
  const [sales, setSales] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/sales", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const grouped = {};

        res.data.forEach((sale) => {
          const billKey = new Date(sale.created_at).getTime();

          if (!grouped[billKey]) {
            grouped[billKey] = {
              items: [],
              status: sale.status,
              created_at: sale.created_at,
            };
          }

          grouped[billKey].items.push({
            product: sale.product_name,
            quantity: Number(sale.quantity),
            unit_price: Number(sale.unit_price),
            total_price: Number(sale.total_price),
          });
        });

        setSales(Object.values(grouped));
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
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {sales.map((bill, i) => {
                  const billTotal = bill.items.reduce(
                    (sum, item) => sum + item.total_price,
                    0
                  );

                  return (
                    <tr key={i}>
                      <td>{i + 1}</td>

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
                            ₹{it.unit_price} × {it.quantity} = ₹
                            {it.total_price}
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

                {sales.length === 0 && (
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
