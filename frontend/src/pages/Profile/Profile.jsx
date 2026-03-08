import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import BackButton from "../../components/BackButton";
import "./profile.css";

export default function Profile() {
  const navigate = useNavigate();
  const { logout, loading: authLoading } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState({
    shop_name: "",
    owner_name: "",
    username: "",
    mobile: "",
  });

  /* ================= FETCH PROFILE ================= */

  const fetchProfile = async () => {
    try {
      const res = await api.get("/auth/profile");
      setProfile(res.data);
    } catch (err) {
      console.error(err);

      if (err.response?.status === 401) {
        logout();
      } else {
        setError("Failed to load profile");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    fetchProfile();
  }, [authLoading]);

  /* ================= SYNC FORM ================= */

  useEffect(() => {
    if (profile) {
      setForm({
        shop_name: profile.shop_name || "",
        owner_name: profile.owner_name || "",
        username: profile.username || "",
        mobile: profile.mobile || "",
      });
    }
  }, [profile]);

  /* ================= FORM HANDLER ================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* ================= SAVE PROFILE ================= */

  const handleSave = async () => {
    try {
      setSaving(true);

      const res = await api.put("/auth/profile", form);

      setProfile(res.data.user);
      setEditing(false);
    } catch (err) {
      console.error(err);

      alert(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  /* ================= CANCEL EDIT ================= */

  const handleCancel = () => {
    setEditing(false);

    if (profile) {
      setForm({
        shop_name: profile.shop_name,
        owner_name: profile.owner_name,
        username: profile.username,
        mobile: profile.mobile,
      });
    }
  };

  /* ================= LOGOUT ================= */

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  /* ================= LOADING ================= */

  if (authLoading || loading) {
    return <div className="profile-loading">Loading profile…</div>;
  }

  if (!profile) {
    return <div className="profile-loading">{error || "No profile data"}</div>;
  }

  const initials = profile.username?.slice(0, 2).toUpperCase() || "U";

  /* ================= UI ================= */

  return (
    <>
      {/* ================= TOP BAR ================= */}

      <header className="profile-topbar">
        <div className="profile-topbar-inner">
          <BackButton />

          <div className="profile-brand">
            <span className="brand">ISMA</span>
            <span className="welcome">👋 Welcome</span>

            <button
              className="profile-pill"
              onClick={() => navigate("/dashboard")}
            >
              🏠 Home
            </button>
          </div>
        </div>
      </header>

      {/* ================= PAGE ================= */}

      <main className="profile-page">
        {/* HEADER */}

        <section className="profile-header">
          <div className="profile-avatar">{initials}</div>

          <div className="profile-header-text">
            <h2>{profile.username}</h2>
            <p>{profile.email}</p>
          </div>
        </section>

        {/* PROFILE CARD */}

        <section className="profile-card">
          <div className="profile-grid">
            {/* SHOP NAME */}

            <div>
              <span>Shop Name</span>

              {editing ? (
                <input
                  name="shop_name"
                  value={form.shop_name}
                  onChange={handleChange}
                />
              ) : (
                <strong>{profile.shop_name}</strong>
              )}
            </div>

            {/* OWNER NAME */}

            <div>
              <span>Owner Name</span>

              {editing ? (
                <input
                  name="owner_name"
                  value={form.owner_name}
                  onChange={handleChange}
                />
              ) : (
                <strong>{profile.owner_name}</strong>
              )}
            </div>

            {/* USERNAME */}

            <div>
              <span>Username</span>

              {editing ? (
                <input
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                />
              ) : (
                <strong>{profile.username}</strong>
              )}
            </div>

            {/* EMAIL */}

            <div>
              <span>Email</span>
              <strong>{profile.email}</strong>
            </div>

            {/* MOBILE */}

            <div>
              <span>Mobile</span>

              {editing ? (
                <input
                  name="mobile"
                  value={form.mobile}
                  onChange={handleChange}
                />
              ) : (
                <strong>{profile.mobile}</strong>
              )}
            </div>
          </div>
        </section>

        {/* ACTION BUTTONS */}

        <section className="profile-actions">
          {!editing && (
            <button className="primary" onClick={() => setEditing(true)}>
              ✏️ Edit Profile
            </button>
          )}

          {editing && (
            <>
              <button
                className="primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving..." : "💾 Save Changes"}
              </button>

              <button className="secondary" onClick={handleCancel}>
                Cancel
              </button>
            </>
          )}

          <button className="primary" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </button>

          <button className="danger" onClick={handleLogout}>
            Logout
          </button>
        </section>
      </main>
    </>
  );
}