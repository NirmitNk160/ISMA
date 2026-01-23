import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/home.css";

export default function Home({ user }) {
  const navigate = useNavigate();

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("isma_user");
    navigate("/login", { replace: true });
  };

  // Typing animation logic
  const fullText = "Inventory, Store Management & Analysis..";
  const [typedText, setTypedText] = useState("");

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setTypedText(fullText.slice(0, index + 1));
      index++;

      if (index === fullText.length) {
        clearInterval(interval);
      }
    }, 60);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* NAVBAR */}
      <Navbar user={user} onLogout={handleLogout} />

      {/* HERO SECTION */}
      <section className="hero">
        <h2 className="typing-text">{typedText}</h2>

        <p className="hero-sub">
          Smart, simple and powerful inventory management system
          designed for modern shops.
        </p>

        {!user ? (
          /* NOT LOGGED IN */
          <div className="hero-buttons">
            <button
              className="primary"
              onClick={() => navigate("/register")}
            >
              Create Your Store
            </button>

            <button
              className="secondary"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          </div>
        ) : (
          /* LOGGED IN */
          <div className="user-box">
            <h3>Welcome back 👋</h3>

            <p>
              <strong>{user.shop_name || user.name}</strong>
            </p>

            {user.email && (
              <p className="user-email">{user.email}</p>
            )}

            <div className="dashboard-actions">
              <button
                className="primary"
                onClick={() => navigate("/dashboard")}
              >
                Go to Dashboard
              </button>

              <button
                className="secondary"
                onClick={() => navigate("/dashboard")}
              >
                Manage Inventory
              </button>
            </div>
          </div>
        )}
      </section>

      {/* FEATURES SECTION */}
      <section className="features">
        <h3>Why ISMA?</h3>

        <div className="feature-grid">
          <div className="feature-card">
            <h4>📦 Inventory Tracking</h4>
            <p>
              Track stock levels in real time and avoid over-stocking
              or shortages.
            </p>
          </div>

          <div className="feature-card">
            <h4>📊 Smart Analysis</h4>
            <p>
              Get insights into fast-moving and slow-moving products.
            </p>
          </div>

          <div className="feature-card">
            <h4>🏪 Multi-Category Support</h4>
            <p>
              Organize products into categories with capacity alerts.
            </p>
          </div>

          <div className="feature-card">
            <h4>🔐 Secure Access</h4>
            <p>
              Your store data is protected with secure authentication.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <p>© {new Date().getFullYear()} ISMA • Inventory Made Simple</p>
      </footer>
    </>
  );
}
