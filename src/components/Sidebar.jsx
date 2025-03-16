import { useNavigate, Link } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
  const navigate = useNavigate();

  return (
    <aside className="sidebar-container">
      <h2>*LOGO & APP NAME HERE*</h2>
      <nav>
        <ul>
          <li>
            <Link to="/dashboard">Home</Link>
          </li>
          <li>
            <Link to="/dashboard/settings">Settings</Link>
          </li>
          <li>
            <Link to="/dashboard/profile">Profile</Link>
          </li>
        </ul>
      </nav>
      <button onClick={() => logout(navigate)}>Logout</button>
    </aside>
  );
}

export default Sidebar;
