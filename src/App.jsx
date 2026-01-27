import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "./context/AuthContext";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/dashboard/Dashboard";
import Profile from "./pages/Profile/Profile";
import Inventory from "./pages/Inventory/Inventory";

export default function App() {
  const { user, setUser, loading, setLoading } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    fetch("http://localhost:5000/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setUser(data.user))
      .catch(() => localStorage.removeItem("token"))
      .finally(() => setLoading(false));
  }, [setUser, setLoading]);

  if (loading) return null;

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/dashboard"
        element={user ? <Dashboard /> : <Navigate to="/login" replace />}
      />

      <Route
        path="/profile"
        element={user ? <Profile /> : <Navigate to="/login" replace />}
      />

      <Route
        path="/inventory"
        element={user ? <Inventory /> : <Navigate to="/login" replace />}
      />
    </Routes>
  );
}
