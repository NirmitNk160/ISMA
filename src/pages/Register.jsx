import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/auth.css";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    shop_name: "",
    owner_name: "",
    username: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setMessage("");

    if (
      !form.shop_name ||
      !form.owner_name ||
      !form.username ||
      !form.email ||
      !form.mobile ||
      !form.password ||
      !form.confirmPassword
    ) {
      setMessage("❌ All fields are required");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setMessage("❌ Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shop_name: form.shop_name,
          owner_name: form.owner_name,
          username: form.username,
          email: form.email,
          mobile: form.mobile,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) setMessage(data.message);
      else {
        setMessage("✅ Registration successful");
        setTimeout(() => navigate("/login"), 1200);
      }
    } catch {
      setMessage("❌ Backend not reachable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Register Your Shop</h2>

      <input name="shop_name" placeholder="Shop Name" onChange={handleChange} />
      <input name="owner_name" placeholder="Owner Name" onChange={handleChange} />
      <input name="username" placeholder="Username" onChange={handleChange} />
      <input name="mobile" placeholder="Mobile Number" onChange={handleChange} />
      <input name="email" placeholder="Gmail" onChange={handleChange} />
      <input type="password" name="password" placeholder="Password" onChange={handleChange} />
      <input type="password" name="confirmPassword" placeholder="Confirm Password" onChange={handleChange} />

      <button className="primary-btn" onClick={handleSubmit} disabled={loading}>
        {loading ? "Registering..." : "Register"}
      </button>

      {message && <p className="indicator">{message}</p>}

      <p>
        Already have an account?
        <span onClick={() => navigate("/login")}> Login here</span>
      </p>
    </div>
  );
}
