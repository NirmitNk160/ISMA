import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../api/axios";
import Sidebar from "../dashboard/Sidebar";
import Navbar from "../../components/Navbar";
import BackButton from "../../components/BackButton";
import { useSettings } from "../../context/SettingsContext";
import { useCurrency } from "../../context/CurrencyContext";
import BarcodeScanner from "../../components/BarcodeScanner";
import { useAuth } from "../../context/AuthContext";

import "./Billing.css";

export default function Billing() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { format } = useCurrency();
  const { loading: authLoading, isAuthenticated } = useAuth();

  const [products, setProducts] = useState([]);
  const [billItems, setBillItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [showScanner, setShowScanner] = useState(false);

  /* ================= SAFE LOAD PRODUCTS ================= */
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await api.get("/endpoint");
        setData(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load data");
      } finally {
        setLoading(false); // ALWAYS
      }
    };

    loadData();
  }, []);

  /* ================= TEMP STOCK ================= */
  const availableStock = useMemo(() => {
    const map = {};
    products.forEach((p) => {
      const used = billItems.find((i) => i.product_id === p.id)?.quantity || 0;
      map[p.id] = p.stock - used;
    });
    return map;
  }, [products, billItems]);

  /* ================= HARDWARE SCAN ================= */
  const handleBarcodeScan = (e) => {
    if (e.key !== "Enter") return;

    const code = e.target.value.trim();
    if (!code) return;

    addProductByBarcode(code);
    e.target.value = "";
  };

  /* ================= CAMERA SCAN ================= */
  const handleCameraScan = (code) => {
    addProductByBarcode(code);
    setShowScanner(false);
  };

  /* ================= COMMON SCAN LOGIC ================= */
  const addProductByBarcode = async (code) => {
    try {
      const res = await api.get(`/inventory/barcode/${code}`);
      const product = res.data;

      const remaining = availableStock[product.id] ?? product.stock;

      if (settings.blockOutOfStock && remaining <= 0) {
        setError("Product out of stock");
        return;
      }

      setBillItems((prev) => {
        const existing = prev.find((i) => i.product_id === product.id);

        if (existing) {
          return prev.map((i) =>
            i.product_id === product.id
              ? { ...i, quantity: i.quantity + 1 }
              : i,
          );
        }

        return [
          ...prev,
          {
            product_id: product.id,
            name: product.name,
            quantity: 1,
            priceINR: Number(product.price),
          },
        ];
      });

      setError("");
    } catch (err) {
      console.error(err);
      setError("Product not found");
    }
  };

  /* ================= MANUAL ADD ================= */
  const addToBill = () => {
    if (!selectedProduct || quantity <= 0) return;

    const product = products.find((p) => p.id === Number(selectedProduct));
    if (!product) return;

    const remaining = availableStock[product.id];

    if (settings.blockOutOfStock && remaining <= 0) {
      setError("Product out of stock");
      return;
    }

    if (quantity > remaining) {
      setError(`Only ${remaining} items left`);
      return;
    }

    setBillItems((prev) => {
      const existing = prev.find((i) => i.product_id === product.id);

      if (existing) {
        return prev.map((i) =>
          i.product_id === product.id
            ? { ...i, quantity: i.quantity + quantity }
            : i,
        );
      }

      return [
        ...prev,
        {
          product_id: product.id,
          name: product.name,
          quantity,
          priceINR: Number(product.price),
        },
      ];
    });

    setSelectedProduct("");
    setQuantity(1);
    setError("");
  };

  /* ================= TOTAL ================= */
  const totalINR = billItems.reduce(
    (sum, i) => sum + i.quantity * i.priceINR,
    0,
  );

  /* ================= REMOVE ================= */
  const removeItem = (id) => {
    setBillItems((prev) => prev.filter((i) => i.product_id !== id));
  };

  /* ================= CONFIRM BILL ================= */
  const confirmBill = async () => {
    if (!billItems.length || loading) return;

    try {
      setLoading(true);
      setError("");

      await api.post("/billing/confirm", {
        items: billItems.map((i) => ({
          product_id: i.product_id,
          quantity: i.quantity,
        })),
      });

      setSuccess(true);
      setBillItems([]);

      setTimeout(() => navigate("/sales"), 1200);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Billing failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= LOADING GUARD ================= */
  if (authLoading) {
    return (
      <div className="billing-root">
        <Navbar />
        <div className="billing-body">
          <Sidebar />
          <main className="billing-content">
            <p style={{ padding: "2rem" }}>Loading billing…</p>
          </main>
        </div>
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="billing-root">
      <Navbar />

      <div className="billing-body">
        <Sidebar />

        <main className="billing-content">
          <div className="billing-header">
            <BackButton />
            <h2>Billing</h2>
          </div>

          {success && (
            <div className="success-msg">✔ Bill successful. Redirecting…</div>
          )}

          {error && <div className="error-msg">❌ {error}</div>}

          <div className="billing-card">
            <input
              className="barcode-input"
              placeholder="Scan barcode or type here..."
              onKeyDown={handleBarcodeScan}
              autoFocus
            />

            <button className="scan-btn" onClick={() => setShowScanner(true)}>
              📷 Scan with Camera
            </button>

            {showScanner && (
              <div className="scanner-modal">
                <div className="scanner-box">
                  <button
                    className="close-btn"
                    onClick={() => setShowScanner(false)}
                  >
                    ✖ Close
                  </button>

                  <BarcodeScanner onScan={handleCameraScan} />
                </div>
              </div>
            )}

            <div className="billing-controls">
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
              >
                <option value="">Select product</option>

                {(products || [])
                  .filter((p) => availableStock[p.id] > 0)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Stock: {availableStock[p.id]})
                    </option>
                  ))}
              </select>

              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />

              <button
                className="add-btn"
                onClick={addToBill}
                disabled={!selectedProduct || quantity <= 0}
              >
                Add
              </button>
            </div>

            <table className="billing-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Total</th>
                  <th />
                </tr>
              </thead>

              <tbody>
                {billItems.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="empty-row">
                      No items added
                    </td>
                  </tr>
                ) : (
                  billItems.map((i) => (
                    <tr key={i.product_id}>
                      <td>{i.name}</td>
                      <td>{i.quantity}</td>
                      <td>{format(i.quantity * i.priceINR)}</td>
                      <td>
                        <button
                          className="remove-btn"
                          onClick={() => removeItem(i.product_id)}
                        >
                          ❌
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className="billing-footer">
              <div className="total">Total: {format(totalINR)}</div>

              <button
                className="confirm-btn"
                onClick={confirmBill}
                disabled={loading || !billItems.length}
              >
                {loading ? "Processing..." : "Confirm Bill"}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
