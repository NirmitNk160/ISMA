import { useEffect, useState } from "react";
import api from "../../api/axios";

import Sidebar from "../dashboard/Sidebar";
import InventoryTopbar from "../inventory/InventoryTopbar";
import BackButton from "../../components/BackButton";

import "./Settings.css";

export default function Settings() {
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const [settings, setSettings] = useState({
    username: "",
    email: "",
    shopName: "",
    lowStockThreshold: 10,
    autoLogout: true,
    emailAlerts: true,
    salesAlerts: true,
    darkMode: true,
  });

  useEffect(() => {
    api.get("/auth/profile").then((res) => {
      setSettings((prev) => ({
        ...prev,
        username: res.data.username,
        email: res.data.email,
        shopName: res.data.shop_name,
      }));
    });
  }, []);

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setSettings({
      ...settings,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const saveSettings = async () => {
    setSaving(true);
    setSuccess(false);

    // simulate save (replace with real API later)
    setTimeout(() => {
      setSaving(false);
      setSuccess(true);
    }, 900);
  };

  return (
    <div className="settings-root">
      <InventoryTopbar />

      <div className="settings-body">
        <Sidebar />

        <main className="settings-content">
          <div className="settings-header">
            <BackButton />
            <h2>Settings</h2>
          </div>

          {success && (
            <div className="success-msg">
              ✔ Settings saved successfully
            </div>
          )}

          {/* ACCOUNT */}
          <section className="settings-card">
            <h3>👤 Account</h3>

            <div className="form-grid">
              <div className="form-group">
                <label>Username</label>
                <input
                  name="username"
                  value={settings.username}
                  disabled
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  name="email"
                  value={settings.email}
                  disabled
                />
              </div>

              <div className="form-group full">
                <label>Shop Name</label>
                <input
                  name="shopName"
                  value={settings.shopName}
                  onChange={handleChange}
                />
              </div>
            </div>
          </section>

          {/* INVENTORY */}
          <section className="settings-card">
            <h3>📦 Inventory Preferences</h3>

            <div className="form-group">
              <label>Low Stock Alert Threshold</label>
              <input
                type="number"
                min="1"
                name="lowStockThreshold"
                value={settings.lowStockThreshold}
                onChange={handleChange}
              />
              <small>
                Alert when stock falls below this number
              </small>
            </div>
          </section>

          {/* SALES */}
          <section className="settings-card">
            <h3>💰 Sales & Billing</h3>

            <label className="toggle">
              <input
                type="checkbox"
                name="salesAlerts"
                checked={settings.salesAlerts}
                onChange={handleChange}
              />
              <span />
              Enable sales alerts
            </label>

            <label className="toggle">
              <input
                type="checkbox"
                name="autoLogout"
                checked={settings.autoLogout}
                onChange={handleChange}
              />
              <span />
              Auto logout on inactivity
            </label>
          </section>

          {/* NOTIFICATIONS */}
          <section className="settings-card">
            <h3>🔔 Notifications</h3>

            <label className="toggle">
              <input
                type="checkbox"
                name="emailAlerts"
                checked={settings.emailAlerts}
                onChange={handleChange}
              />
              <span />
              Receive email alerts
            </label>
          </section>

          {/* UI */}
          <section className="settings-card">
            <h3>🎨 Appearance</h3>

            <label className="toggle">
              <input
                type="checkbox"
                name="darkMode"
                checked={settings.darkMode}
                onChange={handleChange}
              />
              <span />
              Dark mode
            </label>
          </section>

          {/* DANGER */}
          <section className="settings-card danger-zone">
            <h3>⚠ Danger Zone</h3>

            <button className="danger-btn">
              Reset All Settings
            </button>
          </section>

          <div className="settings-actions">
            <button
              className="save-btn"
              onClick={saveSettings}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
