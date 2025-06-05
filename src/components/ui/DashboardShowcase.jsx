import React, { useState, useEffect } from "react";
import "./DashboardShowcase.css";

const DashboardShowcase = ({ className = "" }) => {
  const [currentTheme, setCurrentTheme] = useState("dark");

  // Listen for theme changes
  useEffect(() => {
    const getTheme = () => {
      const theme = document.documentElement.getAttribute("data-theme");
      return theme || "dark";
    };

    setCurrentTheme(getTheme());

    const observer = new MutationObserver(() => {
      setCurrentTheme(getTheme());
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className={`dashboard-showcase ${className}`}>
      {/* Background Effects */}
      <div className="showcase-background">
        <div className="dot-pattern" />
      </div>

      {/* Device Container */}
      <div className="devices-container">
        {/* Desktop/Laptop */}
        <div className="device laptop">
          <img
            src={
              currentTheme === "dark"
                ? "/assets/Laptop_black.png" // Replace with your desktop dark image
                : "/assets/Laptop_white.png" // Replace with your desktop light image
            }
            alt="Desktop Dashboard"
            className="dashboard-image desktop-image"
          />
        </div>

        {/* Mobile Phone */}
        <div className="device phone">
          <img
            src={
              currentTheme === "dark"
                ? "/assets/PhoneMockup_black.png"
                : "/assets/PhoneMockup_white.png"
            }
            alt="Mobile Dashboard"
            className="dashboard-image mobile-image"
          />
        </div>
      </div>

      {/* Floating Elements */}
      <div className="floating-elements">
        <div className="float-card card-1">
          <div className="card-icon">📊</div>
          <div className="card-text">Real-time Analytics</div>
        </div>
        <div className="float-card card-2">
          <div className="card-icon">🔒</div>
          <div className="card-text">Secure & Private</div>
        </div>
        <div className="float-card card-3">
          <div className="card-icon">⚡</div>
          <div className="card-text">Lightning Fast</div>
        </div>
      </div>
    </div>
  );
};

export default DashboardShowcase;
