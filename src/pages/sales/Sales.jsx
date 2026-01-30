import { useEffect, useState } from "react";
import api from "../../api/axios";
import Sidebar from "../dashboard/Sidebar";
import InventoryTopbar from "../Inventory/InventoryTopbar";
import BackButton from "../../components/BackButton";
import "./Sales.css";

export default function Sales() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

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
            total: 0,
          };
        }

        const qty = Number(row.quantity) || 0;
        const price = Number(row.unit_price) || 0;
        const total = Number(row.total_price) || qty * price;

        grouped[billId].items.push({
          name: row.product_name,
          quantity: qty,
          price,
          total,
        });

        grouped[billId].total += total;
      });

      setBills(Object.values(grouped));
      setLoading(false);
    });
  }, []);

  if (loading) return null;

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

          {bills.length === 0 && (
            <p style={{ opacity: 0.6 }}>No sales found</p>
          )}

          {bills.map((bill) => (
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
                      <td>₹{item.price}</td>
                      <td>₹{item.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="bill-total">
                Total: ₹{bill.total}
              </div>
            </div>
          ))}
        </main>
      </div>
    </div>
  );
}
