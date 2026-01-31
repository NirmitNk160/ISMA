import { createContext, useContext, useEffect, useState } from "react";

const SettingsContext = createContext(null);

/* ================= DEFAULT SETTINGS ================= */

const DEFAULT_SETTINGS = {
  username: "User",
  email: "user@email.com",
  autoLogout: 30,
  loginAlerts: true,
  lowStockThreshold: 10,
  blockOutOfStock: true,

  // 🔥 THEME
  darkMode: true, // dark is default

  // 🔥 GLOBAL CURRENCY
  currency: "INR",
};

/* ================= PROVIDER ================= */

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem("isma_settings");
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  /* ================= APPLY THEME ================= */
  useEffect(() => {
    localStorage.setItem("isma_settings", JSON.stringify(settings));

    // 🔥 SINGLE SOURCE OF TRUTH
    document.body.classList.toggle("light-mode", !settings.darkMode);
  }, [settings]);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        applySettings: setSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

/* ================= HOOK ================= */

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error(
      "useSettings must be used inside SettingsProvider"
    );
  }
  return ctx;
}
