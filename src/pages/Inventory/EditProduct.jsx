import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../../api/axios";
import InventoryTopbar from "./InventoryTopbar";
import Sidebar from "../dashboard/Sidebar";
import BackButton from "../../components/BackButton";

import "./AddProduct.css"; // reuse same CSS

export default function EditProduct() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    category: "",
    stock: "",
    price: "",
    description: "",
  });

  /* ================= FETCH PRODUCT ================= */
  useEffect(() => {
    api
      .get(`/inventory/${id}`)
      .then((res) => {
        setForm({
          name: res.data.name ?? "",
          category: res.data.category ?? "",
          stock: res.data.stock ?? "",
          price: res.data.price ?? "",
          description: res.data.description ?? "",
        });
      })
      .catch((err) => {
        setError(
          err.response?.data?.message || "Failed to load product"
        );
      })
      .finally(() => setLoading(false));
  }, [id]);

  /* ================= HANDLERS ================= */

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

    setSaving(true);

    try {
      await api.put(`/inventory/${id}`, {
        ...form,
        stock: Number(form.stock),
        price: Number(form.price),
      });

      navigate("/inventory");
    } catch (err) {
      setError(
        err.response?.data?.message || "Update failed"
      );
    } finally {
      setSaving(false);
    }
  };

  /* ================= UI ================= */

  if (loading) {
    return (
      <div className="add-product-root">
        <InventoryTopbar />
        <div className="add-product-body">
          <Sidebar />
          <main className="add-product-content">
            <p style={{ padding: "2rem" }}>Loading product…</p>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="add-product-root">
      <InventoryTopbar />

      <div className="add-product-body">
        <Sidebar />

        <main className="add-product-content">
          {/* HEADER */}
          <div className="page-header">
            <BackButton />
            <h2 className="page-title">Edit Product</h2>
          </div>

          {/* FORM */}
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
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <input
                  name="category"
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
                  value={form.price}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group full">
                <label>Description</label>
                <textarea
                  name="description"
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
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-btn"
                disabled={saving}
              >
                {saving ? "Updating..." : "Update Product"}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
