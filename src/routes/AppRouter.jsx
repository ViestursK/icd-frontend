import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LandingPage from "../pages/LandingPage";
import Dashboard from "../pages/Dashboard";
import LoginPage from "../pages/LoginPage";
import Navbar from "../components/Navbar";

function AppRouter() {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Landing Page is shown if not logged in */}
        <Route
          path="/"
          element={
            !isAuthenticated ? <LandingPage /> : <Navigate to="/dashboard" />
          }
        />

        {/* Login Page: Only accessible if not logged in */}
        <Route
          path="/login"
          element={
            !isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" />
          }
        />

        {/* Dashboard: Only accessible if logged in */}
        <Route
          path="/dashboard"
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/" />}
        />
      </Routes>
    </Router>
  );
}

export default AppRouter;
