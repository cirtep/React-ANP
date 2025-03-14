import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import MobileResponsiveDashboard from "./layouts/MobileResponsiveDashboard";
import HomePage from "./pages/HomePage";
import CustomerPage from "./pages/CustomerPage";
import InventoryPage from "./pages/InventoryPage";
import ForecastPage from "./pages/ForecastPage";
import GoalsPage from "./pages/GoalsPage";
import NotFoundPage from "./pages/NotFoundPage";
import LoginPage from "./pages/LoginPage";
import useMediaQuery from "./hooks/useMediaQuery";
import { useAuth } from "./contexts/AuthContext";
import LoadingSpinner from "./components/LoadingSpinner";

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

const App = () => {
  const useMobileLayout = useMediaQuery("(max-width: 768px)");
  const Layout = useMobileLayout ? MobileResponsiveDashboard : DashboardLayout;
  const { loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      {/* Public route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout title="Home">
              <HomePage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer"
        element={
          <ProtectedRoute>
            <Layout title="Customer">
              <CustomerPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory"
        element={
          <ProtectedRoute>
            <Layout title="Inventory">
              <InventoryPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/forecast"
        element={
          <ProtectedRoute>
            <Layout title="Forecast">
              <ForecastPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/goals"
        element={
          <ProtectedRoute>
            <Layout title="Goals">
              <GoalsPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;
