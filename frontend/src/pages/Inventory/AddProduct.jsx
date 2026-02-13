import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../api/axios";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import BackButton from "../../components/BackButton";
import BarcodeScanner from "../../components/BarcodeScanner/BarcodeScanner";
import { fetchProductFromBarcode } from "../../utils/barcodeLookup";

import { useSettings } from "../../context/SettingsContext";
import { useCurrency } from "../../context/CurrencyContext";

import "./AddProduct.css";

export default function AddProduct() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { rates } = useCurrency();

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
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [infoMsg, setInfoMsg] = useState(""); // ⭐ new
  const [showScanner, setShowScanner] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const showInfo = (msg) => {
    setInfoMsg(msg);
    setTimeout(() => setInfoMsg(""), 4000);
  };

  /* ================= BARCODE SCAN ================= */
  const handleScan = async (code) => {
    setShowScanner(false);

    try {
      const local = await api.get(`/inventory/barcode/${code}`);

      setForm((prev) => ({
        ...prev,
        ...local.data,
        barcode: code,
      }));

      showInfo("Product loaded from your inventory.");
      return;
    } catch {}

    const online = await fetchProductFromBarcode(code);

    if (online) {
      setForm((prev) => ({
        ...prev,
        ...online,
        barcode: code,
      }));

      showInfo("Product details fetched automatically.");
    } else {
      setForm((prev) => ({ ...prev, barcode: code }));

      showInfo(
        "Product details not found. Please enter manually — it will auto-fill next time."
      );
    }
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const priceInput = Number(form.price);
    const stockInput = Number(form.stock);

    if (priceInput < 0 || stockInput < 0) {
      setError("Stock and price must be non-negative");
      return;
    }

    let priceInINR = priceInput;
    if (settings.currency !== "INR") {
      const rate = rates[settings.currency];
      if (!rate) {
        setError("Currency rate unavailable");
        return;
      }
      priceInINR = priceInput / rate;
    }

    setLoading(true);

    try {
      await api.post("/inventory", {
        ...form,
        stock: stockInput,
        price: Math.round(priceInINR),
      });

      navigate("/inventory");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-product-root">
      <Navbar />
      <div className="add-product-body">
        <Sidebar />

        <main className="add-product-content">
          <div className="page-header">
            <BackButton />
            <h2 className="page-title">Add Product</h2>
          </div>

          <form className="add-product-card" onSubmit={handleSubmit}>
            {error && <div className="error-msg">❌ {error}</div>}

            {infoMsg && (
              <div className="info-msg">ℹ️ {infoMsg}</div>
            )}

            <div className="form-grid">
              <div className="form-group">
                <label>Product Name</label>
                <input
                  name="name"
                  placeholder="Example: Sony Headphones WH-1000XM5"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Brand</label>
                <input
                  name="brand"
                  placeholder="Sony, Samsung, Nike…"
                  value={form.brand}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <input
                  name="category"
                  placeholder="Electronics, Grocery, Clothing…"
                  value={form.category}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Size / Variant</label>
                <input
                  name="size"
                  placeholder="500ml, Large, 128GB…"
                  value={form.size}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Stock</label>
                <input
                  type="number"
                  name="stock"
                  placeholder="Available quantity"
                  value={form.stock}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Price ({settings.currency})</label>
                <input
                  type="number"
                  placeholder={`Enter price in ${settings.currency}`}
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>SKU</label>
                <input
                  name="sku"
                  placeholder="Optional internal code"
                  value={form.sku}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Image URL</label>
                <input
                  name="image_url"
                  placeholder="Paste product image link"
                  value={form.image_url}
                  onChange={handleChange}
                />
              </div>

              {form.image_url && (
                <img
                  src={form.image_url}
                  alt="product"
                  style={{
                    width: 80,
                    marginTop: 10,
                    borderRadius: 10,
                  }}
                />
              )}

              <div className="form-group">
                <label>Barcode</label>
                <div className="barcode-field">
                  <input
                    name="barcode"
                    placeholder="Scan or enter barcode"
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
                  placeholder="Short product description (optional)"
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

              <button type="submit" className="primary-btn" disabled={loading}>
                {loading ? "Saving..." : "Save Product"}
              </button>
            </div>
          </form>

          {showScanner && (
            <div className="scanner-modal">
              <div className="scanner-box">
                <BarcodeScanner
                  onScan={handleScan}
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
