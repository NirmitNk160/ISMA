import React, { useEffect, useState } from "react";
import "./Inventory.css";

import BackButton from "../../components/BackButton";
import InventoryTopbar from "./InventoryTopbar";
import Sidebar from "../dashboard/Sidebar";
import { useNavigate } from "react-router-dom";

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:5000/api/inventory", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    setProducts(data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    const token = localStorage.getItem("token");

    await fetch(`http://localhost:5000/api/inventory/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    fetchProducts();
  };

  return (
    <div className="inventory-root">
      <InventoryTopbar />

      <div className="inventory-body">
        <Sidebar />

        <main className="inventory-content">
          <div className="inventory-header">
            <BackButton />
            <h2 className="inventory-title">Inventory</h2>
          </div>
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
                {products.map((p, i) => (
                  <tr key={p.id}>
                    <td>{i + 1}</td>
                    <td>{p.name}</td>
                    <td>{p.category}</td>
                    <td>{p.stock}</td>
                    <td>₹{p.price}</td>
                    <td
                      className={`status ${
                        p.status === "In Stock"
                          ? "success"
                          : p.status === "Low"
                            ? "warning"
                            : "danger"
                      }`}
                    >
                      {p.status}
                    </td>
                    <td>
                      <button
                        className="delete-btn"
                        onClick={() => deleteProduct(p.id)}
                      >
                        🗑 Delete
                      </button>
                    </td>
                  </tr>
                ))}

                {products.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center" }}>
                      No products found
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
