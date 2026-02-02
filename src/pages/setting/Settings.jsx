import { useState, useEffect } from "react";
import Sidebar from "../dashboard/Sidebar";
import Navbar from "../../components/Navbar";import BackButton from "../../components/BackButton";
import { useSettings } from "../../context/SettingsContext";
import "./Settings.css";

export default function Settings() {
  const { settings, applySettings } = useSettings();

  // 📝 draft copy
  const [draft, setDraft] = useState(settings);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // sync when navigating back to settings
  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  const handleChange = (key, value) => {
    setDraft(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const applyChanges = () => {
    setSaving(true);

    setTimeout(() => {
      applySettings(draft); // 🔥 THIS is the key
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }, 600);
  };

  return (
    <div className="settings-root">
      <Navbar />

      <div className="settings-body">
        <Sidebar />

        <main className="settings-content">
          <div className="settings-header">
            <BackButton />
            <h2>Settings</h2>
          </div>

          <div className="settings-grid">
            {/* ACCOUNT */}
            <section className="settings-card">
              <h3>👤 Account</h3>
              <div className="setting-row">
                <label>Username</label>
                <input
                  value={draft.username}
                  onChange={(e) =>
                    handleChange("username", e.target.value)
                  }
                />
              </div>
              <div className="setting-row">
                <label>Email</label>
                <input value={draft.email} disabled />
              </div>
            </section>

            {/* SECURITY */}
            <section className="settings-card">
              <h3>🔐 Security</h3>
              <div className="setting-row">
                <label>Auto Logout (minutes)</label>
                <select
                  value={draft.autoLogout}
                  onChange={(e) =>
                    handleChange(
                      "autoLogout",
                      Number(e.target.value)
                    )
                  }
                >
                  <option value={0}>Never</option>
                  <option value={1}>1</option>
                  <option value={5}>5</option>
                  <option value={15}>15</option>
                  <option value={30}>30</option>
                  <option value={60}>60</option>
                </select>
              </div>

              <div className="setting-row">
                <label>Login Alerts</label>
                <input
                  type="checkbox"
                  checked={draft.loginAlerts}
                  onChange={(e) =>
                    handleChange(
                      "loginAlerts",
                      e.target.checked
                    )
                  }
                />
              </div>
            </section>

            {/* INVENTORY */}
            <section className="settings-card">
              <h3>📦 Inventory Rules</h3>
              <div className="setting-row">
                <label>Low Stock Threshold</label>
                <input
                  type="number"
                  min="1"
                  value={draft.lowStockThreshold}
                  onChange={(e) =>
                    handleChange(
                      "lowStockThreshold",
                      Number(e.target.value)
                    )
                  }
                />
              </div>

              <div className="setting-row">
                <label>Block billing when out of stock</label>
                <input
                  type="checkbox"
                  checked={draft.blockOutOfStock}
                  onChange={(e) =>
                    handleChange(
                      "blockOutOfStock",
                      e.target.checked
                    )
                  }
                />
              </div>
            </section>

            {/* PREFERENCES */}
            <section className="settings-card">
              <h3>⚙ Preferences</h3>
              <div className="setting-row">
                <label>Dark Mode</label>
                <input
                  type="checkbox"
                  checked={draft.darkMode}
                  onChange={(e) =>
                    handleChange(
                      "darkMode",
                      e.target.checked
                    )
                  }
                />
              </div>

              <div className="setting-row">
                <label>Currency</label>
                <select
                  value={draft.currency}
                  onChange={(e) =>
                    handleChange(
                      "currency",
                      e.target.value
                    )
                  }
                >
                  <option value="INR">₹ INR</option>
                  <option value="USD">$ USD</option>
                  <option value="EUR">€ EUR</option>
                </select>
              </div>
            </section>
          </div>

          <div className="settings-footer">
            <button
              className="apply-btn"
              onClick={applyChanges}
              disabled={saving}
            >
              {saving ? "Saving..." : "Apply Changes"}
            </button>
          </div>
        </main>
      </div>

      {saved && (
        <div className="settings-toast">
          ✅ Changes applied successfully
        </div>
      )}
    </div>
  );
}
