// /src/pages/Register.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

const Register = () => {
  const [form, setForm] = useState({ email: "", password: "", password2: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/users/register/", form); // Register request
      navigate("/login"); // Redirect to login page after successful registration
    } catch (error) {
      alert("Registration failed");
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="username"
          autoComplete="username"
          type="text"
          placeholder="Username"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          name="password"
          autoComplete="current-password"
          type="password"
          placeholder="Password"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <input
          name="password2"
          autoComplete="current-password"
          type="password"
          placeholder="Confirm Password"
          onChange={(e) => setForm({ ...form, password2: e.target.value })}
        />
        <button type="submit">Register</button>
      </form>
      <p>
        Already have an account? <a href="/login">Login</a>
      </p>
    </div>
  );
};

export default Register;
