import { useEffect, useMemo, useState, Fragment } from "react";
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
  const [expandedId, setExpandedId] = useState(null);

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
    console.log("Archive clicked:", archiveId);

    try {
      setProcessing(true);
      await api.delete(`/inventory/${archiveId}`);
      setProducts((prev) => prev.filter((p) => p.id !== archiveId));
      setArchiveId(null);
    } catch (err) {
      console.log("Archive error:", err);
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
                  <th className="desktop-only">Brand</th>
                  <th className="desktop-only">Category</th>
                  <th className="desktop-only">Supplier</th>
                  <th className="desktop-only">Size</th>
                  <th>Stock</th>
                  <th>Price</th>
                  <th className="desktop-only">Expiry</th>
                  <th className="desktop-only">Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="no-data">
                      No products found
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p, i) => {
                    const status = getStatus(Number(p.stock));
                    const exp = getExpiryStatus(p.expiry_date);

                    return (
                      <Fragment key={p.id}>
                        {/* MAIN ROW */}
                        <tr
                          className="inventory-main-row"
                          onClick={() =>
                            setExpandedId(expandedId === p.id ? null : p.id)
                          }
                        >
                          <td>{i + 1}</td>

                          <td className="product-cell">
                            <img
                              src={p.image_url || "/placeholder.png"}
                              alt=""
                              className="product-thumb"
                            />
                            {p.name}
                          </td>

                          <td className="desktop-only">{p.brand || "-"}</td>
                          <td className="desktop-only">{p.category}</td>
                          <td className="desktop-only">
                            {p.supplier_name || "-"}
                          </td>
                          <td className="desktop-only">{p.size || "-"}</td>

                          <td>{p.stock}</td>
                          <td>{format(Number(p.price))}</td>

                          <td className="desktop-only">
                            {exp ? (
                              <span className={`expiry-badge ${exp.className}`}>
                                {exp.label}
                              </span>
                            ) : (
                              "-"
                            )}
                          </td>

                          <td
                            className={`desktop-only status ${status.className}`}
                          >
                            {status.label}
                          </td>

                          <td>
                            {!showArchived ? (
                              <>
                                <button
                                  className="edit-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/inventory/edit/${p.id}`);
                                  }}
                                >
                                  ✏️ Edit
                                </button>

                                <button
                                  className="archive-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    console.log("Archive button clicked");
                                    console.log("Product ID:", p.id);
                                    setArchiveId(p.id);
                                  }}
                                >
                                  🗄️ Archive
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  className="restore-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    restoreProduct(p.id);
                                  }}
                                >
                                  ♻️ Restore
                                </button>

                                <button
                                  className="delete-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteId(p.id);
                                  }}
                                >
                                  ❌ Delete
                                </button>
                              </>
                            )}
                          </td>
                        </tr>

                        {/* EXPAND MOBILE */}
                        {expandedId === p.id && (
                          <tr className="expand-row">
                            <td colSpan="11" className="expand-cell">
                              <div className="expand-content">
                                <div>
                                  <strong>Brand:</strong> {p.brand || "-"}
                                </div>
                                <div>
                                  <strong>Category:</strong> {p.category}
                                </div>
                                <div>
                                  <strong>Supplier:</strong>{" "}
                                  {p.supplier_name || "-"}
                                </div>
                                <div>
                                  <strong>Size:</strong> {p.size || "-"}
                                </div>
                                <div>
                                  <strong>Expiry:</strong>{" "}
                                  {exp ? exp.label : "-"}
                                </div>
                                <div>
                                  <strong>Status:</strong> {status.label}
                                </div>

                                <div className="expand-actions">
                                  {!showArchived ? (
                                    <>
                                      <button
                                        className="edit-btn"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigate(`/inventory/edit/${p.id}`);
                                        }}
                                      >
                                        ✏️ Edit
                                      </button>

                                      <button
                                        className="archive-btn"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setArchiveId(p.id);
                                        }}
                                      >
                                        🗄️ Archive
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <button
                                        className="restore-btn"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          restoreProduct(p.id);
                                        }}
                                      >
                                        ♻️ Restore
                                      </button>

                                      <button
                                        className="delete-btn"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setDeleteId(p.id);
                                        }}
                                      >
                                        ❌ Delete
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* ARCHIVE MODAL */}
      {archiveId !== null && (
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
      {deleteId !== null && (
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
