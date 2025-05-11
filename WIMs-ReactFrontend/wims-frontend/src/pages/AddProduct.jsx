import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const AddProduct = () => {
  const { warehouseId } = useParams();
  const navigate = useNavigate();
  const username = localStorage.getItem("username");

  const [formData, setFormData] = useState({
    action: "Restocked",
    item: "",
    location: "",
    groupId: "",
  });
  const [error, setError] = useState("");

 const handleChange = async (e) => {
  const { name, value } = e.target;
  setFormData((prev) => ({ ...prev, [name]: value }));

  // If selecting a group ID for Remove or Move
  if (name === "groupId" && (formData.action === "Removed" || formData.action === "Move")) {
    try {
      const res = await fetch(`http://localhost:8080/api/logs/group/${encodeURIComponent(value)}`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setFormData((prev) => ({
          ...prev,
          item: data.item,
          location: formData.action === "Removed" ? data.location : "", // keep original for Removed
        }));
      }
    } catch (err) {
      console.error("Failed to fetch group info", err);
    }
  }
};


  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✨ Correctly spread formData into the body
    const body = {
      ...formData,
      username,
      warehouse: warehouseId,
    };
    // only omit groupId for brand-new restocks
    if (formData.action === "Restocked") {
      delete body.groupId;
    }

    try {
      const res = await fetch(
        `http://localhost:8080/api/products/add`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      if (res.ok) {
        // go back to dashboard and re-fetch *all* logs
        navigate(`/warehouse/${warehouseId}`);
      } else {
        const text = await res.text();
        setError(text || "Failed to save log");
      }
    } catch (err) {
      console.error("Network error:", err);
      setError("Network error");
    }
  };

  return (
    <div className="add-product-container">
      <div className="add-product-card">
        <h2>Add Product to Warehouse: {warehouseId}</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          
            <label>Action:</label>
<select name="action" value={formData.action} onChange={handleChange}>
  <option value="Restocked">Restocked</option>
  <option value="Removed">Removed</option>
  <option value="Move">Move</option>
</select><br /><br />

{formData.action === "Restocked" && (
  <>
    <label>Item:</label>
    <input type="text" name="item" value={formData.item} onChange={handleChange} required />
    <label>Location:</label>
    <input type="text" name="location" value={formData.location} onChange={handleChange} required />
    <label>Units:</label>
<input
  type="number"
  name="units"
  min="1"
  value={form.units || 1}
  onChange={(e) => setForm({ ...form, units: parseInt(e.target.value) })}
/>

  </>
)}

{formData.action === "Removed" && (
  <>
    <label>Group ID:</label>
    <input type="text" name="groupId" value={formData.groupId} onChange={handleChange} required />
    <label>Item:</label>
    <input type="text" name="item" value={formData.item} readOnly />
    <label>Location:</label>
    <input type="text" name="location" value={formData.location} readOnly />
  </>
)}

{formData.action === "Move" && (
  <>
    <label>Group ID:</label>
    <input type="text" name="groupId" value={formData.groupId} onChange={handleChange} required />
    <label>Item:</label>
    <input type="text" name="item" value={formData.item} readOnly />
    <label>New Location:</label>
    <input type="text" name="location" value={formData.location} onChange={handleChange} required />
  </>
)}


          <div className="form-actions">
            <button type="submit">Save</button>
            <button type="button" onClick={() => navigate(-1)}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
