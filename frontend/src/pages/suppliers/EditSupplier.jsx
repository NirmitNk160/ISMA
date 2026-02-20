import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";

import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import "./Suppliers.css";

export default function EditSupplier() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({});

  useEffect(() => {
    api.get("/suppliers").then(res => {
      const found = res.data.find(s => s.id == id);
      if (found) setForm(found);
    });
  }, [id]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();

    try {
      await api.put(`/suppliers/${id}`, form);
      navigate("/suppliers");
    } catch {
      alert("Update failed");
    }
  };

  return (
    <div className="suppliers-root">
      <Navbar />
      <div className="suppliers-body">
        <Sidebar />

        <main className="suppliers-content">
          <h2>Edit Supplier</h2>

          <form className="supplier-form" onSubmit={submit}>
            <input
              name="name"
              value={form.name || ""}
              onChange={handleChange}
              required
            />

            <input
              name="company_name"
              value={form.company_name || ""}
              onChange={handleChange}
            />

            <input
              name="phone"
              value={form.phone || ""}
              onChange={handleChange}
            />

            <input
              name="email"
              value={form.email || ""}
              onChange={handleChange}
            />

            <textarea
              name="address"
              value={form.address || ""}
              onChange={handleChange}
            />

            <input
              name="gst_number"
              value={form.gst_number || ""}
              onChange={handleChange}
            />

            <textarea
              name="notes"
              value={form.notes || ""}
              onChange={handleChange}
            />

            <button type="submit">Update Supplier</button>
          </form>
        </main>
      </div>
    </div>
  );
}