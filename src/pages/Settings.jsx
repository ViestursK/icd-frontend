import React, { useState, useEffect } from "react";
import {
  FaCog,
  FaBell,
  FaShieldAlt,
  FaPalette,
  FaMoon,
  FaSun,
  FaDesktop,
} from "react-icons/fa";
import Header from "../components/ui/Header";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import "./Settings.css";

const Settings = () => {
  const toast = useToast();
  const { logout } = useAuth();
  const { theme, setTheme } = useTheme();

  // User preferences state
  const [preferences, setPreferences] = useState({
    notifications: {
      priceAlerts: true,
      portfolioChanges: true,
      securityUpdates: true,
    },
    security: {
      twoFactorAuth: false,
      loginNotifications: true,
    },
  });

  // Update preferences when settings change
  useEffect(() => {
    // Load saved preferences from localStorage if available
    const savedPreferences = localStorage.getItem("userPreferences");
    if (savedPreferences) {
      setPreferences(JSON.parse(savedPreferences));
    }
  }, []);

  // Save preferences to localStorage when they change
  useEffect(() => {
    localStorage.setItem("userPreferences", JSON.stringify(preferences));
  }, [preferences]);

  // Handle preference toggle
  const handlePreferenceToggle = (category, setting) => {
    setPreferences((prev) => {
      const newPreferences = {
        ...prev,
        [category]: {
          ...prev[category],
          [setting]: !prev[category][setting],
        },
      };

      // Show toast notification
      const status = newPreferences[category][setting] ? "enabled" : "disabled";
      toast.success(`${setting} ${status}`);

      return newPreferences;
    });
  };

  // Handle theme change
  const handleThemeChange = (selectedTheme) => {
    setTheme(selectedTheme);
    toast.success(
      `Theme changed to ${
        selectedTheme === "system" ? "system preference" : selectedTheme
      }`
    );
  };

  // Get theme icon
  const getThemeIcon = (themeType) => {
    switch (themeType) {
      case "light":
        return <FaSun className="theme-icon" />;
      case "dark":
        return <FaMoon className="theme-icon" />;
      case "system":
        return <FaDesktop className="theme-icon" />;
      default:
        return null;
    }
  };

  return (
    <div className="dashboard-container">
      <Header title="SETTINGS" />

      <div className="settings-container">
        {/* Theme and Appearance */}
        <section className="settings-section">
          <div className="settings-header">
            <FaPalette className="settings-icon" />
            <h2>Appearance</h2>
          </div>

          <div className="theme-options">
            <div
              className={`theme-option ${theme === "light" ? "active" : ""}`}
              onClick={() => handleThemeChange("light")}
            >
              <div className="theme-preview light">
                <FaSun />
              </div>
              <div className="theme-label">Light</div>
            </div>

            <div
              className={`theme-option ${theme === "dark" ? "active" : ""}`}
              onClick={() => handleThemeChange("dark")}
            >
              <div className="theme-preview dark">
                <FaMoon />
              </div>
              <div className="theme-label">Dark</div>
            </div>

            <div
              className={`theme-option ${theme === "system" ? "active" : ""}`}
              onClick={() => handleThemeChange("system")}
            >
              <div className="theme-preview system">
                <FaDesktop />
              </div>
              <div className="theme-label">System</div>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="settings-section">
          <div className="settings-header">
            <FaBell className="settings-icon" />
            <h2>Notifications</h2>
          </div>

          <div className="settings-options">
            {Object.entries(preferences.notifications).map(([key, value]) => (
              <div key={key} className="settings-option">
                <div className="option-details">
                  <span className="option-label">
                    {key
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (str) => str.toUpperCase())}
                  </span>
                  <span className="option-description">
                    {getNotificationDescription(key)}
                  </span>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={() =>
                      handlePreferenceToggle("notifications", key)
                    }
                  />
                  <span className="slider"></span>
                </label>
              </div>
            ))}
          </div>
        </section>

        {/* Security */}
        <section className="settings-section">
          <div className="settings-header">
            <FaShieldAlt className="settings-icon" />
            <h2>Security</h2>
          </div>

          <div className="settings-options">
            {Object.entries(preferences.security).map(([key, value]) => (
              <div key={key} className="settings-option">
                <div className="option-details">
                  <span className="option-label">
                    {key
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (str) => str.toUpperCase())}
                  </span>
                  <span className="option-description">
                    {getSecurityDescription(key)}
                  </span>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={() => handlePreferenceToggle("security", key)}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

// Helper function to get notification descriptions
function getNotificationDescription(key) {
  const descriptions = {
    priceAlerts: "Receive alerts when prices change significantly",
    portfolioChanges: "Get notified about major changes to your portfolio",
    securityUpdates: "Important security-related notifications",
  };
  return descriptions[key] || "";
}

// Helper function to get security descriptions
function getSecurityDescription(key) {
  const descriptions = {
    twoFactorAuth: "Require a second form of authentication when logging in",
    loginNotifications: "Get notified about new logins to your account",
  };
  return descriptions[key] || "";
}

export default Settings;
