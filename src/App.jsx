import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/dashboard/Dashboard";
import Profile from "./pages/Profile/Profile";
import Inventory from "./pages/Inventory/Inventory";
import AddProduct from "./pages/Inventory/AddProduct";
import EditProduct from "./pages/Inventory/EditProduct";
import Billing from "./pages/billing/Billing";
import Sales from "./pages/sales/Sales";
import Reports from "./pages/reports/Reports";
import Settings from "./pages/setting/Settings";

import ProtectedRoute from "./components/ProtectedRoute";

// ⭐ ADD THIS IMPORT
import BarcodeScanner from "./components/BarcodeScanner/BarcodeScanner";

export default function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />
      <Route path="/register" element={<Register />} />

      {/* Protected */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/inventory"
        element={
          <ProtectedRoute>
            <Inventory />
          </ProtectedRoute>
        }
      />

      <Route
        path="/inventory/add"
        element={
          <ProtectedRoute>
            <AddProduct />
          </ProtectedRoute>
        }
      />

      <Route
        path="/inventory/edit/:id"
        element={
          <ProtectedRoute>
            <EditProduct />
          </ProtectedRoute>
        }
      />

      <Route
        path="/billing"
        element={
          <ProtectedRoute>
            <Billing />
          </ProtectedRoute>
        }
      />

      <Route
        path="/sales"
        element={
          <ProtectedRoute>
            <Sales />
          </ProtectedRoute>
        }
      />

      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

      {/* ⭐ NEW SCANNER ROUTE */}
      <Route
        path="/scanner"
        element={
          <ProtectedRoute>
            <BarcodeScanner />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
