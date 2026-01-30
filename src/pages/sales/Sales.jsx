import React from "react";
import "./Sales.css";

import InventoryTopbar from "../inventory/InventoryTopbar";
import Sidebar from "../dashboard/Sidebar";
import BackButton from "../../components/BackButton";

export default function Sales() {
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

          <div className="sales-actions">
            <button className="add-sale-btn">+ Add Sale</button>
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
                <tr>
                  <td>1</td>
                  <td>LappyToppy</td>
                  <td>2</td>
                  <td>₹1598</td>
                  <td className="sale-status paid">Paid</td>
                  <td>01 Feb 2026</td>
                </tr>

                <tr>
                  <td colSpan="6" style={{ textAlign: "center", opacity: 0.6 }}>
                    No sales recorded
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
