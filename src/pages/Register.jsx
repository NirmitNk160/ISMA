import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../styles/auth.css";

export default function Register() {
  const navigate = useNavigate();

  // 🔥 refs for keyboard navigation
  const ownerRef = useRef(null);
  const usernameRef = useRef(null);
  const mobileRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmRef = useRef(null);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
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

    if (loading) return;
    setLoading(true);

    try {
      await api.post("/auth/register", {
        shop_name: form.shop_name,
        owner_name: form.owner_name,
        username: form.username,
        email: form.email,
        mobile: form.mobile,
        password: form.password,
      });

      setMessage("✅ Registration successful");

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1200);
    } catch (err) {
      setMessage(
        err.response?.data?.message || "❌ Backend not reachable"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Register Your Shop</h2>

      <form onSubmit={handleSubmit}>
        <input
          name="shop_name"
          placeholder="Shop Name"
          autoFocus
          value={form.shop_name}
          onChange={handleChange}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              ownerRef.current?.focus();
            }
          }}
        />

        <input
          ref={ownerRef}
          name="owner_name"
          placeholder="Owner Name"
          value={form.owner_name}
          onChange={handleChange}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              usernameRef.current?.focus();
            }
          }}
        />

        <input
          ref={usernameRef}
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              mobileRef.current?.focus();
            }
          }}
        />

        <input
          ref={mobileRef}
          name="mobile"
          placeholder="Mobile Number"
          value={form.mobile}
          onChange={handleChange}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              emailRef.current?.focus();
            }
          }}
        />

        <input
          ref={emailRef}
          type="email"
          name="email"
          placeholder="Gmail"
          value={form.email}
          onChange={handleChange}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              passwordRef.current?.focus();
            }
          }}
        />

        <input
          ref={passwordRef}
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              confirmRef.current?.focus();
            }
          }}
        />

        <input
          ref={confirmRef}
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={form.confirmPassword}
          onChange={handleChange}
        />

        <button
          className="primary-btn"
          type="submit"
          disabled={loading}
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>

      {message && <p className="indicator">{message}</p>}

      <p>
        Already have an account?
        <span onClick={() => navigate("/login")}> Login here</span>
      </p>
    </div>
  );
}
