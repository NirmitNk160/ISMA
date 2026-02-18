import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../../api/axios";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import BackButton from "../../components/BackButton";
import BarcodeScanner from "../../components/BarcodeScanner/BarcodeScanner";
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
  const [showScanner, setShowScanner] = useState(false);

  const [form, setForm] = useState({
    name: "",
    brand: "",
    category: "",
    size: "",
    stock: "",
    price: "",
    description: "",
    barcode: "",
    sku: "",
    image_url: "",
    min_stock: "5",
    expiry_date: "",
  });

  /* LOAD PRODUCT */
  useEffect(() => {
    api
      .get(`/inventory/${id}`)
      .then((res) => {
        const p = res.data;

        let displayPrice = Number(p.price);
        if (settings.currency !== "INR") {
          const rate = rates[settings.currency];
          if (rate) displayPrice *= rate;
        }

        setForm({
          name: p.name || "",
          brand: p.brand || "",
          category: p.category || "",
          size: p.size || "",
          stock: p.stock || "",
          price: displayPrice.toFixed(2),
          description: p.description || "",
          barcode: p.barcode || "",
          sku: p.sku || "",
          image_url: p.image_url || "",
          min_stock: p.min_stock ?? 5,
          expiry_date: p.expiry_date
            ? new Date(p.expiry_date).toISOString().split("T")[0]
            : "",
        });
      })
      .catch(() => setError("Failed to load product"))
      .finally(() => setLoading(false));
  }, [id, settings.currency, rates]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleBarcodeScan = (code) => {
    setForm((prev) => ({ ...prev, barcode: code }));
    setShowScanner(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let priceInINR = Number(form.price);
    if (settings.currency !== "INR") {
      priceInINR /= rates[settings.currency];
    }

    setSaving(true);

    try {
      await api.put(`/inventory/${id}`, {
        ...form,
        price: Math.round(priceInINR),
      });

      navigate("/inventory");
    } catch {
      setError("Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p style={{ padding: 40 }}>Loading…</p>;
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
                <input name="name" value={form.name} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>Brand</label>
                <input
                  name="brand"
                  value={form.brand}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <input
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Size / Variant</label>
                <input name="size" value={form.size} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>Stock</label>
                <input
                  type="number"
                  name="stock"
                  value={form.stock}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Minimum Stock Alert</label>
                <input
                  type="number"
                  name="min_stock"
                  placeholder="Alert threshold (default 5)"
                  value={form.min_stock}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Expiry Date</label>
                <input
                  type="date"
                  name="expiry_date"
                  value={form.expiry_date}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Price ({settings.currency})</label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>SKU</label>
                <input name="sku" value={form.sku} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>Image URL</label>
                <input
                  name="image_url"
                  value={form.image_url}
                  onChange={handleChange}
                />
              </div>

              {form.image_url && (
                <img src={form.image_url} className="product-preview" />
              )}

              <div className="form-group">
                <label>Barcode</label>
                <div className="barcode-field">
                  <input
                    name="barcode"
                    value={form.barcode}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="scan-btn"
                    onClick={() => setShowScanner(true)}
                  >
                    📷 Scan
                  </button>
                </div>
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
              >
                Cancel
              </button>

              <button type="submit" className="primary-btn">
                {saving ? "Updating..." : "Update Product"}
              </button>
            </div>
          </form>

          {showScanner && (
            <div className="scanner-modal">
              <div className="scanner-box">
                <BarcodeScanner
                  onScan={handleBarcodeScan}
                  onClose={() => setShowScanner(false)}
                />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
