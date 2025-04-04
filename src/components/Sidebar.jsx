import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaCogs,
  FaUser,
  FaSignOutAlt,
  FaChartLine,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import "./Sidebar.css";

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate("/login");
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
    { path: "/dashboard/settings", icon: <FaCogs />, label: "Settings" },
    { path: "/dashboard/profile", icon: <FaUser />, label: "Profile" },
  ];

  return (
    <>
      {/* Mobile Hamburger Menu - Only visible on mobile */}
      <button
        className="mobile-menu-toggle"
        onClick={toggleSidebar}
        aria-label={mobileOpen ? "Close menu" : "Open menu"}
        aria-expanded={mobileOpen}
      >
        {mobileOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Sidebar */}
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
          >
            <FaSignOutAlt className="logout-icon" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile */}
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
