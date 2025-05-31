import { useState, useEffect } from "react";
import {
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

  // Handle theme change
  const handleThemeChange = (selectedTheme) => {
    setTheme(selectedTheme);
    toast.success(
      `Theme changed to ${
        selectedTheme === "system" ? "system preference" : selectedTheme
      }`
    );
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
      </div>
    </div>
  );
};

export default Settings;