import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../api/axios";
import Navbar from "../../components/Navbar";
import Sidebar from "../dashboard/Sidebar";
import BackButton from "../../components/BackButton";
import { useCurrency } from "../../context/CurrencyContext";
import { useSettings } from "../../context/SettingsContext";

import "./Inventory.css";

export default function Inventory() {
  const navigate = useNavigate();
  const { format } = useCurrency();
  const { settings } = useSettings();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [search, setSearch] = useState("");

  /* ================= FETCH PRODUCTS ================= */
  const fetchProducts = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await api.get("/inventory");
      setProducts(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  /* ================= DELETE ================= */
  const confirmDelete = async () => {
    if (!deleteId || deleting) return;

    setDeleting(true);

    try {
      await api.delete(`/inventory/${deleteId}`);
      setDeleteId(null);
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete product");
      setDeleteId(null);
    } finally {
      setDeleting(false);
    }
  };

  /* ================= SEARCH ================= */
  const filteredProducts = useMemo(() => {
    return products.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  /* ================= STOCK STATUS ================= */
  const getStatus = (stock) => {
    if (stock === 0) return { label: "Out of Stock", className: "out" };
    if (stock <= settings.lowStockThreshold)
      return { label: "Low Stock", className: "low" };
    return { label: "In Stock", className: "in" };
  };

  /* ================= UI ================= */
  return (
    <div className="inventory-root">
      <Navbar />

      <div className="inventory-body">
        <Sidebar />

        <main className="inventory-content">
          <div className="inventory-header">
            <BackButton />
            <h2 className="inventory-title">Inventory</h2>
          </div>

          <div className="inventory-actions">
            <button
              className="add-btn"
              onClick={() => navigate("/inventory/add")}
            >
              + Add Product
            </button>

            <input
              className="inventory-search"
              placeholder="Search product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {error && <div className="error-msg">❌ {error}</div>}

          <div className="inventory-card">
            {loading ? (
              <p style={{ padding: "1.5rem" }}>Loading inventory…</p>
            ) : (
              <table className="inventory-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Stock</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProducts.map((p, i) => {
                    const status = getStatus(Number(p.stock));

                    return (
                      <tr key={p.id}>
                        <td>{i + 1}</td>
                        <td>{p.name}</td>
                        <td>{p.category}</td>
                        <td>{p.stock}</td>
                        <td>{format(Number(p.price))}</td>

                        <td className={`status ${status.className}`}>
                          {status.label}
                        </td>

                        <td>
                          <button
                            className="edit-btn"
                            onClick={() =>
                              navigate(`/inventory/edit/${p.id}`)
                            }
                          >
                            ✏️ Edit
                          </button>

                          <button
                            className="delete-btn"
                            disabled={p.hasSales}
                            title={
                              p.hasSales
                                ? "Cannot delete product with sales"
                                : "Delete product"
                            }
                            onClick={() => setDeleteId(p.id)}
                          >
                            🗑 Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan="7" style={{ textAlign: "center" }}>
                        No products found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>

      {/* ================= DELETE CONFIRM MODAL ================= */}
      {deleteId && (
        <div className="delete-overlay">
          <div className="delete-modal">
            <h3>Delete Product</h3>
            <p>This action cannot be undone. Are you sure?</p>

            <div className="delete-actions">
              <button
                className="cancel-btn"
                onClick={() => setDeleteId(null)}
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                className="delete-btn"
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
