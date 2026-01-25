import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import BackButton from "../../components/BackButton";
import "./profile.css";

export default function Profile() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  if (!user) return null;

  const shopName = user.shop_name ?? "—";
  const username = user.username ?? "—";
  const email = user.email ?? "—";
  const mobile = user.mobile ?? "—";

  return (
    <>
      {/* PROFILE TOPBAR */}
      <header className="profile-topbar">
        <div className="profile-topbar-inner">
          <BackButton />

          <div className="profile-brand">
            <span className="brand">ISMA</span>
            <span className="welcome">👋 Welcome</span>
            <button
              className="profile-pill home-pill"
              onClick={() => navigate("/")}
              title="Go to Home"
            >
              🏠 Home
            </button>
          </div>
        </div>
      </header>

      {/* PROFILE CONTENT */}
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
              localStorage.removeItem("token");
              setUser(null); // 🔥 important
              window.location.href = "/"; // 🔥 hard redirect to home
            }}
          >
            Logout
          </button>
        </div>
      </section>
    </>
  );
}
