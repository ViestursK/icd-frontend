import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes, FaMoon, FaSun } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import "./Navigation.css";

const Navigation = ({
  navigationItems = [],
  showAuthButtons = false,
  showThemeToggle = false,
  onNavigationClick,
  className = "",
  scrolled = false,
}) => {
  const { isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Default navigation items for landing page
  const defaultLandingItems = [
    {
      id: "features",
      label: "Features",
      type: "scroll",
    },
    {
      id: "how-it-works",
      label: "How It Works",
      type: "scroll",
    },
    {
      id: "security",
      label: "Security",
      type: "scroll",
    },
    {
      id: "faq",
      label: "FAQ",
      type: "scroll",
    },
  ];

  // Use provided items or defaults
  const navItems =
    navigationItems.length > 0 ? navigationItems : defaultLandingItems;

  // Toggle mobile navigation
  const toggleMobileNav = () => {
    setMobileOpen((prev) => !prev);
  };

  // Handle navigation item click
  const handleItemClick = (item) => {
    if (item.type === "scroll" && item.id) {
      // Scroll to section
      const section = document.getElementById(item.id);
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    } else if (item.type === "link" && item.path) {
      // Handle link navigation if needed
      window.location.href = item.path;
    } else if (onNavigationClick) {
      // Custom handler
      onNavigationClick(item);
    }

    // Close mobile menu
    setMobileOpen(false);
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileOpen && !event.target.closest(".navigation-container")) {
        setMobileOpen(false);
      }
    };

    if (mobileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [mobileOpen]);

  return (
    <>
      {/* Mobile toggle button - only show when menu is closed */}
      {!mobileOpen && (
        <button
          className="mobile-nav-toggle"
          onClick={toggleMobileNav}
          aria-label="Open menu"
          aria-expanded={false}
        >
          <FaBars />
        </button>
      )}

      {/* Navigation container */}
      <nav
        className={`navigation-container ${className} ${
          mobileOpen ? "mobile-open" : ""
        } ${scrolled ? "scrolled" : ""}`}
      >
        {/* Navigation header */}
        <div className="nav-header">
          <Link
            to="/"
            className="nav-logo-link"
            onClick={() => setMobileOpen(false)}
          >
            <img
              className="nav-logo"
              src="/assets/DECEN_logo_nobckgrnd.webp"
              alt="Decen"
            />
          </Link>

          <button
            className="mobile-close-button"
            onClick={toggleMobileNav}
            aria-label="Close menu"
          >
            <FaTimes />
          </button>
        </div>

        {/* Navigation content */}
        <div className="nav-content">
          {/* Navigation items */}
          <div className="nav-items">
            {navItems.map((item, index) => (
              <div key={item.id || index} className="nav-item">
                <button
                  className="nav-link"
                  onClick={() => handleItemClick(item)}
                >
                  {item.icon && <span className="nav-icon">{item.icon}</span>}
                  <span className="nav-label">{item.label}</span>
                </button>
              </div>
            ))}
          </div>

          {/* Additional controls */}
          <div className="nav-controls">
            {/* Theme toggle */}
            {showThemeToggle && (
              <button
                className="theme-toggle"
                onClick={toggleTheme}
                title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                aria-label={`Switch to ${
                  theme === "dark" ? "light" : "dark"
                } mode`}
              >
                {theme === "dark" ? <FaSun /> : <FaMoon />}
              </button>
            )}

            {/* Auth buttons for landing page */}
            {showAuthButtons && !isAuthenticated && (
              <div className="auth-buttons">
                <Link
                  to="/login"
                  className="nav-login"
                  onClick={() => setMobileOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="nav-signup"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign Up Free
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="nav-backdrop"
          onClick={toggleMobileNav}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default Navigation;
