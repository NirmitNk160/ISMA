import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../api/axios";
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (Number(form.stock) < 0 || Number(form.price) < 0) {
      setError("Stock and price must be non-negative");
      return;
    }

    setLoading(true);

    try {
      await api.post("/inventory", {
        ...form,
        stock: Number(form.stock),
        price: Number(form.price),
      });

      navigate("/inventory");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to add product"
      );
    } finally {
      setLoading(false);
    }
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
          <form
            className="add-product-card"
            onSubmit={handleSubmit}
          >
            {error && (
              <div className="error-msg">❌ {error}</div>
            )}

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
                  min="0"
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
                  min="0"
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
                disabled={loading}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-btn"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Product"}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
