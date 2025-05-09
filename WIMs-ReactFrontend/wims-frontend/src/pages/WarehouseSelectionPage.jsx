import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet icon path issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

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

  const handleWarehouseClick = (name) => {
    navigate(`/warehouse/${encodeURIComponent(name)}`);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleCreateWarehouse = () => {
    navigate("/create-warehouse");
  };

  const handleCreateAccount = () => {
    navigate("/create-account");
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Select a Warehouse</h2>

      <div style={{ height: "500px", marginBottom: "1.5rem" }}>
        <MapContainer
          center={[12.8797, 121.774]}
          zoom={5.5}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {warehouses.map((wh, idx) => (
            <Marker
              key={idx}
              position={[wh.latitude, wh.longitude]}
              eventHandlers={{
                click: () => handleWarehouseClick(wh.name),
              }}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent={false}>
                {wh.name}
              </Tooltip>
              <Popup>
                <strong>{wh.name}</strong><br />
                Click to open
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <button onClick={handleCreateWarehouse}>Create Warehouse</button>
        <button onClick={handleCreateAccount}>Create Account</button>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
};

export default WarehouseSelectionPage;
