import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import api from "../../api/axios";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import BackButton from "../../components/BackButton";
import { useSettings } from "../../context/SettingsContext";
import { useCurrency } from "../../context/CurrencyContext";
import BarcodeScanner from "../../components/BarcodeScanner/BarcodeScanner";
import { useAuth } from "../../context/AuthContext";

import "./Billing.css";

export default function Billing() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { format } = useCurrency();
  const { profile, loading: authLoading, isAuthenticated } = useAuth();

  const inputRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [billItems, setBillItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [showScanner, setShowScanner] = useState(false);

  /* ================= LOAD PRODUCTS ================= */
  useEffect(() => {
    if (authLoading || !isAuthenticated) return;

    const loadProducts = async () => {
      try {
        const res = await api.get("/inventory");
        setProducts(res.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load products");
      }
    };

    loadProducts();
  }, [authLoading, isAuthenticated]);

  /* ================= STOCK MAP ================= */
  const availableStock = useMemo(() => {
    const map = {};
    products.forEach((p) => {
      const used = billItems.find((i) => i.product_id === p.id)?.quantity || 0;
      map[p.id] = p.stock - used;
    });
    return map;
  }, [products, billItems]);

  /* ================= HARDWARE SCANNER ================= */
  const handleBarcodeScan = (e) => {
    if (e.key !== "Enter") return;

    const code = e.target.value.trim();
    if (!code) return;

    addProductByBarcode(code);
    e.target.value = "";
  };

  /* ================= CAMERA SCAN ================= */
  const handleCameraScan = async (code) => {
    setError("");

    // Instant UI feedback
    setBillItems((prev) => {
      const existing = prev.find((i) => i.barcode === code);

      if (existing) {
        return prev.map((i) =>
          i.barcode === code ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }

      return [
        ...prev,
        {
          barcode: code,
          name: "Loading...",
          quantity: 1,
          priceINR: 0,
        },
      ];
    });

    addProductByBarcode(code);
    inputRef.current?.focus();
  };

  /* ================= MAIN BARCODE LOGIC ================= */
  const addProductByBarcode = async (code) => {
    try {
      const cleanCode = code
        .trim()
        .replace(/\/$/, "")
        .split("/")
        .pop()
        .split("?")[0];

      const res = await api.get(`/inventory/barcode/${cleanCode}`);
      const product = res.data;

      const remaining = availableStock[product.id] ?? product.stock;

      if (settings.blockOutOfStock && remaining <= 0) {
        setError("Product out of stock");
        return;
      }

      setBillItems((prev) => {
        // remove temporary loading entry safely
        const withoutLoading = prev.filter(
          (i) => i.barcode !== code && i.name !== "Loading...",
        );

        const existing = withoutLoading.find(
          (i) => i.product_id === product.id,
        );

        if (existing) {
          return withoutLoading.map((i) =>
            i.product_id === product.id
              ? { ...i, quantity: i.quantity + 1 }
              : i,
          );
        }

        return [
          ...withoutLoading,
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

      // remove stuck loading entry if API fails
      setBillItems((prev) => prev.filter((i) => i.name !== "Loading..."));

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

  /* ================= REMOVE ITEM ================= */
  const removeItem = (id) => {
    setBillItems((prev) => prev.filter((i) => i.product_id !== id));
  };

  /* ================= GENERATE PDF ================= */
  const generateInvoicePDF = (billId, items, profile) => {
    const doc = new jsPDF();

    /* STORE NAME */
    const storeName = profile?.shop_name || settings?.shopName || "My Store";

    /* DATE */
    const now = new Date();
    const formattedDate =
      String(now.getDate()).padStart(2, "0") +
      "/" +
      String(now.getMonth() + 1).padStart(2, "0") +
      "/" +
      now.getFullYear();

    const formattedTime = now.toLocaleTimeString();

    /* CURRENCY CONVERSION */
    const convertCurrency = (amountINR) => {
      const currency = settings?.currency || "INR";

      const rates = {
        INR: 1,
        USD: 0.012,
        EUR: 0.011,
      };

      return amountINR * rates[currency];
    };

    /* FORMAT CURRENCY */
    const formatCurrency = (amountINR) => {
      const currency = settings?.currency || "INR";

      const symbolMap = {
        INR: "Rs.",
        USD: "$",
        EUR: "€",
      };

      const localeMap = {
        INR: "en-IN",
        USD: "en-US",
        EUR: "de-DE",
      };

      const converted = convertCurrency(amountINR);

      return `${symbolMap[currency]} ${converted.toLocaleString(
        localeMap[currency],
        { minimumFractionDigits: 2 },
      )}`;
    };

    /* TOTAL */
    const totalINR = items.reduce((sum, i) => sum + i.quantity * i.priceINR, 0);

    /* HEADER */
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text(storeName.toUpperCase(), 14, 18);

    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text("Invoice", 14, 26);

    /* DETAILS */
    doc.setFontSize(11);
    doc.text(`Bill ID: ${billId}`, 14, 36);
    doc.text(`Date: ${formattedDate}`, 14, 42);
    doc.text(`Time: ${formattedTime}`, 14, 48);

    /* TABLE */
    autoTable(doc, {
      startY: 56,
      head: [["Product", "Qty", "Unit Price", "Total"]],
      body: items.map((i) => [
        i.name,
        i.quantity,
        formatCurrency(i.priceINR),
        formatCurrency(i.quantity * i.priceINR),
      ]),
      styles: {
        fontSize: 10,
        cellPadding: 4,
      },
      headStyles: {
        fontStyle: "bold",
      },
    });

    /* GRAND TOTAL */
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(
      `Grand Total: ${formatCurrency(totalINR)}`,
      14,
      doc.lastAutoTable.finalY + 15,
    );

    /* FOOTER */
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(
      "Thank you for shopping with us!",
      14,
      doc.lastAutoTable.finalY + 25,
    );

    doc.save(`invoice-${billId}.pdf`);
  };

  /* ================= CONFIRM BILL ================= */
  const confirmBill = async () => {
    if (!billItems.length || loading) return;

    try {
      setLoading(true);
      setError("");

      const res = await api.post("/billing/confirm", {
        items: billItems.map((i) => ({
          product_id: i.product_id,
          quantity: i.quantity,
        })),
      });

      const billId = res.data.bill_id;

      generateInvoicePDF(billId, billItems, profile, format);

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

  /* ================= LOADING ================= */
  if (authLoading) {
    return (
      <div className="billing-root">
        <Navbar />
        <div className="billing-body">
          <Sidebar />
          <main className="billing-content">
            <p className="billing-loading">Loading billing…</p>
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
              ref={inputRef}
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
                  <BarcodeScanner
                    onScan={handleCameraScan}
                    onClose={() => setShowScanner(false)}
                  />
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
