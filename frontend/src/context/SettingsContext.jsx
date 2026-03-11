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
  const auth = useAuth?.();
  const user = auth?.user || null;

  const [settings, setSettings] = useState(() => {
    // fallback for initial load
    const savedGlobal = localStorage.getItem("isma_settings");
    return savedGlobal ? JSON.parse(savedGlobal) : DEFAULT_SETTINGS;
  });

  /* ================= LOAD SETTINGS PER USER ================= */

  useEffect(() => {
    if (!user) return;

    const savedUser = localStorage.getItem(`isma_settings_${user.id}`);

    if (savedUser) {
      setSettings(JSON.parse(savedUser));
    }
  }, [user]);

  /* ================= SAVE SETTINGS ================= */

  useEffect(() => {
    if (!settings) return;

    // save per user if logged in
    if (user) {
      localStorage.setItem(
        `isma_settings_${user.id}`,
        JSON.stringify(settings)
      );
    }

    // keep global fallback for first load
    localStorage.setItem("isma_settings", JSON.stringify(settings));

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
    throw new Error(
      "useSettings must be used inside SettingsProvider"
    );
  }

  return ctx;
}