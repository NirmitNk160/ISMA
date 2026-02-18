import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../api/axios";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import BackButton from "../../components/BackButton";
import { useCurrency } from "../../context/CurrencyContext";
import { useSettings } from "../../context/SettingsContext";
import { useAuth } from "../../context/AuthContext";

import "./Inventory.css";

export default function Inventory() {
  const navigate = useNavigate();
  const { format } = useCurrency();
  const { settings } = useSettings();
  const { loading: authLoading, isAuthenticated } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [archiveId, setArchiveId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  /* FETCH PRODUCTS */
  useEffect(() => {
    if (authLoading || !isAuthenticated) return;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const url = showArchived ? "/inventory/archived/all" : "/inventory";

        const res = await api.get(url);
        setProducts(res.data || []);
      } catch {
        setError("Failed to load inventory");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [showArchived, authLoading, isAuthenticated]);

  /* ARCHIVE */
  const confirmArchive = async () => {
    try {
      setProcessing(true);
      await api.delete(`/inventory/${archiveId}`);
      setProducts((prev) => prev.filter((p) => p.id !== archiveId));
      setArchiveId(null);
    } catch {
      setError("Archive failed");
    } finally {
      setProcessing(false);
    }
  };

  /* PERMANENT DELETE */
  const confirmDelete = async () => {
    try {
      setProcessing(true);
      await api.delete(`/inventory/permanent/${deleteId}`);
      setProducts((prev) => prev.filter((p) => p.id !== deleteId));
      setDeleteId(null);
    } catch {
      setError("Delete failed");
    } finally {
      setProcessing(false);
    }
  };

  /* RESTORE */
  const restoreProduct = async (id) => {
    try {
      await api.put(`/inventory/restore/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      setError("Restore failed");
    }
  };

  /* SEARCH */
  const filteredProducts = useMemo(() => {
    return products.filter((p) =>
      `${p.name} ${p.brand ?? ""}`.toLowerCase().includes(search.toLowerCase()),
    );
  }, [products, search]);

  /* STATUS */
  const getStatus = (stock) => {
    if (stock === 0) return { label: "Out", className: "out" };
    if (stock <= settings.lowStockThreshold)
      return { label: "Low", className: "low" };
    return { label: "In", className: "in" };
  };

  /* LOADING SCREEN */
  if (authLoading || loading) {
    return (
      <div className="inventory-root">
        <Navbar />
        <div className="inventory-body">
          <Sidebar />
          <main className="inventory-content loading-state">
            Loading inventory…
          </main>
        </div>
      </div>
    );
  }

  /* EXPIRY STATUS */
  const getExpiryStatus = (expiry) => {
    if (!expiry) return null;

    const today = new Date();
    const exp = new Date(expiry);

    const diff = (exp - today) / (1000 * 60 * 60 * 24);

    if (diff < 0) return { label: "Expired", className: "expired" };
    if (diff <= 7) return { label: "Expiring", className: "expiring" };

    return { label: "Safe", className: "safe" };
  };

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
              onClick={() => setShowArchived(!showArchived)}
            >
              {showArchived ? "Active Products" : "Archived Products"}
            </button>

            <input
              className="inventory-search"
              placeholder="Search name or brand..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {error && <div className="error-msg">❌ {error}</div>}

          <div className="inventory-card">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th>Brand</th>
                  <th>Category</th>
                  <th>Size</th>
                  <th>Stock</th>
                  <th>Price</th>
                  <th>Expiry</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="no-data">
                      No products found
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p, i) => {
                    const status = getStatus(Number(p.stock));

                    return (
                      <tr key={p.id}>
                        <td data-label="#">{i + 1}</td>

                        <td data-label="Product" className="product-cell">
                          <img
                            src={p.image_url || "/placeholder.png"}
                            alt=""
                            className="product-thumb"
                          />
                          {p.name}
                        </td>

                        <td data-label="Brand">{p.brand || "-"}</td>
                        <td data-label="Category">{p.category}</td>
                        <td data-label="Size">{p.size || "-"}</td>
                        <td data-label="Stock">{p.stock}</td>
                        <td data-label="Price">{format(Number(p.price))}</td>
                        <td data-label="Expiry">
                          {(() => {
                            const exp = getExpiryStatus(p.expiry_date);
                            return exp ? (
                              <span className={`expiry-badge ${exp.className}`}>
                                {exp.label}
                              </span>
                            ) : (
                              "-"
                            );
                          })()}
                        </td>

                        <td
                          data-label="Status"
                          className={`status ${status.className}`}
                        >
                          {status.label}
                        </td>

                        <td data-label="Action">
                          {!showArchived ? (
                            <>
                              <button
                                className="edit-btn"
                                onClick={() =>
                                  navigate(`/inventory/edit/${p.id}`)
                                }
                              >
                                ✏️ Edit
                              </button>

                              <button
                                className="archive-btn"
                                onClick={() => setArchiveId(p.id)}
                              >
                                🗄️ Archive
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="restore-btn"
                                onClick={() => restoreProduct(p.id)}
                              >
                                ♻️ Restore
                              </button>

                              <button
                                className="delete-btn"
                                onClick={() => setDeleteId(p.id)}
                              >
                                ❌ Delete
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* ARCHIVE MODAL */}
      {archiveId && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Archive Product</h3>
            <p>This product will be archived safely.</p>

            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setArchiveId(null)}>
                Cancel
              </button>

              <button className="archive-btn" onClick={confirmArchive}>
                {processing ? "Archiving…" : "Archive"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteId && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Delete Permanently</h3>
            <p>This cannot be undone.</p>

            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setDeleteId(null)}>
                Cancel
              </button>

              <button className="delete-btn" onClick={confirmDelete}>
                {processing ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
