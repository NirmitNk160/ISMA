import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import "./Suppliers.css";

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const res = await api.get("/suppliers");
      setSuppliers(res.data);
    } catch {
      alert("Failed to load suppliers");
    }
  };

  const deleteSupplier = async (id) => {
    if (!window.confirm("Delete this supplier?")) return;

    try {
      await api.delete(`/suppliers/${id}`);
      fetchSuppliers();
    } catch {
      alert("Delete failed");
    }
  };

  return (
    <div className="suppliers-root">
      <Navbar />
      <div className="suppliers-body">
        <Sidebar />

        <main className="suppliers-content">
          <div className="suppliers-header">
            <h2>Suppliers</h2>
            <button onClick={() => navigate("/suppliers/add")}>
              + Add Supplier
            </button>
          </div>

          <table className="suppliers-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Company</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {suppliers.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{s.company_name || "-"}</td>
                  <td>{s.phone || "-"}</td>
                  <td>{s.email || "-"}</td>

                  <td>
                    <button
                      onClick={() => navigate(`/suppliers/edit/${s.id}`)}
                    >
                      Edit
                    </button>

                    <button onClick={() => deleteSupplier(s.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </main>
      </div>
    </div>
  );
}