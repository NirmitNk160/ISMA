import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../../components/BackButton";
import "./profile.css";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem("isma_user");

    if (!raw) {
      navigate("/login", { replace: true });
      return;
    }

    setUser(JSON.parse(raw));
  }, [navigate]);

  if (!user) return null;

  const shopName = user.shop_name ?? user.Shop_Name ?? user.shopName ?? "—";
  const username = user.username ?? user.Username ?? user.user_name ?? "—";
  const email = user.email ?? user.Email ?? "—";
  const mobile = user.mobile ?? user.Mobile ?? "—";

  return (
    <>
      {/* ================= PROFILE TOPBAR ================= */}
      <header className="profile-topbar">
        <div className="profile-topbar-inner">
          <BackButton />

          <div className="profile-brand">
            <span className="brand">ISMA</span>
            <span className="welcome">👋 Welcome</span>
            <span className="profile-pill">Profile</span>
          </div>
        </div>
      </header>

      {/* ================= PROFILE CONTENT ================= */}
      <section className="profile-page">
        <h2 className="profile-title">My Profile</h2>

        <div className="profile-card">
          <div className="profile-row">
            <span>Shop Name</span>
            <strong>{shopName}</strong>
          </div>

          <div className="profile-row">
            <span>Username</span>
            <strong>{username}</strong>
          </div>

          <div className="profile-row">
            <span>Email</span>
            <strong>{email}</strong>
          </div>

          <div className="profile-row">
            <span>Mobile</span>
            <strong>{mobile}</strong>
          </div>
        </div>

        <div className="profile-actions">
          <button className="primary" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </button>

          <button
            className="secondary"
            onClick={() => {
              localStorage.removeItem("isma_user");
              navigate("/", { replace: true });
            }}
          >
            Logout
          </button>
        </div>
      </section>
    </>
  );
}
