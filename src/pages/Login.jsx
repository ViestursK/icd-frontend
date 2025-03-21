import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import "../styles/globals.css";
import "./Auth.css";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post("/api/users/token/", form);
      localStorage.setItem("access_token", response.data.access);
      navigate("/dashboard");
    } catch (error) {
      alert("Invalid credentials");
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
        <h2>Login</h2>
        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            name="email"
            autoComplete="email"
            type="text"
            placeholder="Email"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            name="password"
            autoComplete="current-password"
            type="password"
            placeholder="Password"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <button className="auth-button" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="auth-footer">
          Don't have an account? <a href="/register">Register</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
