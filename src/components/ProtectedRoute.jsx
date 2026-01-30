import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  // ⏳ Wait for auth check to finish
  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        Loading...
      </div>
    );
  }

  // 🔒 Not logged in → redirect
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
