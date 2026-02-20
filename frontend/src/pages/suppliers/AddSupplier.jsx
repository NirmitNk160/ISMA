import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../api/axios";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import BackButton from "../../components/BackButton";

import "./Suppliers.css";

export default function AddSupplier() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    company_name: "",
    phone: "",
    email: "",
    address: "",
    gst_number: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/suppliers", form);
      navigate("/suppliers");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add supplier");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="suppliers-root">
      <Navbar />

      <div className="suppliers-body">
        <Sidebar />

        <main className="suppliers-content">
          {/* HEADER */}
          <div className="page-header">
            <BackButton />
            <h2 className="page-title">Add Supplier</h2>
          </div>

          {/* FORM CARD */}
          <form className="supplier-card" onSubmit={submit}>
            {error && <div className="error-msg">❌ {error}</div>}

            <div className="form-grid">
              <div className="form-group">
                <label>Supplier Name</label>
                <input
                  name="name"
                  placeholder="Example: Kirana Wholesalers"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Company Name</label>
                <input
                  name="company_name"
                  placeholder="Company / Distributor"
                  value={form.company_name}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                  name="phone"
                  placeholder="Contact number"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  name="email"
                  placeholder="supplier@email.com"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group full">
                <label>Address</label>
                <textarea
                  name="address"
                  placeholder="Full supplier address"
                  value={form.address}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>GST Number</label>
                <input
                  name="gst_number"
                  placeholder="GSTIN if available"
                  value={form.gst_number}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group full">
                <label>Notes</label>
                <textarea
                  name="notes"
                  placeholder="Payment terms, delivery notes, etc."
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

              <button type="submit" className="primary-btn" disabled={loading}>
                {loading ? "Saving..." : "Save Supplier"}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}