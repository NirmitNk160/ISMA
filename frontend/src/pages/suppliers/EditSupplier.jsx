import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import api from "../../api/axios";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import BackButton from "../../components/BackButton";

import "./Suppliers.css";

export default function EditSupplier() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    company_name: "",
    phone: "",
    email: "",
    address: "",
    gst_number: "",
    notes: "",
  });

  /* LOAD SUPPLIER */
  useEffect(() => {
    api
      .get(`/suppliers/${id}`)
      .then((res) => setForm(res.data))
      .catch(() => setError("Failed to load supplier"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      await api.put(`/suppliers/${id}`, form);
      navigate("/suppliers");
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="suppliers-root">
        <Navbar />
        <div className="suppliers-body">
          <Sidebar />
          <main className="suppliers-content loading-state">
            Loading supplier…
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
          {/* HEADER */}
          <div className="page-header">
            <BackButton />
            <h2 className="page-title">Edit Supplier</h2>
          </div>

          {/* FORM CARD */}
          <form className="supplier-card" onSubmit={submit}>
            {error && <div className="error-msg">❌ {error}</div>}

            <div className="form-grid">
              <div className="form-group">
                <label>Supplier Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Company Name</label>
                <input
                  name="company_name"
                  value={form.company_name}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group full">
                <label>Address</label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>GST Number</label>
                <input
                  name="gst_number"
                  value={form.gst_number}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group full">
                <label>Notes</label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="form-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => navigate("/suppliers")}
              >
                Cancel
              </button>

              <button type="submit" className="primary-btn" disabled={saving}>
                {saving ? "Updating..." : "Update Supplier"}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}