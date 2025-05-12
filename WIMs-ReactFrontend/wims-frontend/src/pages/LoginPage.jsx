// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";

const LoginPage = () => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("https://wims-w48m.onrender.com/api/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("auth", "true");
        localStorage.setItem("role", data.role);
        localStorage.setItem("username", form.username);
        if (data.assignedWarehouse) {
          localStorage.setItem("warehouse", data.assignedWarehouse);
          navigate(`/warehouse/${encodeURIComponent(data.assignedWarehouse)}`);
        } else {
          navigate("/select-warehouse");
        }
      } else {
        const msg = await res.json();
        setError(msg.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error", err);
      setError("Network error");
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="logo-section">
          <img src="/logo.png" alt="WIMS Logo" className="logo-image" />
          <h1>WIMS</h1>
          <p>Warehouse Inventory<br />Management System</p>
        </div>
      </div>
      <div className="login-right">
        <form onSubmit={handleSubmit} className="login-form">
          <h2>Login to WIMS</h2>
          <div className="underline"></div>
          {error && <div className="login-error">{error}</div>}
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button type="submit">Log In</button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
