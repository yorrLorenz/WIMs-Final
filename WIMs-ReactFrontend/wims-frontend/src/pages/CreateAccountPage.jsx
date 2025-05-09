import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const CreateAccountPage = () => {
  const [form, setForm] = useState({
    username: "",
    password: "",
    role: "ADMIN",
    warehouse: "",
    imageUrl: "", // Optional image field
  });

  const [warehouses, setWarehouses] = useState([]);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:8080/api/accounts/warehouses", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setWarehouses(data))
      .catch((err) => console.error("Error loading warehouses:", err));
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch("http://localhost:8080/api/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(form),
    });

    if (response.ok) {
      setMessage("✅ Account created successfully!");
      setTimeout(() => navigate("/select-warehouse"), 1000);
    } else {
      const text = await response.text();
      setMessage(`❌ ${text}`);
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h2>Create New Account</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          value={form.username}
          onChange={handleChange}
          placeholder="Username"
          required
          style={{ padding: "0.5rem", width: "250px" }}
        />
        <br /><br />
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Password"
          required
          style={{ padding: "0.5rem", width: "250px" }}
        />
        <br /><br />
        <input
          type="text"
          name="imageUrl"
          value={form.imageUrl}
          onChange={handleChange}
          placeholder="Image URL (optional)"
          style={{ padding: "0.5rem", width: "250px" }}
        />
        <br /><br />
        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          style={{ padding: "0.5rem", width: "250px" }}
        >
          <option value="ADMIN">Admin</option>
          <option value="CLERK">Clerk</option>
        </select>
        <br /><br />

        {form.role === "CLERK" && (
          <>
            <select
              name="warehouse"
              value={form.warehouse}
              onChange={handleChange}
              required
              style={{ padding: "0.5rem", width: "250px" }}
            >
              <option value="">Select Warehouse</option>
              {warehouses.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
            <br /><br />
          </>
        )}

        <button type="submit" style={{ padding: "0.5rem 1rem" }}>
          Create Account
        </button>
      </form>

      {message && <p style={{ marginTop: "1rem", color: "green" }}>{message}</p>}

      <button onClick={() => navigate("/select-warehouse")} style={{ marginTop: "2rem" }}>
        ← Back
      </button>
    </div>
  );
};

export default CreateAccountPage;
