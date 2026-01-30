import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../api/axios";
import BackButton from "../../components/BackButton";
import InventoryTopbar from "./InventoryTopbar";
import Sidebar from "../dashboard/Sidebar";

import "./Inventory.css";

export default function Inventory() {
  const navigate = useNavigate();

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
      setError(
        err.response?.data?.message || "Failed to load inventory"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  /* ================= DELETE PRODUCT ================= */
  const confirmDelete = async () => {
    if (!deleteId || deleting) return;

    setDeleting(true);

    try {
      await api.delete(`/inventory/${deleteId}`);
      setDeleteId(null);
      fetchProducts();
    } catch (err) {
      alert(
        err.response?.data?.message || "Failed to delete product"
      );
    } finally {
      setDeleting(false);
    }
  };

  /* ================= SEARCH FILTER ================= */
  const filteredProducts = useMemo(() => {
    return products.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  /* ================= UI ================= */
  return (
    <div className="inventory-root">
      <InventoryTopbar />

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
              type="text"
              placeholder="Search product..."
              className="inventory-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {error && (
            <div className="error-msg">❌ {error}</div>
          )}

          <div className="inventory-card">
            {loading ? (
              <p style={{ padding: "1.5rem" }}>
                Loading inventory…
              </p>
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
                  {filteredProducts.map((p, i) => (
                    <tr key={p.id}>
                      <td>{i + 1}</td>
                      <td>{p.name}</td>
                      <td>{p.category}</td>
                      <td>{p.stock}</td>
                      <td>₹{p.price}</td>
                      <td
                        className={`status ${p.status.toLowerCase()}`}
                      >
                        {p.status}
                      </td>
                      <td>
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
                          🗑 Delete
                        </button>
                      </td>
                    </tr>
                  ))}

                  {filteredProducts.length === 0 && (
                    <tr>
                      <td
                        colSpan="7"
                        style={{ textAlign: "center" }}
                      >
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

      {/* DELETE MODAL */}
      {deleteId && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <h3>Delete Product</h3>
            <p>
              Are you sure you want to delete this product?
            </p>

            <div className="modal-actions">
              <button
                className="modal-cancel"
                onClick={() => setDeleteId(null)}
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                className="modal-delete"
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
