import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Billing.css";

export default function Billing() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [billItems, setBillItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/inventory", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => setProducts(res.data))
      .catch((err) => {
        console.error(err);
        alert("Failed to load products");
      });
  }, [token]);

  const addToBill = () => {
    // 🔒 GUARD 1: product must be selected
    if (!selectedProduct) {
      alert("Select a product");
      return;
    }

    // 🔒 GUARD 2: quantity must be valid
    if (quantity <= 0) {
      alert("Quantity must be at least 1");
      return;
    }

    const product = products.find((p) => p.id === Number(selectedProduct));

    // 🔒 GUARD 3: product must exist
    if (!product) {
      alert("Invalid product selected");
      return;
    }

    // 🔒 GUARD 4: stock check (frontend safety)
    if (quantity > product.stock) {
      alert(`Only ${product.stock} items in stock`);
      return;
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

    // reset quantity (UX improvement)
    setQuantity(1);
  };

  const confirmBill = async () => {
    const payload = {
      items: billItems.map((i) => ({
        product_id: i.product_id,
        quantity: i.quantity,
      })),
    };

    try {
      await axios.post("http://localhost:5000/api/billing/confirm", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Bill Successful ✅");
      navigate("/sales");
    } catch (err) {
      alert(err.response?.data?.message || "Billing failed");
    }
  };

  return (
    <div className="billing-root">
      <h2>Billing</h2>

      <div className="billing-controls">
        <select onChange={(e) => setSelectedProduct(e.target.value)}>
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

        <button onClick={addToBill}>Add</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Qty</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {billItems.map((i, idx) => (
            <tr key={idx}>
              <td>{i.name}</td>
              <td>{i.quantity}</td>
              <td>₹{i.price * i.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className="confirm-btn" onClick={confirmBill}>
        Confirm Bill
      </button>
    </div>
  );
}
