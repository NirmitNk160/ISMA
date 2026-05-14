import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

const SettingsContext = createContext(null);

const DEFAULT_SETTINGS = {
  username: "User",
  email: "user@email.com",
  autoLogout: 30,
  loginAlerts: true,
  lowStockThreshold: 10,
  blockOutOfStock: true,
  darkMode: true,
  currency: "INR",
};

export function SettingsProvider({ children }) {
  const { user } = useAuth(); // ✅ fixed

  // ✅ start with default only (NO global storage)
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  /* ================= LOAD SETTINGS PER USER ================= */

  useEffect(() => {
    if (!user) {
      // ✅ reset on logout / no user
      setSettings(DEFAULT_SETTINGS);
      return;
    }

    const savedUser = localStorage.getItem(`isma_settings_${user.id}`);

    if (savedUser) {
      setSettings(JSON.parse(savedUser));
    } else {
      setSettings(DEFAULT_SETTINGS);
    }
  }, [user]);

  /* ================= SAVE SETTINGS ================= */

  useEffect(() => {
    if (!settings || !user) return;

    // ✅ ONLY per-user storage (NO global)
    localStorage.setItem(
      `isma_settings_${user.id}`,
      JSON.stringify(settings)
    );

    // theme apply (unchanged)
    document.body.classList.toggle("light-mode", !settings.darkMode);
  }, [settings, user]);

  return (
    <SettingsContext.Provider
      value={{ settings, applySettings: setSettings }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);

  if (!ctx) {
    throw new Error("useSettings must be used inside SettingsProvider");
  }

  return ctx;
}