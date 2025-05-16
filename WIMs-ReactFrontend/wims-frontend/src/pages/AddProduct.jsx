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

  const [isLoading, setIsLoading] = useState(false); // ✅ loading state

  const handleChange = async (e) => {
    const { name, value } = e.target;
    const updatedForm = { ...formData, [name]: value };
    setFormData(updatedForm);

    if (name === "groupId" && (updatedForm.action === "Removed" || updatedForm.action === "Move")) {
      try {
        const res = await fetch(
          `https://wims-w48m.onrender.com/api/logs/group/${encodeURIComponent(value)}`,
          { method: "GET", credentials: "include" }
        );

        if (res.ok) {
          const data = await res.json();
          setFormData((prev) => ({
            ...prev,
            item: data.item,
            location: updatedForm.action === "Removed" ? data.location : "",
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
    if (isLoading) return;

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
      setIsLoading(true); // ✅ disable button
      const res = await fetch("https://wims-w48m.onrender.com/api/products/add", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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
    } finally {
      setIsLoading(false); // ✅ re-enable after response
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
              <input type="number" name="units" min="1" value={formData.units} onChange={handleChange} required />
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
              <label>Units:</label>
              <input type="number" name="units" min="1" value={formData.units} onChange={handleChange} required />
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
              <label>Units:</label>
              <input type="number" name="units" min="1" value={formData.units} onChange={handleChange} required />
            </>
          )}

          <div className="form-actions">
            <button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save"}
            </button>
            <button type="button" onClick={() => navigate(-1)} disabled={isLoading}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
