import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./dashboard/Dashboard";
import Profile from "./pages/Profile/Profile";

import { NavigationHandler } from "./utils/navigation";

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("isma_user");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  return (
    <>
      <NavigationHandler />

      <Routes>
        <Route path="/" element={<Home user={user} />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" replace />} />
        <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
      </Routes>
    </>
  );
}
