import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useNavigate } from "react-router-dom";

// Fix default marker icon bug in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
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
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!location) {
      setError("Please select a location on the map.");
      return;
    }

    const body = {
      name: warehouseName,
      latitude: location.lat,
      longitude: location.lng,
    };

    try {
      const res = await fetch("http://localhost:8080/api/warehouses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (res.ok) {
        navigate("/select-warehouse");
      } else {
        const msg = await res.text();
        setError(msg || "Failed to create warehouse");
      }
    } catch (err) {
      console.error("Network error:", err);
      setError("Network error");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Create New Warehouse</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <label>Warehouse Name:</label>
        <input
          type="text"
          value={warehouseName}
          onChange={(e) => setWarehouseName(e.target.value)}
          required
        />
        <br />
        <br />
        <label>Select Location on Map:</label>
        <div style={{ height: "400px", marginBottom: "1rem" }}>
          <MapContainer
            center={[12.8797, 121.774]} // Philippines center
            zoom={5.5}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationSelector onLocationSelect={setLocation} />
            {location && <Marker position={location} />}
          </MapContainer>
        </div>
        <button type="submit">Create Warehouse</button>
      </form>
    </div>
  );
};

export default CreateWarehousePage;
