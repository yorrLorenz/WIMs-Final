import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useNavigate } from "react-router-dom";
import "./CreateWarehousePage.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Fix default marker icon bug
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const LocationSelector = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng);
    },
  });
  return null;
};

const CreateWarehousePage = () => {
  const [warehouseName, setWarehouseName] = useState("");
  const [location, setLocation] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedName = warehouseName.trim();
    if (trimmedName === "") {
      toast.error("Warehouse name cannot be empty.");
      return;
    }

    if (!location) {
      toast.error("Please select a location.");
      return;
    }

    const body = {
      name: trimmedName,
      latitude: location.lat,
      longitude: location.lng,
    };

    try {
      const res = await fetch("https://wims-w48m.onrender.com/api/warehouses", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.status === 409) {
        toast.error("Warehouse name already exists.");
      } else if (res.ok) {
        toast.success("Warehouse created successfully!");
        setTimeout(() => {
          navigate("/select-warehouse");
        }, 1000);
      } else {
        toast.error("Failed to create warehouse.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error.");
    }
  };

  return (
    <div className="simple-create-container">
      <h2 className="simple-title">Create Warehouse</h2>

      <div className="simple-map">
        <MapContainer center={[12.8797, 121.774]} zoom={6} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationSelector onLocationSelect={setLocation} />
          {location && <Marker position={location} />}
        </MapContainer>
      </div>

      <form onSubmit={handleSubmit} className="simple-form">
        <input
          type="text"
          placeholder="Warehouse Name"
          value={warehouseName}
          onChange={(e) => setWarehouseName(e.target.value)}
          required
        />

        <button type="submit" className="brown-btn">Create</button>
        <button type="button" className="brown-btn back" onClick={() => navigate("/select-warehouse")}>
          ← Back
        </button>
      </form>
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
};

export default CreateWarehousePage;
