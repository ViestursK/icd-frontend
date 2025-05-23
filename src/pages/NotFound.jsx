import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.svg";
import "./NotFound.css";

const NotFound = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <img src={logo} alt="Portfolio Tracker" className="not-found-logo" />
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you are looking for doesn't exist or has been moved.</p>

        <div className="not-found-actions">
          {isAuthenticated ? (
            <Link to="/dashboard" className="primary-button">
              Return to Dashboard
            </Link>
          ) : (
            <Link to="/login" className="primary-button">
              Go to Login
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotFound;
