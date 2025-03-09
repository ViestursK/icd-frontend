import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // Check if the current route is "/login"
  const isLoginPage = location.pathname === "/login";

  function handleLogout() {
    logout(); // Clear the auth state from localStorage
    navigate("/"); // Ensure it goes to the Landing Page after logout
  }

  return (
    <nav>
      <h1>IsCryptoDead.io</h1>
      {isAuthenticated ? (
        // If the user is logged in, show the Logout button
        <button onClick={handleLogout}>Logout</button>
      ) : (
        // Only show Login button if the user is not on the Login Page
        !isLoginPage && (
          <Link to="/login">
            <button>Login</button>
          </Link>
        )
      )}
    </nav>
  );
}

export default Navbar;
