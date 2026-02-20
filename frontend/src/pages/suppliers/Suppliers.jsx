import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../api/axios";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import BackButton from "../../components/BackButton";

import "./Suppliers.css";

export default function Suppliers() {
  const navigate = useNavigate();

  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  /* FETCH */
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        setLoading(true);
        const res = await api.get("/suppliers");
        setSuppliers(res.data || []);
      } catch {
        setError("Failed to load suppliers");
      } finally {
        setLoading(false);
      }
    };

    fetchSuppliers();
  }, []);

  /* DELETE */
  const confirmDelete = async () => {
    try {
      setProcessing(true);
      await api.delete(`/suppliers/${deleteId}`);
      setSuppliers((prev) => prev.filter((s) => s.id !== deleteId));
      setDeleteId(null);
    } catch {
      setError("Delete failed");
    } finally {
      setProcessing(false);
    }
  };

  /* SEARCH */
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s) =>
      `${s.name} ${s.company_name ?? ""}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [suppliers, search]);

  if (loading) {
    return (
      <div className="suppliers-root">
        <Navbar />
        <div className="suppliers-body">
          <Sidebar />
          <main className="suppliers-content loading-state">
            Loading suppliers…
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="suppliers-root">
      <Navbar />
      <div className="suppliers-body">
        <Sidebar />

        <main className="suppliers-content">
          <div className="suppliers-header">
            <BackButton />
            <h2>Suppliers</h2>
          </div>

          <div className="suppliers-actions">
            <button
              className="add-supplier-btn"
              onClick={() => navigate("/suppliers/add")}
            >
              + Add Supplier
            </button>

            <input
              className="suppliers-search"
              placeholder="Search supplier or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {error && <div className="error-msg">❌ {error}</div>}

          <div className="suppliers-card">
            <table className="suppliers-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th className="desktop-only">Company</th>
                  <th className="desktop-only">Phone</th>
                  <th className="desktop-only">Email</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredSuppliers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="no-data">
                      No suppliers found
                    </td>
                  </tr>
                ) : (
                  filteredSuppliers.map((s, i) => (
                    <React.Fragment key={s.id}>
                      {/* MAIN ROW */}
                      <tr
                        className="supplier-main-row"
                        onClick={() =>
                          setExpandedId(
                            expandedId === s.id ? null : s.id
                          )
                        }
                      >
                        <td>{i + 1}</td>
                        <td className="clickable-name">
                          {s.name}
                        </td>

                        <td className="desktop-only">
                          {s.company_name || "-"}
                        </td>
                        <td className="desktop-only">
                          {s.phone || "-"}
                        </td>
                        <td className="desktop-only">
                          {s.email || "-"}
                        </td>

                        <td>
                          <button
                            className="edit-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/suppliers/edit/${s.id}`);
                            }}
                          >
                            Edit
                          </button>

                          <button
                            className="delete-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteId(s.id);
                            }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>

                      {/* EXPAND ROW */}
                      {expandedId === s.id && (
                        <tr className="expand-row">
                          <td colSpan="6">
                            <div className="expand-content">
                              <div className="expand-item">
                                <span>Company</span>
                                <span>{s.company_name || "-"}</span>
                              </div>

                              <div className="expand-item">
                                <span>Phone</span>
                                <span>{s.phone || "-"}</span>
                              </div>

                              <div className="expand-item">
                                <span>Email</span>
                                <span>{s.email || "-"}</span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {deleteId && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Delete Supplier</h3>
            <p>This action cannot be undone.</p>

            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setDeleteId(null)}
              >
                Cancel
              </button>

              <button
                className="delete-btn"
                onClick={confirmDelete}
              >
                {processing ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}