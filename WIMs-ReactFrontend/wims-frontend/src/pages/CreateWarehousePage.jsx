import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useNavigate } from "react-router-dom";
import "./CreateWarehousePage.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const LocationSelector = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;

      // ✅ Only allow clicks within valid Earth bounds
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return;

      onLocationSelect(e.latlng);
    },
  });
  return null;
};

const CreateWarehousePage = () => {
  const [warehouseName, setWarehouseName] = useState("");
  const [location, setLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

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
      setIsLoading(true);
      const res = await fetch("https://wims-w48m.onrender.com/api/warehouses", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="simple-create-container">
      <h2 className="simple-title">Create Warehouse</h2>

      <div className="simple-map">
        <MapContainer
          center={[12.8797, 121.774]}
          zoom={5.5}
          style={{ height: "100%", width: "100%" }}
          worldCopyJump={false}
          maxBounds={[[-90, -180], [90, 180]]}
          maxBoundsViscosity={1.0}
        >
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
          disabled={isLoading}
        />

        <button type="submit" className="brown-btn" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create"}
        </button>
        <button
          type="button"
          className="brown-btn back"
          onClick={() => navigate("/select-warehouse")}
          disabled={isLoading}
        >
          ← Back
        </button>
      </form>

      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
};

export default CreateWarehousePage;
