// Login.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FaEnvelope,
  FaLock,
  FaExclamationCircle,
  FaArrowLeft,
} from "react-icons/fa";
import logo from "../assets/logo.svg";
import "./Auth.css";

const Login = () => {
  const location = useLocation();
  const { login, isAuthenticated, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  // Form state
  const [form, setForm] = useState({ email: "", password: "" });
  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({ email: false, password: false });

  // Get redirect message from location state (if any)
  const message = location.state?.message || "";
  const from = location.state?.from || "/dashboard";

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // Validate field on change if it's been touched
    if (touched[name]) {
      validateField(name, value);
    }
  };

  // Mark field as touched on blur
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    validateField(name, value);
  };

  // Validate individual field
  const validateField = (name, value) => {
    let errors = { ...formErrors };

    switch (name) {
      case "email":
        if (!value) {
          errors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          errors.email = "Email address is invalid";
        } else {
          delete errors.email;
        }
        break;
      case "password":
        if (!value) {
          errors.password = "Password is required";
        } else if (value.length < 6) {
          errors.password = "Password must be at least 6 characters";
        } else {
          delete errors.password;
        }
        break;
      default:
        break;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validate form on submission
  const validateForm = () => {
    const emailValid = validateField("email", form.email);
    const passwordValid = validateField("password", form.password);

    // Mark all fields as touched
    setTouched({ email: true, password: true });

    return emailValid && passwordValid;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear any previous errors
    clearError();

    // Validate all fields before submission
    if (validateForm()) {
      await login(form);
    }
  };

  return (
    <div className="auth-container">
      <Link to="/" className="back-to-home">
        <FaArrowLeft /> Back to Home
      </Link>

      <div className="auth-brand">
        <img src={logo} alt="Portfolio Tracker" className="auth-logo" />
        <h2 className="brand-name">Portfolio Tracker</h2>
      </div>

      <div className="auth-card">
        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p>Sign in to your account to continue</p>
        </div>

        {/* Show redirect message if any */}
        {message && (
          <div className="auth-message info" role="alert">
            <FaExclamationCircle />
            <span>{message}</span>
          </div>
        )}

        {/* Show error message if any */}
        {error && (
          <div className="auth-message error" role="alert">
            <FaExclamationCircle />
            <span>{error}</span>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <div className="input-wrapper">
              <span className="input-icon">
                <FaEnvelope />
              </span>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className={`form-input ${
                  touched.email && formErrors.email ? "error" : ""
                }`}
                placeholder="your@email.com"
                value={form.email}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={loading}
                required
              />
            </div>
            {touched.email && formErrors.email && (
              <p className="error-text">{formErrors.email}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="input-wrapper">
              <span className="input-icon">
                <FaLock />
              </span>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                className={`form-input ${
                  touched.password && formErrors.password ? "error" : ""
                }`}
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={loading}
                required
              />
            </div>
            {touched.password && formErrors.password && (
              <p className="error-text">{formErrors.password}</p>
            )}
          </div>

          <div className="form-action">
            <button
              type="submit"
              className="auth-button"
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </div>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{" "}
            <Link to="/register" className="auth-link">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
