import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import "./Auth.css"; // Import shared auth styles

const Register = () => {
  const [form, setForm] = useState({ email: "", password: "", password2: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/api/users/register/", form);
      navigate("/login");
    } catch (error) {
      alert("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="brand">
        <img className="logo" src="../assets/logo.svg" alt="logo" />
        <h3 className="no-select">Portfolio Tracker</h3>
      </div>
      <div className="auth-card">
        <h2>Register</h2>
        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            name="email"
            autoComplete="username"
            type="text"
            placeholder="Email"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            name="password"
            autoComplete="new-password"
            type="password"
            placeholder="Password"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <input
            name="password2"
            autoComplete="new-password"
            type="password"
            placeholder="Confirm Password"
            onChange={(e) => setForm({ ...form, password2: e.target.value })}
          />
          <button className="auth-button" type="submit" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
        <p className="auth-footer">
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
};

export default Register;
