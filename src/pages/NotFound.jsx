import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ThemeLogo from "../components/ui/ThemeLogo";
import "./NotFound.css";

const NotFound = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <ThemeLogo className="not-found-logo" size="large" withGlow={true} />
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you are looking for doesn't exist or has been moved.</p>

        <div className="not-found-actions">
          {isAuthenticated ? (
            <Link to="/dashboard" className="primary-button">
              Return to Dashboard
            </Link>
          ) : (
            <div className="not-found-buttons">
              <Link to="/" className="primary-button">
                Return to Home
              </Link>
              <Link to="/login" className="secondary-button">
                Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotFound;
