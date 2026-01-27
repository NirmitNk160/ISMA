import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/auth.css";

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setMessage("");

    if (!email || !password) {
      setMessage("❌ Email and password are required");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "❌ Login failed");
        return;
      }

      // ✅ Correct modern auth flow
      setUser(data.user);
      localStorage.setItem("token", data.token);

      navigate("/");
    } catch (err) {
      setMessage("❌ Backend not reachable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>ISMA Login</h2>

      <input
        type="email"
        placeholder="Gmail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        className="primary-btn"
        onClick={handleLogin}
        disabled={loading}
      >
        {loading ? "Logging in..." : "Login"}
      </button>

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
