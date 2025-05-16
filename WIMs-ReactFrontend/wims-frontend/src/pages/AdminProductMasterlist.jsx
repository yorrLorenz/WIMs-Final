import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import "./AdminProductMasterlist.css";

const AdminProductMasterlist = () => {
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState("All");
  const [expandedGroupId, setExpandedGroupId] = useState(null);
  const [logs, setLogs] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetch("https://wims-w48m.onrender.com/api/warehouses")
      .then(res => res.json())
      .then(data => setWarehouses(data.map(w => w.name)));
  }, []);

  useEffect(() => {
    const url = selectedWarehouse === "All"
      ? "https://wims-w48m.onrender.com/api/products/all"
      : `https://wims-w48m.onrender.com/api/products/by-warehouse?name=${selectedWarehouse}`;

    fetch(url)
      .then(res => res.json())
      .then(data => setProducts(data));
  }, [selectedWarehouse]);

  const toggleExpand = async (groupId) => {
    if (expandedGroupId === groupId) {
      setExpandedGroupId(null);
    } else {
      if (!logs[groupId]) {
        const res = await fetch(`https://wims-w48m.onrender.com/api/logs/group/${groupId}`);
        const data = await res.json();
        setLogs(prev => ({ ...prev, [groupId]: data }));
      }
      setExpandedGroupId(groupId);
    }
  };

  return (
    <div className="masterlist-container">
      <h2 className="masterlist-title">All Products</h2>

      <div className="dropdown-container">
        <label>Warehouse: </label>
        <select
          value={selectedWarehouse}
          onChange={(e) => setSelectedWarehouse(e.target.value)}
        >
          <option value="All">All Warehouses</option>
          {warehouses.map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>

      <table className="masterlist-table">
        <thead>
          <tr>
            <th></th>
            <th>Group ID</th>
            <th>Item</th>
            <th>Warehouse</th>
            <th>Location</th>
            <th>Units</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <React.Fragment key={p.groupId}>
              <tr>
                <td>
                  <button onClick={() => toggleExpand(p.groupId)}>
                    <FaBars />
                  </button>
                </td>
                <td>{p.groupId}</td>
                <td>{p.item}</td>
                <td style={{ color: "green" }}>{p.warehouse}</td>
                <td>{p.currentLocation}</td>
                <td>{p.units}</td>
              </tr>
              {expandedGroupId === p.groupId && logs[p.groupId] && (
                <tr>
                  <td colSpan="6">
                    <ul>
                      {logs[p.groupId].map(log => (
                        <li key={log.id}>
                          {log.action} {log.units} unit(s) on{" "}
                          {new Date(log.dateTime).toLocaleString()} by {log.username}
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminProductMasterlist;
