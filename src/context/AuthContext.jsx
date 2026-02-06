import { createContext, useContext, useEffect, useRef, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useSettings } from "./SettingsContext";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const { settings } = useSettings();
  const logoutTimerRef = useRef(null);

  /* ================= TOKEN VALIDATION ================= */

  const getValidUserFromToken = () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;

      const decoded = jwtDecode(token);

      if (!decoded?.exp || decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem("token");
        return null;
      }

      return {
        id: decoded.id,
        username: decoded.username,
      };
    } catch {
      localStorage.removeItem("token");
      return null;
    }
  };

  /* ================= INITIAL AUTH CHECK ================= */

  useEffect(() => {
    const userFromToken = getValidUserFromToken();
    setUser(userFromToken);
    setLoading(false);
  }, []);

  /* ================= AUTO LOGOUT ================= */

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await api.get("/endpoint");
        setData(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load data");
      } finally {
        setLoading(false); // ALWAYS
      }
    };

    loadData();
  }, []);

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
      console.error("Login decode error:", err);
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

    // Prevent redirect loop
    if (!window.location.pathname.includes("login")) {
      window.location.href = "/login";
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

export function useAuth() {
  return useContext(AuthContext);
}
