import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const CreateWarehousePage = () => {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleCreate = async (e) => {
    e.preventDefault();

    const response = await fetch("http://localhost:8080/api/warehouses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name }),
    });

    if (response.ok) {
      setMessage("Warehouse created successfully!");
      setTimeout(() => {
        navigate("/select-warehouse");
      }, 1000);
    } else {
      const text = await response.text();
      setMessage(`❌ ${text}`);
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h2>Create New Warehouse</h2>
      <form onSubmit={handleCreate}>
        <input
          type="text"
          placeholder="Warehouse Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{ padding: "0.5rem", fontSize: "1rem", width: "300px" }}
        />
        <br /><br />
        <button type="submit" style={{ padding: "0.5rem 2rem" }}>
          Create
        </button>
      </form>

      {message && <p style={{ marginTop: "1rem", color: "green" }}>{message}</p>}

      <button onClick={() => navigate("/select-warehouse")} style={{ marginTop: "2rem" }}>
        ← Back
      </button>
    </div>
  );
};

export default CreateWarehousePage;
