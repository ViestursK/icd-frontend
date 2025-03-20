import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaHome, FaCogs, FaUser, FaSignOutAlt } from "react-icons/fa";
import "./Sidebar.css";

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  return (
    <aside className="sidebar-container">
      <div className="sidebar-logo">
        <img className="logo" src="../assets/logo.svg" alt="logo" />
        <h3 className="no-select">Portfolio Tracker</h3>
      </div>

      <nav className="sidebar-nav">
        <ul>
          <li className={location.pathname === "/dashboard" ? "active" : ""}>
            <Link to="/dashboard">
              <FaHome className="sidebar-icon" /> Dashboard
            </Link>
          </li>
          <li
            className={
              location.pathname === "/dashboard/settings" ? "active" : ""
            }
          >
            <Link to="/dashboard/settings">
              <FaCogs className="sidebar-icon" /> Settings
            </Link>
          </li>
          <li
            className={
              location.pathname === "/dashboard/profile" ? "active" : ""
            }
          >
            <Link to="/dashboard/profile">
              <FaUser className="sidebar-icon" /> Profile
            </Link>
          </li>
          <li id="logout">
            <button onClick={handleLogout} className="logout-button">
              <FaSignOutAlt className="sidebar-icon" /> Logout
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;
