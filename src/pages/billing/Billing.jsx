import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../api/axios";
import Sidebar from "../dashboard/Sidebar";
import InventoryTopbar from "../inventory/InventoryTopbar";
import BackButton from "../../components/BackButton";
import { useSettings } from "../../context/SettingsContext";
import { useCurrency } from "../../context/CurrencyContext";

import "./Billing.css";

export default function Billing() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { format, rates } = useCurrency();

  const [products, setProducts] = useState([]);
  const [billItems, setBillItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  /* -------------------- LOAD PRODUCTS -------------------- */
  useEffect(() => {
    api
      .get("/inventory")
      .then((res) => setProducts(res.data))
      .catch(() => setError("Failed to load products"));
  }, []);

  /* -------------------- ADD TO BILL -------------------- */
  const addToBill = () => {
    if (!selectedProduct || quantity <= 0) return;

    const product = products.find((p) => p.id === Number(selectedProduct));
    if (!product) return;

    if (quantity > product.stock) {
      setError(`Only ${product.stock} items in stock`);
      return;
    }

    setBillItems((prev) => {
      const existing = prev.find((i) => i.product_id === product.id);

      if (existing) {
        const newQty = existing.quantity + quantity;

        if (newQty > product.stock) {
          setError(`Only ${product.stock} items in stock`);
          return prev;
        }

        return prev.map((i) =>
          i.product_id === product.id ? { ...i, quantity: newQty } : i,
        );
      }

      return [
        ...prev,
        {
          product_id: product.id,
          name: product.name,
          quantity,
          priceINR: Number(product.price), // 🔥 ALWAYS INR
        },
      ];
    });

    setQuantity(1);
    setSelectedProduct("");
    setError("");
  };

  /* -------------------- UI TOTAL (SELECTED CURRENCY) -------------------- */
  // 🔥 TOTAL ALWAYS IN INR
  const totalINR = billItems.reduce(
    (sum, i) => sum + i.quantity * i.priceINR,
    0,
  );

  /* -------------------- REMOVE ITEM -------------------- */
  const removeItem = (index) => {
    setBillItems((prev) => prev.filter((_, i) => i !== index));
  };

  /* -------------------- CONFIRM BILL -------------------- */
  const confirmBill = async () => {
    if (!billItems.length || loading) return;

    setLoading(true);
    setError("");

    try {
      // 🔥 BACKEND RECEIVES INR ONLY
      await api.post("/billing/confirm", {
        items: billItems.map((i) => ({
          product_id: i.product_id,
          quantity: i.quantity,
        })),
      });

      setSuccess(true);
      setBillItems([]);

      setTimeout(() => {
        navigate("/sales", { replace: true });
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Billing failed");
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- UI -------------------- */
  return (
    <div className="billing-root">
      <InventoryTopbar />

      <div className="billing-body">
        <Sidebar />

        <main className="billing-content">
          <div className="billing-header">
            <BackButton />
            <h2>Billing</h2>
          </div>

          {success && (
            <div className="success-msg">
              ✔ Bill successful. Redirecting to sales…
            </div>
          )}

          {error && <div className="error-msg">❌ {error}</div>}

          <div className="billing-card">
            <div className="billing-controls">
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
              >
                <option value="">Select product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Stock: {p.stock})
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
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {billItems.map((i, idx) => (
                  <tr key={idx}>
                    <td>{i.name}</td>
                    <td>{i.quantity}</td>
                    <td>{format(i.priceINR * i.quantity)}</td>
                    <td>
                      <button
                        className="remove-btn"
                        onClick={() => removeItem(idx)}
                      >
                        ❌
                      </button>
                    </td>
                  </tr>
                ))}

                {!billItems.length && (
                  <tr>
                    <td colSpan="4" className="empty-row">
                      No items added
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="billing-footer">
              <div className="total">Total: {format(totalINR)}</div>

              <button
                className="confirm-btn"
                onClick={confirmBill}
                disabled={!billItems.length || loading}
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
