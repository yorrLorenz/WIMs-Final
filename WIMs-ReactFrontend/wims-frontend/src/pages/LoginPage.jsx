import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../components/Login.css";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
  
    try {
      const res = await fetch("http://localhost:8080/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });
  
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("auth", "true");
        localStorage.setItem("role", data.role);
        localStorage.setItem("username", username);
  
        if (data.role === "ADMIN") {
          navigate("/select-warehouse"); // instead of "/admin-dashboard"
        } else {
          localStorage.setItem("warehouse", data.assignedWarehouse);
          navigate(`/warehouse/${encodeURIComponent(data.assignedWarehouse)}`);
        }
        
      } else {
        const errorText = await res.text();
        setError(`Login failed: ${errorText}`);
        console.error("Login error response:", errorText);
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError(`An error occurred: ${err.message}`);
    }
  };
  

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Login to WIMS</h2>
        {error && <div className="login-error">{error}</div>}
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
