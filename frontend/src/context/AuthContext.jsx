import { createContext, useContext, useEffect, useRef, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useSettings } from "./SettingsContext";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
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

  /* ================= FETCH PROFILE ================= */

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch(
          `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/auth/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!res.ok) return;

        const data = await res.json();
        setProfile(data);
      } catch (err) {
        console.error("Profile fetch error:", err);
      }
    };

    if (user) fetchProfile();
  }, [user]);

  /* ================= AUTO LOGOUT ================= */

  useEffect(() => {
    if (!user) return;

    const autoLogoutMinutes = Number(settings?.autoLogout ?? 0);
    if (!autoLogoutMinutes) return;

    const resetTimer = () => {
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
      }

      logoutTimerRef.current = setTimeout(
        () => {
          console.warn("Auto logout due to inactivity");
          logout();
        },
        autoLogoutMinutes * 60 * 1000,
      );
    };

    const events = [
      "mousemove",
      "keydown",
      "click",
      "scroll",
      "touchstart",
      "touchmove",
      "visibilitychange",
    ];

    events.forEach((event) => window.addEventListener(event, resetTimer));

    resetTimer();

    return () => {
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
      }

      events.forEach((event) => window.removeEventListener(event, resetTimer));
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
        profile,
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
