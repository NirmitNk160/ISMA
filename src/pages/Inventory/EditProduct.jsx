import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../../api/axios";
import Navbar from "../../components/Navbar";
import Sidebar from "../dashboard/Sidebar";
import BackButton from "../../components/BackButton";
import { useSettings } from "../../context/SettingsContext";
import { useCurrency } from "../../context/CurrencyContext";
import "./AddProduct.css";

export default function EditProduct() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { settings } = useSettings();
  const { rates } = useCurrency();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    category: "",
    stock: "",
    price: "", // shown in selected currency
    description: "",
  });

  useEffect(() => {
    api
      .get(`/inventory/${id}`)
      .then((res) => {
        const priceInINR = Number(res.data.price);

        let displayPrice = priceInINR;
        if (settings.currency !== "INR") {
          const rate = rates[settings.currency];
          if (rate) displayPrice = priceInINR * rate;
        }

        setForm({
          name: res.data.name ?? "",
          category: res.data.category ?? "",
          stock: res.data.stock ?? "",
          price: displayPrice.toFixed(2),
          description: res.data.description ?? "",
        });
      })
      .catch(() => {
        setError("Failed to load product");
      })
      .finally(() => setLoading(false));
  }, [id, settings.currency, rates]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const priceInput = Number(form.price);
    const stockInput = Number(form.stock);

    if (priceInput < 0 || stockInput < 0) {
      setError("Stock and price must be non-negative");
      return;
    }

    // 🔥 CONVERT BACK TO INR
    let priceInINR = priceInput;
    if (settings.currency !== "INR") {
      const rate = rates[settings.currency];
      if (!rate) {
        setError("Currency rate unavailable");
        return;
      }
      priceInINR = priceInput / rate;
    }

    setSaving(true);

    try {
      await api.put(`/inventory/${id}`, {
        name: form.name,
        category: form.category,
        stock: stockInput,
        price: Math.round(priceInINR),
        description: form.description,
      });

      navigate("/inventory");
    } catch {
      setError("Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="add-product-root">
        <Navbar />
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
      <Navbar />

      <div className="add-product-body">
        <Sidebar />

        <main className="add-product-content">
          <div className="page-header">
            <BackButton />
            <h2 className="page-title">Edit Product</h2>
          </div>

          <form className="add-product-card" onSubmit={handleSubmit}>
            {error && <div className="error-msg">❌ {error}</div>}

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
                <label>
                  Price ({settings.currency})
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
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
