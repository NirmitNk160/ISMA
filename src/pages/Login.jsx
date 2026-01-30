import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import "../styles/auth.css";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth(); // ✅ correct usage

  const passwordRef = useRef(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!email || !password) {
      setMessage("❌ Email and password are required");
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      // ✅ centralized auth handling
      login(res.data.token);

      navigate("/", { replace: true });
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
      <h2>ISMA Login</h2>

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Gmail"
          value={email}
          autoFocus
          onChange={(e) => setEmail(e.target.value)}
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
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="primary-btn"
          type="submit"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      {message && <p className="indicator">{message}</p>}

      <p>
        New shop?
        <span onClick={() => navigate("/register")}>
          {" "}
          Register your shop
        </span>
      </p>
    </div>
  );
}
