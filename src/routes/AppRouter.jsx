import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import LoadingScreen from "../components/ui/LoadingScreen";

// Lazy load components for better performance
const DashboardLayout = lazy(() => import("../layouts/DashboardLayout"));
const Dashboard = lazy(() => import("../pages/Dashboard"));
const Settings = lazy(() => import("../pages/Settings"));
const Profile = lazy(() => import("../pages/Profile"));
const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const NotFound = lazy(() => import("../pages/NotFound"));

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
          <Route index element={<Dashboard />} />
          <Route path="settings" element={<Settings />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Root path redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default AppRouter;
