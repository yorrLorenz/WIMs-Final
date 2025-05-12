import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddProduct = () => {
  const { warehouseId } = useParams();
  const navigate = useNavigate();
  const username = localStorage.getItem("username");

  const [formData, setFormData] = useState({
    action: "Restocked",
    item: "",
    location: "",
    groupId: "",
    units: 1,
  });

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "groupId" && (formData.action === "Removed" || formData.action === "Move")) {
      try {
        const res = await fetch(`https://wims-w48m.onrender.com/api/logs/group/${encodeURIComponent(value)}`, {
          method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        });
        if (res.ok) {
          const data = await res.json();
          setFormData((prev) => ({
            ...prev,
            item: data.item,
            location: formData.action === "Removed" ? data.location : "",
          }));
        } else {
          toast.error("Group ID not found");
        }
      } catch (err) {
        console.error("Failed to fetch group info", err);
        toast.error("Failed to fetch group info");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const body = {
      ...formData,
      username,
      warehouse: warehouseId,
    };

    if (formData.action === "Restocked") {
      body.item = formData.item.trim();
      body.location = formData.location.trim();
      if (!body.item || !body.location || formData.units < 1) {
        toast.error("Item, location, and units must be valid");
        return;
      }
    }

    if (formData.action === "Restocked") {
      delete body.groupId;
    }

    try {
      const res = await fetch("https://wims-w48m.onrender.com/api/products/add", {
       method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        toast.success("Product logged successfully!");
        setTimeout(() => navigate(`/warehouse/${warehouseId}`), 1000);
      } else {
        const text = await res.text();
        toast.error(text || "Failed to save log");
      }
    } catch (err) {
      console.error("Network error:", err);
      toast.error("Network error");
    }
  };

  return (
    <div className="add-product-container">
      <ToastContainer />
      <div className="add-product-card">
        <h2>Add Product to Warehouse: {warehouseId}</h2>
        <form onSubmit={handleSubmit}>
          <label>Action:</label>
          <select name="action" value={formData.action} onChange={handleChange}>
            <option value="Restocked">Restocked</option>
            <option value="Removed">Removed</option>
            <option value="Move">Move</option>
          </select>
          <br /><br />

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
                value={formData.units}
                onChange={handleChange}
                required
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
            <button type="button" onClick={() => navigate(-1)}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
