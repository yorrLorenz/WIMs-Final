// src/pages/WarehouseSelectionPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const WarehouseSelectionPage = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:8080/api/warehouses", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setWarehouses(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load warehouses", err);
        setLoading(false);
      });
  }, []);

  const handleSelectWarehouse = (name) => {
    localStorage.setItem("warehouse", name); // ✅ Store selected warehouse
    navigate(`/warehouse/${encodeURIComponent(name)}`);
  };

  const handleCreateWarehouse = () => {
    navigate("/create-warehouse");
  };

  const handleCreateAccount = () => {
    navigate("/create-account");
  };

  const handleAdminDashboard = () => {
    navigate("/admin-dashboard");
  };

  const handleLogout = () => {
    localStorage.clear(); // or remove specific keys
    navigate("/");
  };
  

  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h2>Select a Warehouse</h2>

      {loading ? (
        <p>Loading warehouses...</p>
      ) : warehouses.length === 0 ? (
        <p>No warehouses available yet.</p>
      ) : (
        warehouses.map((w) => (
          <button
            key={w.id}
            onClick={() => handleSelectWarehouse(w.name)}
            style={{ margin: "1rem", padding: "1rem 2rem", fontSize: "1rem" }}
          >
            {w.name}
          </button>
        ))
      )}

      <hr style={{ margin: "2rem 0" }} />

      <div>
        <button onClick={handleCreateWarehouse} style={{ margin: "0.5rem" }}>
          ➕ Create Warehouse
        </button>
        <button onClick={handleCreateAccount} style={{ margin: "0.5rem" }}>
          👤 Create Account
        </button>
        <button onClick={handleAdminDashboard} style={{ margin: "0.5rem" }}>
          📊 Admin Dashboard
        </button>
        <button
          onClick={handleLogout}
          style={{ margin: "0.5rem", background: "#e74c3c", color: "white" }}
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
};

export default WarehouseSelectionPage;
