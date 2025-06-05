import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FaEnvelope,
  FaLock,
  FaExclamationCircle,
  FaUser,
  FaArrowLeft,
} from "react-icons/fa";
import logo from "../assets/logo.svg";
import "./Auth.css";

const Register = () => {
  const { register, isAuthenticated, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  // Form state
  const [form, setForm] = useState({
    email: "",
    password: "",
    password2: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({
    email: false,
    password: false,
    password2: false,
  });

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

        // Also validate password2 if it's been touched
        if (touched.password2 && form.password2) {
          if (value !== form.password2) {
            errors.password2 = "Passwords do not match";
          } else {
            delete errors.password2;
          }
        }
        break;
      case "password2":
        if (!value) {
          errors.password2 = "Please confirm your password";
        } else if (value !== form.password) {
          errors.password2 = "Passwords do not match";
        } else {
          delete errors.password2;
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
    const password2Valid = validateField("password2", form.password2);

    // Mark all fields as touched
    setTouched({
      email: true,
      password: true,
      password2: true,
    });

    return emailValid && passwordValid && password2Valid;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear any previous errors
    clearError();

    // Validate all fields before submission
    if (validateForm()) {
      await register(form);
    }
  };

  return (
    <div className="auth-container">
      <Link to="/" className="back-to-home">
        <FaArrowLeft /> Back to Home
      </Link>

      <div className="auth-brand">
        <img
          src="/assets/DECEN_logo_nobckgrnd.webp"
          alt="Decen"
          className="auth-logo"
        />
      </div>

      <div className="auth-card">
        <div className="auth-header">
          <h1>Create Account</h1>
          <p>Sign up to start tracking your crypto portfolio</p>
        </div>

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
                autoComplete="new-password"
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

          <div className="form-group">
            <label htmlFor="password2" className="form-label">
              Confirm Password
            </label>
            <div className="input-wrapper">
              <span className="input-icon">
                <FaLock />
              </span>
              <input
                id="password2"
                name="password2"
                type="password"
                autoComplete="new-password"
                className={`form-input ${
                  touched.password2 && formErrors.password2 ? "error" : ""
                }`}
                placeholder="••••••••"
                value={form.password2}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={loading}
                required
              />
            </div>
            {touched.password2 && formErrors.password2 && (
              <p className="error-text">{formErrors.password2}</p>
            )}
          </div>

          <div className="form-action">
            <button
              type="submit"
              className="auth-button"
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </div>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{" "}
            <Link to="/login" className="auth-link">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
