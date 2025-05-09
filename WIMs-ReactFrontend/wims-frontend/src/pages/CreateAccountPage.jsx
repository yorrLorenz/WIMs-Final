// src/pages/CreateAccountPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const CreateAccountPage = () => {
  const [form, setForm] = useState({
    username: "",
    password: "",
    role: "ADMIN",
    warehouse: "",
  });

  const [warehouses, setWarehouses] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:8080/api/accounts/warehouses", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setWarehouses(data))
      .catch((err) => {
        console.error("Error loading warehouses:", err);
        setWarehouses([]);
      });
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!form.username || !form.password || !form.role) {
      setError("All fields are required.");
      return;
    }

    if (form.role === "CLERK" && !form.warehouse) {
      setError("Clerk must select a warehouse.");
      return;
    }

    try {
      const res = await fetch("http://localhost:8080/api/accounts/create", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setMessage("Account created successfully!");
        setTimeout(() => navigate("/select-warehouse"), 1000);
      } else {
        const text = await res.text();
        setError(text || "Failed to create account.");
      }
    } catch (err) {
      console.error("Network error:", err);
      setError("Network error");
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "500px", margin: "0 auto" }}>
      <h2>Create Account</h2>

      {message && <div style={{ color: "green", marginBottom: "1rem" }}>{message}</div>}
      {error && <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <label>Username:</label>
        <input
          name="username"
          value={form.username}
          onChange={handleChange}
          required
        /><br /><br />

        <label>Password:</label>
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          required
        /><br /><br />

        <label>Role:</label>
        <select name="role" value={form.role} onChange={handleChange}>
          <option value="ADMIN">Admin</option>
          <option value="CLERK">Clerk</option>
        </select><br /><br />

        {form.role === "CLERK" && (
          <>
            <label>Warehouse:</label>
            <select
              name="warehouse"
              value={form.warehouse}
              onChange={handleChange}
              required
            >
              <option value="">-- Select Warehouse --</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.name}>
                  {w.name}
                </option>
              ))}
            </select><br /><br />
          </>
        )}

        <button type="submit">Create Account</button>
      </form>
    </div>
  );
};

export default CreateAccountPage;
