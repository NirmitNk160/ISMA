import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../styles/register.css";

export default function Register() {
  const navigate = useNavigate();

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

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔥 Password strength logic
  const getPasswordStrength = (password) => {
    if (password.length < 6) return "Weak";
    if (
      password.match(/[A-Z]/) &&
      password.match(/[0-9]/) &&
      password.length >= 8
    )
      return "Strong";
    return "Medium";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (
      !form.shop_name ||
      !form.owner_name ||
      !form.username ||
      !form.email ||
      !form.mobile ||
      !form.password ||
      !form.confirmPassword
    ) {
      setError("All fields are required");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
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

      setSuccess("Registration successful ✓ Redirecting...");

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  const strength = getPasswordStrength(form.password);

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Register Your Shop</h2>
        <p>Create your store in seconds</p>

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
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                passwordRef.current?.focus();
              }
            }}
          />

          {/* PASSWORD FIELD */}
          <div className="password-wrapper">
            <input
              ref={passwordRef}
              type={showPassword ? "text" : "password"}
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
            <span
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁"}
            </span>
          </div>

          {/* PASSWORD STRENGTH */}
          {form.password && (
            <p className={`strength ${strength.toLowerCase()}`}>
              Password strength: {strength}
            </p>
          )}

          <input
            ref={confirmRef}
            type={showPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
          />

          <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        {error && <div className="error-msg">⚠ {error}</div>}
        {success && <div className="success-msg">{success}</div>}

        <p>
          Already have an account?
          <span onClick={() => navigate("/login")}> Login here</span>
        </p>
      </div>
    </div>
  );
}
