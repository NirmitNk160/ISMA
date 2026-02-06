// AuthContext.jsx
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useSettings } from "./SettingsContext";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const { settings } = useSettings();
  const logoutTimerRef = useRef(null);

  /* ================= INITIAL AUTH CHECK ================= */

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const decoded = jwtDecode(token);

        // Token expired
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem("token");
          setUser(null);
        } else {
          setUser({
            id: decoded.id,
            username: decoded.username,
          });
        }
      } catch (err) {
        console.warn("Invalid token:", err);
        localStorage.removeItem("token");
        setUser(null);
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  /* ================= AUTO LOGOUT ================= */

  useEffect(() => {
    if (!user) return;

    const autoLogoutMinutes = Number(settings?.autoLogout ?? 0);

    // 0 = disabled
    if (!autoLogoutMinutes) return;

    const resetTimer = () => {
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
      }

      logoutTimerRef.current = setTimeout(() => {
        console.warn("Auto logout due to inactivity");
        logout();
      }, autoLogoutMinutes * 60 * 1000);
    };

    // Activity listeners
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];

    events.forEach((event) =>
      window.addEventListener(event, resetTimer)
    );

    resetTimer();

    return () => {
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
      }

      events.forEach((event) =>
        window.removeEventListener(event, resetTimer)
      );
    };
  }, [user, settings?.autoLogout]);

  /* ================= LOGIN ================= */

  const login = (token) => {
    try {
      localStorage.setItem("token", token);

      const decoded = jwtDecode(token);

      setUser({
        id: decoded.id,
        username: decoded.username,
      });
    } catch (err) {
      console.error("Login token error:", err);
      localStorage.removeItem("token");
      setUser(null);
    }
  };

  /* ================= LOGOUT ================= */

  const logout = () => {
    localStorage.removeItem("token");

    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
    }

    setUser(null);

    // Optional redirect safeguard
    if (window.location.pathname !== "/login") {
      window.location.replace("/login");
    }
  };

  /* ================= CONTEXT ================= */

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

/* ================= HOOK ================= */

export function useAuth() {
  return useContext(AuthContext);
}
