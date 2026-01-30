import React, { useEffect, useState } from "react";
import "./Inventory.css";

import BackButton from "../../components/BackButton";
import InventoryTopbar from "./InventoryTopbar";
import Sidebar from "../dashboard/Sidebar";
import { useNavigate } from "react-router-dom";

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
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

  const confirmDelete = async () => {
    const token = localStorage.getItem("token");

    await fetch(`http://localhost:5000/api/inventory/${deleteId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setDeleteId(null);
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
                    <td className={`status ${p.status.toLowerCase()}`}>
                      {p.status}
                    </td>
                    <td>
                      <button
                        className="edit-btn"
                        onClick={() => navigate(`/inventory/edit/${p.id}`)}
                      >
                        ✏️ Edit
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() => setDeleteId(p.id)}
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

      {/* DELETE MODAL */}
      {deleteId && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <h3>Delete Product</h3>
            <p>Are you sure you want to delete this product?</p>

            <div className="modal-actions">
              <button
                className="modal-cancel"
                onClick={() => setDeleteId(null)}
              >
                Cancel
              </button>
              <button className="modal-delete" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
