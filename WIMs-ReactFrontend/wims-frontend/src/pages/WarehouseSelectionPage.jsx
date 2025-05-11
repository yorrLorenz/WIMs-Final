import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./WarehouseSelectionPage.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Fix Leaflet icon path issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const WarehouseSelectionPage = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [confirmStep, setConfirmStep] = useState(0);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:8080/api/warehouses", { credentials: "include" })
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

  const openDeleteModal = () => {
    fetch("http://localhost:8080/api/accounts", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setAccounts(data);
        setShowModal(true);
      })
      .catch((err) => {
        console.error("Failed to load accounts", err);
      });
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedAccount(null);
    setConfirmStep(0);
  };

  const handleDelete = () => {
    if (confirmStep === 0) {
      setConfirmStep(1);
    } else {
      fetch(`http://localhost:8080/api/accounts/${selectedAccount.id}`, {
        method: "DELETE",
        credentials: "include",
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to delete");
          return res.text();
        })
        .then(() => {
          toast.success("Successfully removed account!");
          setAccounts((prev) => prev.filter((acc) => acc.id !== selectedAccount.id));
          closeModal();
        })
        .catch((err) => toast.error("Error deleting account: " + err.message));
    }
  };

  if (loading) return <p className="page-container">Loading...</p>;

  return (
    <div className="page-container">
      <ToastContainer />
      <h2 className="page-title">Select Warehouse</h2>

      <div className="map-container">
        <MapContainer center={[12.8797, 121.774]} zoom={5.5} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {warehouses.map((wh, idx) => (
            <Marker
              key={idx}
              position={[wh.latitude, wh.longitude]}
              eventHandlers={{ click: () => handleWarehouseClick(wh.name) }}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={1}>{wh.name}</Tooltip>
              <Popup><strong>{wh.name}</strong><br />Click to open</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="button-group">
        <button onClick={handleCreateWarehouse}>Create Warehouse</button>
        <button onClick={handleCreateAccount}>Create Account</button>
        <button onClick={openDeleteModal}>Remove Account</button>
        <button onClick={handleLogout}>Logout</button>
      </div>

      {showModal && (
  <div className="modal">
    <div className="modal-content">
      <h3>Remove Account</h3>

      <select
        value={selectedAccount?.id || ""}
        onChange={(e) => {
          const id = parseInt(e.target.value);
          const acc = accounts.find((a) => a.id === id);
          setSelectedAccount(acc);
          setConfirmStep(0);
        }}
      >
        <option value="">Select Account</option>
        {accounts.map((acc) => (
          <option key={acc.id} value={acc.id}>
            {acc.username} ({acc.role})
          </option>
        ))}
      </select>

      {selectedAccount ? (
        <>
          <p>Are you sure you want to remove <strong>{selectedAccount.username}</strong>?</p>
          <button onClick={handleDelete}>
            {confirmStep === 0 ? "Confirm Delete" : "Yes, Delete Permanently"}
          </button>
          <button onClick={closeModal}>Cancel</button>
        </>
      ) : (
        <button onClick={closeModal}>Cancel</button>
      )}
    </div>
  </div>
)}

    </div>
  );
};

export default WarehouseSelectionPage;
