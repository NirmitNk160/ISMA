import { useState } from "react";
import Sidebar from "../dashboard/Sidebar";
import InventoryTopbar from "../inventory/InventoryTopbar";
import BackButton from "../../components/BackButton";
import "./Settings.css";

export default function Settings() {
  const [settings, setSettings] = useState({
    username: "User",
    email: "user@email.com",
    autoLogout: 30,
    loginAlerts: true,
    lowStockThreshold: 10,
    blockOutOfStock: true,
    darkMode: true,
    currency: "INR",
  });

  const handleChange = (key, value) => {
    setSettings({ ...settings, [key]: value });
  };

  const applyChanges = () => {
    console.log("Applying settings:", settings);
    alert("Settings saved successfully ✅");
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

          {/* 🔥 THIS IS THE KEY */}
          <div className="settings-grid">

            {/* ACCOUNT */}
            <section className="settings-card">
              <h3>👤 Account</h3>

              <div className="setting-row">
                <label>Username</label>
                <input
                  value={settings.username}
                  onChange={(e) =>
                    handleChange("username", e.target.value)
                  }
                />
              </div>

              <div className="setting-row">
                <label>Email</label>
                <input value={settings.email} disabled />
              </div>
            </section>

            {/* SECURITY */}
            <section className="settings-card">
              <h3>🔐 Security</h3>

              <div className="setting-row">
                <label>Auto Logout (minutes)</label>
                <select
                  value={settings.autoLogout}
                  onChange={(e) =>
                    handleChange(
                      "autoLogout",
                      Number(e.target.value)
                    )
                  }
                >
                  <option value={15}>15</option>
                  <option value={30}>30</option>
                  <option value={60}>60</option>
                </select>
              </div>

              <div className="setting-row">
                <label>Login Alerts</label>
                <input
                  type="checkbox"
                  checked={settings.loginAlerts}
                  onChange={(e) =>
                    handleChange(
                      "loginAlerts",
                      e.target.checked
                    )
                  }
                />
              </div>

              <button className="danger-btn">
                Change Password
              </button>

              <button className="danger-btn outline">
                Logout from all devices
              </button>
            </section>

            {/* INVENTORY RULES */}
            <section className="settings-card">
              <h3>📦 Inventory Rules</h3>

              <div className="setting-row">
                <label>Low Stock Threshold</label>
                <input
                  type="number"
                  min="1"
                  value={settings.lowStockThreshold}
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
                  checked={settings.blockOutOfStock}
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
                  checked={settings.darkMode}
                  onChange={(e) =>
                    handleChange("darkMode", e.target.checked)
                  }
                />
              </div>

              <div className="setting-row">
                <label>Currency</label>
                <select
                  value={settings.currency}
                  onChange={(e) =>
                    handleChange("currency", e.target.value)
                  }
                >
                  <option value="INR">₹ INR</option>
                  <option value="USD">$ USD</option>
                  <option value="EUR">€ EUR</option>
                </select>
              </div>
            </section>

          </div>

          {/* APPLY BAR */}
          <div className="settings-footer">
            <button
              className="apply-btn"
              onClick={applyChanges}
            >
              Apply Changes
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
