import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
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

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/suppliers", form);
      navigate("/suppliers");
    } catch {
      alert("Failed to add supplier");
    }
  };

  return (
    <div className="suppliers-root">
      <Navbar />
      <div className="suppliers-body">
        <Sidebar />

        <main className="suppliers-content">
          <h2>Add Supplier</h2>

          <form className="supplier-form" onSubmit={submit}>
            <input
              name="name"
              placeholder="Supplier Name"
              required
              onChange={handleChange}
            />

            <input
              name="company_name"
              placeholder="Company Name"
              onChange={handleChange}
            />

            <input
              name="phone"
              placeholder="Phone"
              onChange={handleChange}
            />

            <input
              name="email"
              placeholder="Email"
              onChange={handleChange}
            />

            <textarea
              name="address"
              placeholder="Address"
              onChange={handleChange}
            />

            <input
              name="gst_number"
              placeholder="GST Number"
              onChange={handleChange}
            />

            <textarea
              name="notes"
              placeholder="Notes"
              onChange={handleChange}
            />

            <button type="submit">Save Supplier</button>
          </form>
        </main>
      </div>
    </div>
  );
}