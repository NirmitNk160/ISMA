import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../api/axios";
import Navbar from "../../components/Navbar";
import Sidebar from "../dashboard/Sidebar";
import BackButton from "../../components/BackButton";
import { useCurrency } from "../../context/CurrencyContext";
import { useSettings } from "../../context/SettingsContext";
import { useAuth } from "../../context/AuthContext";

import "./Inventory.css";

export default function Inventory() {
  const navigate = useNavigate();
  const { format } = useCurrency();
  const { settings } = useSettings();
  const { loading: authLoading } = useAuth(); // ⭐ FIX

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  /* ================= SAFE FETCH PRODUCTS ================= */
  const fetchProducts = async () => {
    if (authLoading) return;

    setLoading(true);
    setError("");

    try {
      const url = showArchived
        ? "/inventory/archived/all"
        : "/inventory";

      const res = await api.get(url);
      setProducts(res.data);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Failed to load inventory"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) fetchProducts();
  }, [showArchived, authLoading]);

  /* ================= DELETE ================= */
  const confirmDelete = async () => {
    if (!deleteId || deleting) return;

    setDeleting(true);

    try {
      await api.delete(`/inventory/${deleteId}`);
      setDeleteId(null);
      fetchProducts();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete product"
      );
      setDeleteId(null);
    } finally {
      setDeleting(false);
    }
  };

  /* ================= SEARCH ================= */
  const filteredProducts = useMemo(() => {
    return products.filter((p) =>
      p.name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  /* ================= STOCK STATUS ================= */
  const getStatus = (stock) => {
    if (stock === 0)
      return { label: "Out of Stock", className: "out" };

    if (stock <= settings.lowStockThreshold)
      return { label: "Low Stock", className: "low" };

    return { label: "In Stock", className: "in" };
  };

  /* ================= LOADING GUARD ================= */
  if (loading || authLoading) {
    return (
      <div className="inventory-root">
        <Navbar />
        <div className="inventory-body">
          <Sidebar />
          <main className="inventory-content">
            <p style={{ padding: "2rem" }}>
              Loading inventory…
            </p>
          </main>
        </div>
      </div>
    );
  }

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

            <button
              className="archive-toggle"
              onClick={() =>
                setShowArchived(!showArchived)
              }
            >
              {showArchived
                ? "Active Products"
                : "Archived Products"}
            </button>

            <input
              className="inventory-search"
              placeholder="Search product..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />
          </div>

          {error && (
            <div className="error-msg">❌ {error}</div>
          )}

          <div className="inventory-card">
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
                  const status = getStatus(
                    Number(p.stock)
                  );

                  return (
                    <tr key={p.id}>
                      <td>{i + 1}</td>
                      <td>{p.name}</td>
                      <td>{p.category}</td>
                      <td>{p.stock}</td>
                      <td>
                        {format(Number(p.price))}
                      </td>

                      <td
                        className={`status ${status.className}`}
                      >
                        {status.label}
                      </td>

                      <td>
                        {!showArchived ? (
                          <>
                            <button
                              className="edit-btn"
                              onClick={() =>
                                navigate(
                                  `/inventory/edit/${p.id}`
                                )
                              }
                            >
                              ✏️ Edit
                            </button>

                            <button
                              className="delete-btn"
                              onClick={() =>
                                setDeleteId(p.id)
                              }
                            >
                              🗑 Archive
                            </button>
                          </>
                        ) : (
                          <button
                            className="restore-btn"
                            onClick={async () => {
                              await api.put(
                                `/inventory/restore/${p.id}`
                              );
                              fetchProducts();
                            }}
                          >
                            ♻️ Restore
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {filteredProducts.length === 0 && (
                  <tr>
                    <td
                      colSpan="7"
                      style={{
                        textAlign: "center",
                      }}
                    >
                      No products found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* DELETE MODAL */}
      {deleteId && (
        <div className="delete-overlay">
          <div className="delete-modal">
            <h3>Archive Product</h3>

            <p>
              This product will be archived. You
              can restore it anytime.
            </p>

            <div className="delete-actions">
              <button
                className="cancel-btn"
                onClick={() =>
                  setDeleteId(null)
                }
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                className="delete-btn"
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting
                  ? "Archiving…"
                  : "Archive"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
