import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaCogs,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaSpinner,
  FaWallet,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import "./Sidebar.css";

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Handle logout with loading state
  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    // Small delay for UX to show loading state
    setTimeout(() => {
      logout();
      navigate("/login");
    }, 500);
  };

  // Toggle mobile sidebar
  const toggleSidebar = () => {
    setMobileOpen((prev) => !prev);
  };

  // Close mobile sidebar when a link is clicked
  const handleLinkClick = () => {
    if (mobileOpen) {
      setMobileOpen(false);
    }
  };

  // Navigation links data
  const navLinks = [
    { path: "/dashboard", icon: <FaHome />, label: "Dashboard" },
    { path: "/dashboard/wallets", icon: <FaWallet />, label: "Wallets" },
    { path: "/dashboard/settings", icon: <FaCogs />, label: "Settings" },
    // { path: "/dashboard/profile", icon: <FaUser />, label: "Profile" },
  ];

  return (
    <>
      {!mobileOpen && (
        <button
          className="mobile-menu-toggle"
          onClick={toggleSidebar}
          aria-label="Open menu"
          aria-expanded={false}
        >
          <FaBars />
        </button>
      )}

      <aside className={`sidebar-container ${mobileOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-header">
          <Link
            to="/dashboard"
            className="sidebar-logo-link"
            onClick={handleLinkClick}
          >
            <img className="sidebar-logo" src="/assets/logo.svg" alt="logo" />
            <h1 className="sidebar-title">Portfolio Tracker</h1>
          </Link>

          <button
            className="mobile-close-button"
            onClick={toggleSidebar}
            aria-label="Close menu"
          >
            <FaTimes />
          </button>
        </div>

        <nav className="sidebar-nav" aria-label="Main navigation">
          <ul className="nav-list">
            {navLinks.map((link) => (
              <li
                key={link.path}
                className={`nav-item ${
                  location.pathname === link.path ? "active" : ""
                }`}
              >
                <Link
                  to={link.path}
                  className="nav-link"
                  onClick={handleLinkClick}
                  aria-current={
                    location.pathname === link.path ? "page" : undefined
                  }
                >
                  <span className="nav-icon">{link.icon}</span>
                  <span className="nav-label">{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button
            onClick={handleLogout}
            className="logout-button"
            aria-label="Log out"
            disabled={loggingOut}
          >
            {loggingOut ? (
              <FaSpinner className="logout-icon spinning" />
            ) : (
              <FaSignOutAlt className="logout-icon" />
            )}
            <span>{loggingOut ? "Logging out..." : "Sign Out"}</span>
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}
    </>
  );
}

export default Sidebar;
