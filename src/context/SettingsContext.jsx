import { createContext, useContext, useEffect, useState } from "react";

const SettingsContext = createContext();

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
  const [appliedSettings, setAppliedSettings] = useState(() => {
    const saved = localStorage.getItem("isma_settings");
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  // 🔥 only applied settings affect app
  useEffect(() => {
    localStorage.setItem(
      "isma_settings",
      JSON.stringify(appliedSettings)
    );

    document.body.classList.toggle(
      "dark-mode",
      appliedSettings.darkMode
    );
  }, [appliedSettings]);

  return (
    <SettingsContext.Provider
      value={{
        settings: appliedSettings,
        applySettings: setAppliedSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
