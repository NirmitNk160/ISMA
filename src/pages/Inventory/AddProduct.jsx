import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import InventoryTopbar from "./InventoryTopbar";
import Sidebar from "../dashboard/Sidebar";
import BackButton from "../../components/BackButton";
import "./AddProduct.css";

export default function AddProduct() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    category: "",
    stock: "",
    price: "",
    description: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:5000/api/inventory", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...form,
        stock: Number(form.stock),
        price: Number(form.price),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message);
      return;
    }

    navigate("/inventory");
  };

  return (
    <div className="add-product-root">
      <InventoryTopbar />

      <div className="add-product-body">
        <Sidebar />

        <main className="add-product-content">
          {/* HEADER */}
          <div className="page-header">
            <BackButton />
            <h2 className="page-title">Add Product</h2>
          </div>

          {/* FORM CARD */}
          <form className="add-product-card" onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Product Name</label>
                <input
                  name="name"
                  placeholder="e.g. Wireless Mouse"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <input
                  name="category"
                  placeholder="e.g. Electronics"
                  value={form.category}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Stock</label>
                <input
                  type="number"
                  name="stock"
                  placeholder="e.g. 120"
                  value={form.stock}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Price (₹)</label>
                <input
                  type="number"
                  name="price"
                  placeholder="e.g. 799"
                  value={form.price}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group full">
                <label>Description</label>
                <textarea
                  name="description"
                  placeholder="Optional product description"
                  value={form.description}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* ACTIONS */}
            <div className="form-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => navigate("/inventory")}
              >
                Cancel
              </button>

              <button type="submit" className="primary-btn">
                Save Product
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
