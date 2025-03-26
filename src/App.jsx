import React, { useState, useEffect } from "react";
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
import SettingsOverlay from "./pages/SettingsOverlay";
import useAuth from "./hooks/useAuth";

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

const useResponsiveLayout = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    // Handler to call on window resize
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Call handler right away so state gets updated with initial window size
    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty array ensures effect runs only on mount and unmount

  return isMobile;
};

const App = () => {
  const isMobileLayout = useResponsiveLayout();
  const Layout = isMobileLayout ? MobileResponsiveDashboard : DashboardLayout;

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
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            {/* Overlay penuh layar tanpa layout di belakangnya */}
            <SettingsOverlay />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;
