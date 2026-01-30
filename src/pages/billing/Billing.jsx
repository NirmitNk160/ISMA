import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import Sidebar from "../dashboard/Sidebar";
import InventoryTopbar from "../inventory/InventoryTopbar";
import BackButton from "../../components/BackButton";

import "./Billing.css";

export default function Billing() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [products, setProducts] = useState([]);
  const [billItems, setBillItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/inventory", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setProducts(res.data))
      .catch(() => alert("Failed to load products"));
  }, [token]);

  const addToBill = () => {
    if (!selectedProduct) {
      alert("Select a product");
      return;
    }

    if (quantity <= 0) {
      alert("Quantity must be at least 1");
      return;
    }

    const product = products.find((p) => p.id === Number(selectedProduct));

    if (!product) return;

    if (quantity > product.stock) {
      alert(`Only ${product.stock} items in stock`);
      return;
    }

    setBillItems((prev) => {
      const existing = prev.find((i) => i.product_id === product.id);

      if (existing) {
        const newQty = existing.quantity + quantity;

        if (newQty > product.stock) {
          alert(`Only ${product.stock} items in stock`);
          return prev;
        }

        return prev.map((item) =>
          item.product_id === product.id ? { ...item, quantity: newQty } : item,
        );
      }

      return [
        ...prev,
        {
          product_id: product.id,
          name: product.name,
          quantity,
          price: product.price,
        },
      ];
    });

    setQuantity(1);
    setSelectedProduct("");
  };

  const totalAmount = billItems.reduce(
    (sum, i) => sum + i.quantity * i.price,
    0,
  );

  const removeItem = (index) => {
    setBillItems((prev) => prev.filter((_, i) => i !== index));
  };

  const confirmBill = async () => {
    if (billItems.length === 0) return;

    try {
      await axios.post(
        "http://localhost:5000/api/billing/confirm",
        {
          items: billItems.map((i) => ({
            product_id: i.product_id,
            quantity: i.quantity,
          })),
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // ✅ show success message in UI
      setSuccess(true);

      // ✅ reset cart
      setBillItems([]);
      setSelectedProduct("");
      setQuantity(1);

      // ✅ auto redirect (smooth)
      setTimeout(() => {
        navigate("/sales", { replace: true });
      }, 1200);
    } catch (err) {
      console.error(err);
    }
  };

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
            <div
              style={{
                marginBottom: "16px",
                padding: "12px 18px",
                background: "rgba(34,197,94,0.15)",
                color: "#22c55e",
                borderRadius: "12px",
                fontWeight: 600,
              }}
            >
              ✔ Bill successful. Redirecting to sales…
            </div>
          )}

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
                onChange={(e) => setQuantity(+e.target.value)}
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
                    <td>₹{i.price * i.quantity}</td>
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

                {billItems.length === 0 && (
                  <tr>
                    <td
                      colSpan="4"
                      style={{ textAlign: "center", opacity: 0.6 }}
                    >
                      No items added
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="billing-footer">
              <div className="total">Total: ₹{totalAmount}</div>
              <button
                className="confirm-btn"
                onClick={confirmBill}
                disabled={billItems.length === 0}
              >
                Confirm Bill
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
