// /src/routes/AppRouter.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import Dashboard from "../pages/Dashboard";
import Settings from "../pages/Settings";
import Profile from "../pages/Profile";
import Login from "../pages/Login";
import Register from "../pages/Register";

// A simple PrivateRoute to protect dashboard pages
const PrivateRoute = ({ children }) => {
  const accessToken = localStorage.getItem("access_token");
  return accessToken ? children : <Navigate to="/login" />;
};

function AppRouter() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="settings" element={<Settings />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Redirect unknown routes to login */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default AppRouter;
