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
  const { loading: authLoading, isAuthenticated } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  /* ================= FETCH PRODUCTS ================= */
  useEffect(() => {
    if (authLoading || !isAuthenticated) return;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const url = showArchived ? "/inventory/archived/all" : "/inventory";

        const res = await api.get(url);
        setProducts(res.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load inventory");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [showArchived, authLoading, isAuthenticated]);

  /* ================= ARCHIVE ================= */
  const confirmDelete = async () => {
    try {
      setDeleting(true);

      await api.delete(`/inventory/${deleteId}`);

      const res = await api.get(
        showArchived ? "/inventory/archived/all" : "/inventory",
      );

      setProducts(res.data || []);
      setDeleteId(null);
    } catch {
      setError("Unable to archive product");
    } finally {
      setDeleting(false);
    }
  };

  /* ================= SEARCH ================= */
  const filteredProducts = useMemo(() => {
    return products.filter((p) =>
      `${p.name} ${p.brand ?? ""}`.toLowerCase().includes(search.toLowerCase()),
    );
  }, [products, search]);

  /* ================= STATUS ================= */
  const getStatus = (stock) => {
    if (stock === 0) return { label: "Out", className: "out" };

    if (stock <= settings.lowStockThreshold)
      return { label: "Low", className: "low" };

    return { label: "In", className: "in" };
  };

  if (authLoading || loading) {
    return (
      <div className="inventory-root">
        <Navbar />
        <div className="inventory-body">
          <Sidebar />
          <main className="inventory-content">
            <p style={{ padding: "2rem" }}>Loading inventory…</p>
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
                  <th>Brand</th>
                  <th>Category</th>
                  <th>Size</th>
                  <th>Stock</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: "center" }}>
                      No products found
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p, i) => {
                    const status = getStatus(Number(p.stock));

                    return (
                      <tr key={p.id}>
                        <td data-label="#">{i + 1}</td>

                        <td data-label="Product">{p.name}</td>

                        <td data-label="Brand">{p.brand || "-"}</td>

                        <td data-label="Category">{p.category}</td>

                        <td data-label="Size">{p.size || "-"}</td>

                        <td data-label="Stock">{p.stock}</td>

                        <td data-label="Price">{format(Number(p.price))}</td>

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
                                className="delete-btn"
                                onClick={() => setDeleteId(p.id)}
                              >
                                🗑 Archive
                              </button>
                            </>
                          ) : (
                            <button
                              className="restore-btn"
                              onClick={async () => {
                                try {
                                  await api.put(`/inventory/restore/${p.id}`);

                                  // Remove restored item from current list instantly
                                  setProducts((prev) =>
                                    prev.filter((item) => item.id !== p.id),
                                  );
                                } catch {
                                  setError("Restore failed");
                                }
                              }}
                            >
                              ♻️ Restore
                            </button>
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

      {/* DELETE MODAL */}
      {deleteId && (
        <div className="delete-overlay">
          <div className="delete-modal">
            <h3>Archive Product</h3>
            <p>This product will be archived.</p>

            <div className="delete-actions">
              <button className="cancel-btn" onClick={() => setDeleteId(null)}>
                Cancel
              </button>

              <button className="delete-btn" onClick={confirmDelete}>
                {deleting ? "Archiving…" : "Archive"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
