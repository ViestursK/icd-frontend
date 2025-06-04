import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { lazy, Suspense } from "react";
import { useAuth } from "../context/AuthContext";
import LoadingScreen from "../components/ui/LoadingScreen";

// Lazy load components for better performance
const DashboardLayout = lazy(() => import("../layouts/DashboardLayout"));
const Dashboard = lazy(() => import("../pages/Dashboard"));
const WalletManagement = lazy(() => import("../pages/WalletManagement"));
const Settings = lazy(() => import("../pages/Settings"));
const Profile = lazy(() => import("../pages/Profile"));
const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const NotFound = lazy(() => import("../pages/NotFound"));
const LandingPage = lazy(() => import("../pages/LandingPage"));

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, initialChecking } = useAuth();
  const location = useLocation();

  // Show loading screen while checking authentication or during any auth operations
  if (initialChecking || loading) {
    return <LoadingScreen message="Verifying session..." />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
};

// Public route component (accessible only when NOT authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading, initialChecking } = useAuth();

  // Show loading screen while checking authentication or during any auth operations
  if (initialChecking || loading) {
    return <LoadingScreen message="Please wait..." />;
  }

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function AppRouter() {
  return (
    <Suspense fallback={<LoadingScreen message="Loading application..." />}>
      <Routes>
        {/* Landing Page - Public */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth Routes - Public Only */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* Protected Routes (require authentication) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Main dashboard (all wallets) */}
          <Route index element={<Dashboard />} />

          {/* Wallet management page */}
          <Route path="wallets" element={<WalletManagement />} />

          {/* Single wallet view */}
          <Route path="wallet/:chain/:address" element={<Dashboard />} />

          {/* Other dashboard routes */}
          <Route path="settings" element={<Settings />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default AppRouter;
