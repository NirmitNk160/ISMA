import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  /* ================= WAIT FOR AUTH ================= */

  if (loading) {
    return (
      <div
        style={{
          padding: "2rem",
          textAlign: "center",
          fontWeight: 600,
        }}
      >
        Checking authentication…
      </div>
    );
  }

  /* ================= NOT AUTHENTICATED ================= */

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }} // helps redirect back after login
      />
    );
  }

  /* ================= AUTHENTICATED ================= */

  return children;
}
