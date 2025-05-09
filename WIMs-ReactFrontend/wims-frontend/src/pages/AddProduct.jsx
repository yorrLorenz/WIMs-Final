import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const AddProduct = () => {
  const { warehouseId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    action: "Restocked",
    item: "",
    location: "",
    groupId: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const username = localStorage.getItem("username");

        const res = await fetch(
          `http://localhost:8080/api/logs/warehouse/${encodeURIComponent(warehouseId)}/add`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ ...formData, username }),
          }
        );
        
      if (res.ok) {
        navigate(`/warehouse/${warehouseId}`);
      } else {
        const text = await res.text();
        setError(text || "Failed to save log");
      }
    } catch (err) {
      console.error(err);
      setError("Error connecting to server");
    }
  };

  return (
    <div>
      <h2>Add Product to Warehouse: {warehouseId}</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Action: </label>
          <select name="action" value={formData.action} onChange={handleChange}>
            <option value="Restocked">Restocked</option>
            <option value="Removed">Removed</option>
          </select>
        </div>
        <div>
          <label>Item Name: </label>
          <input
            type="text"
            name="item"
            value={formData.item}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Warehouse Location: </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Product Group ID: </label>
          <input
            type="text"
            name="groupId"
            value={formData.groupId}
            onChange={handleChange}
          />
        </div>
        <button type="submit">Save</button>
        <button type="button" onClick={() => navigate(-1)}>
          Cancel
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
