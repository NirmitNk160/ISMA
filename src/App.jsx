import { useState, useEffect } from "react";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./dashboard/Dashboard"; // ✅ ADD THIS

export default function App() {
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(null);

  // 🔥 Restore login on refresh
  useEffect(() => {
    const savedUser = localStorage.getItem("isma_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  return (
    <>
      {page === "home" && <Home setPage={setPage} user={user} />}

      {page === "login" && (
        <Login setPage={setPage} setUser={setUser} />
      )}

      {page === "register" && (
        <Register setPage={setPage} />
      )}

      {/* ✅ DASHBOARD PAGE */}
      {page === "dashboard" && user && (
        <Dashboard />
      )}
    </>
  );
}
