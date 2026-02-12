import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../api/axios";
import Navbar from "../../components/Navbar";
import Sidebar from "../dashboard/Sidebar";
import BackButton from "../../components/BackButton";
import BarcodeScanner from "../../components/BarcodeScanner/BarcodeScanner";

import { useSettings } from "../../context/SettingsContext";
import { useCurrency } from "../../context/CurrencyContext";

import "./AddProduct.css";

export default function AddProduct() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { rates } = useCurrency();

  const [form, setForm] = useState({
    name: "",
    category: "",
    stock: "",
    price: "",
    description: "",
    barcode: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showScanner, setShowScanner] = useState(false);

  /* INPUT CHANGE */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* BARCODE SCAN */
  const handleScan = (code) => {
    setForm((prev) => ({ ...prev, barcode: code }));
    setShowScanner(false);
  };

  /* SUBMIT */
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
        name: form.name,
        category: form.category,
        stock: stockInput,
        price: Math.round(priceInINR),
        description: form.description,
        barcode: form.barcode,
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

            <div className="form-grid">
              <div className="form-group">
                <label>Product Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <input
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  placeholder="Example: Electronics, Grocery"
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
                  placeholder="Enter quantity"
                  required
                />
              </div>

              <div className="form-group">
                <label>Price ({settings.currency})</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  placeholder={`Enter price in ${settings.currency}`}
                  required
                />
              </div>

              {/* BARCODE FIELD */}
              <div className="form-group">
                <label>Barcode</label>

                <div className="barcode-field">
                  <input
                    name="barcode"
                    value={form.barcode}
                    onChange={handleChange}
                    placeholder="Scan or type barcode"
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
                  placeholder="Optional description"
                />
              </div>
            </div>

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

          {/* SCANNER MODAL */}
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
