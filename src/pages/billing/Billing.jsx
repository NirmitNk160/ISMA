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

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/inventory", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setProducts(res.data))
      .catch(() => alert("Failed to load products"));
  }, [token]);

  const addToBill = () => {
    if (!selectedProduct) return alert("Select a product");
    if (quantity <= 0) return alert("Quantity must be at least 1");

    const product = products.find((p) => p.id === Number(selectedProduct));
    if (!product) return alert("Invalid product");

    if (quantity > product.stock) {
      return alert(`Only ${product.stock} in stock`);
    }

    setBillItems((prev) => [
      ...prev,
      {
        product_id: product.id,
        name: product.name,
        quantity,
        price: product.price,
      },
    ]);

    setQuantity(1);
  };

  const totalAmount = billItems.reduce(
    (sum, i) => sum + i.quantity * i.price,
    0
  );

  const confirmBill = async () => {
    if (billItems.length === 0) {
      return alert("No items in bill");
    }

    try {
      await axios.post(
        "http://localhost:5000/api/billing/confirm",
        {
          items: billItems.map((i) => ({
            product_id: i.product_id,
            quantity: i.quantity,
          })),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Bill Successful ✅");
      navigate("/sales");
    } catch (err) {
      alert(err.response?.data?.message || "Billing failed");
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

              <button className="add-btn" onClick={addToBill}>
                Add
              </button>
            </div>

            <table className="billing-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {billItems.length === 0 && (
                  <tr>
                    <td colSpan="3" className="empty">
                      No items added
                    </td>
                  </tr>
                )}

                {billItems.map((i, idx) => (
                  <tr key={idx}>
                    <td>{i.name}</td>
                    <td>{i.quantity}</td>
                    <td>₹{i.quantity * i.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="billing-footer">
              <div className="total">Total: ₹{totalAmount}</div>
              <button className="confirm-btn" onClick={confirmBill}>
                Confirm Bill
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
