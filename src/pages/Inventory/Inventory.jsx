import React from "react";
import "./Inventory.css";

import BackButton from "../../components/BackButton";
import InventoryTopbar from "./InventoryTopbar";
import Sidebar from "../dashboard/Sidebar";
import { useNavigate } from "react-router-dom";

export default function Inventory() {
  const navigate = useNavigate();

  return (
    <div className="inventory-root">
      {/* TOP BAR */}
      <InventoryTopbar />

      <div className="inventory-body">
        {/* SIDEBAR */}
        <Sidebar />

        {/* MAIN CONTENT */}
        <main className="inventory-content">
          {/* PAGE HEADER */}
          <div className="inventory-header">
            <BackButton />
            <h2 className="inventory-title">Inventory</h2>
          </div>

          {/* ACTION BAR */}
          <div className="inventory-actions">
            <button
              className="add-btn"
              onClick={() => navigate("/inventory/add")}
            >
              + Add Product
            </button>

            <input
              type="text"
              placeholder="Search product..."
              className="inventory-search"
            />
          </div>

          {/* INVENTORY TABLE */}
          <div className="inventory-card">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Stock</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>1</td>
                  <td>Wireless Mouse</td>
                  <td>Electronics</td>
                  <td>120</td>
                  <td>₹799</td>
                  <td className="status success">In Stock</td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => navigate("/inventory/edit/1")}
                    >
                      ✏️ Edit
                    </button>
                  </td>
                </tr>

                <tr>
                  <td>2</td>
                  <td>USB Keyboard</td>
                  <td>Electronics</td>
                  <td>12</td>
                  <td>₹999</td>
                  <td className="status warning">Low</td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => navigate("/inventory/edit/2")}
                    >
                      ✏️ Edit
                    </button>
                  </td>
                </tr>

                <tr>
                  <td>3</td>
                  <td>Office Chair</td>
                  <td>Furniture</td>
                  <td>0</td>
                  <td>₹6,499</td>
                  <td className="status danger">Out</td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => navigate("/inventory/edit/3")}
                    >
                      ✏️ Edit
                    </button>
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
