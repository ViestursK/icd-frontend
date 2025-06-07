// src/layouts/PublicLayout.jsx
import React from "react";
import Navigation from "../components/Navigation";
import { useLocation } from "react-router-dom";
import "./PublicLayout.css";

const PublicLayout = ({ children }) => {
  const location = useLocation();
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";
  const isLandingPage = location.pathname === "/";

  return (
    <div className="public-layout">
      <Navigation
        showAuthButtons={!isAuthPage}
        showThemeToggle={true}
        variant="landing"
      />
      <main
        className={`public-content ${isAuthPage ? "auth-page" : ""} ${
          isLandingPage ? "landing-page" : ""
        }`}
      >
        {children}
      </main>
    </div>
  );
};

export default PublicLayout;
