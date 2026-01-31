// AuthContext.jsx
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useSettings } from "./SettingsContext";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const { settings } = useSettings(); // 🔥 read autoLogout
  const logoutTimerRef = useRef(null);

  /* ================= INITIAL AUTH CHECK ================= */

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const decoded = jwtDecode(token);

      if (decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem("token");
        setUser(null);
      } else {
        setUser({
          id: decoded.id,
          username: decoded.username,
        });
      }
    } catch {
      localStorage.removeItem("token");
      setUser(null);
    }

    setLoading(false);
  }, []);

  /* ================= AUTO LOGOUT LOGIC ================= */

  useEffect(() => {
    // no user → no timer
    if (!user) return;

    // Never auto logout
    if (settings.autoLogout === 0) return;

    const resetTimer = () => {
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
      }

      logoutTimerRef.current = setTimeout(() => {
        console.warn("Auto logout due to inactivity");

        logout(); // 🔥 REAL logout
      }, settings.autoLogout * 60 * 1000);
    };

    // activity events
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("click", resetTimer);
    window.addEventListener("scroll", resetTimer);

    resetTimer(); // start timer

    return () => {
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
      }

      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("click", resetTimer);
      window.removeEventListener("scroll", resetTimer);
    };
  }, [user, settings.autoLogout]);

  /* ================= AUTH ACTIONS ================= */

  const login = (token) => {
    localStorage.setItem("token", token);
    const decoded = jwtDecode(token);

    setUser({
      id: decoded.id,
      username: decoded.username,
    });
  };

  const logout = () => {
    localStorage.removeItem("token");

    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
    }

    setUser(null);
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

export function useAuth() {
  return useContext(AuthContext);
}
