import React, { useEffect, useState } from "react";
import { FaBars, FaSearch } from "react-icons/fa";
import "./AdminProductMasterlist.css";

const AdminProductMasterlist = () => {
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [activeWarehouses, setActiveWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState("All");
  const [expandedGroupId, setExpandedGroupId] = useState(null);
  const [logs, setLogs] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState(null);

  useEffect(() => {
    fetch("https://wims-w48m.onrender.com/api/warehouses", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        const names = data.map((w) => w.name);
        const active = data.filter((w) => w.active).map((w) => w.name);
        setWarehouses(names);
        setActiveWarehouses(active);
      })
      .catch((err) => console.error("Failed to load warehouses", err));
  }, []);

  useEffect(() => {
    const url =
      selectedWarehouse === "All"
        ? "https://wims-w48m.onrender.com/api/products/all"
        : `https://wims-w48m.onrender.com/api/products/by-warehouse?name=${selectedWarehouse}`;

    fetch(url, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        const filtered = data.filter(
          (p) => p.units > 0 && activeWarehouses.includes(p.warehouse)
        );
        setProducts(filtered);
      })
      .catch((err) => console.error("Failed to load products", err));
  }, [selectedWarehouse, activeWarehouses]);

  const toggleExpand = async (groupId) => {
    if (expandedGroupId === groupId) {
      setExpandedGroupId(null);
    } else {
      if (!logs[groupId]) {
        try {
          const res = await fetch(
            `https://wims-w48m.onrender.com/api/logs/group/${groupId}`,
            { credentials: "include" }
          );
          const data = await res.json();
          setLogs((prev) => ({ ...prev, [groupId]: data }));
        } catch (err) {
          console.error("Failed to load logs", err);
        }
      }
      setExpandedGroupId(groupId);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    try {
      const res = await fetch(
        `https://wims-w48m.onrender.com/api/logs/group/${searchTerm.trim()}`,
        { credentials: "include" }
      );
      const data = await res.json();
      setSearchResults(data);
      setExpandedGroupId(searchTerm.trim());
    } catch (err) {
      console.error("Search failed", err);
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
          {warehouses.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>

        <div className="search-container">
          <input
            type="text"
            placeholder="Search Group ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button onClick={handleSearch}>
            <FaSearch />
          </button>
        </div>
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
          {searchResults ? (
            <tr>
              <td></td>
              <td>{searchResults.groupId}</td>
              <td>{searchResults.item}</td>
              <td style={{ color: "green" }}>{searchResults.warehouse}</td>
              <td>{searchResults.currentLocation}</td>
              <td>{searchResults.units}</td>
            </tr>
          ) : (
            products.map((p) => (
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
                        {logs[p.groupId].map((log) => (
                          <li key={log.id}>
                            {log.action} {log.units} unit(s) on{" "}
                            {new Date(log.dateTime).toLocaleString()} by{" "}
                            {log.username}
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminProductMasterlist;
