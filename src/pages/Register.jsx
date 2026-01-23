import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/auth.css";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    Shop_Name: "",
    Username: "",
    Email: "",
    Mobile: "",
    Password: "",
    Confirm_Password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    setMessage("");

    if (Object.values(form).some((v) => !v)) {
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
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) setMessage(data.message || "❌ Registration failed");
      else {
        setMessage("✅ Registration successful");
        setTimeout(() => navigate("/login"), 1000);
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

      {Object.keys(form).map((key) => (
        <input
          key={key}
          name={key}
          type={key.includes("password") ? "password" : "text"}
          placeholder={key.replace("_", " ")}
          onChange={handleChange}
        />
      ))}

      <button className="primary-btn" onClick={handleSubmit} disabled={loading}>
        {loading ? "Registering..." : "Register"}
      </button>

      {message && <p className="indicator">{message}</p>}

      <p>
        Already have an account?
        <span onClick={() => navigate("/login")}> Login</span>
      </p>

    </div>
  );
}
