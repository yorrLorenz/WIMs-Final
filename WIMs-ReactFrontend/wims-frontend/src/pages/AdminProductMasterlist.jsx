import React, { useEffect, useState } from "react";
import { FaBars, FaSearch, FaSortAlphaDown, FaSortAlphaUp } from "react-icons/fa";
import "./AdminProductMasterlist.css";

const AdminProductMasterlist = () => {
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState("All");
  const [expandedGroupId, setExpandedGroupId] = useState(null);
  const [logs, setLogs] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    fetch("https://wims-w48m.onrender.com/api/warehouses", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setWarehouses(data.map((w) => w.name)))
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
        let filtered = data.filter(
          (p) =>
            p.units > 0 &&
            warehouses.includes(p.warehouse) &&
            (searchTerm.trim() === "" ||
              p.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
              p.groupId.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        if (sortField) {
          filtered.sort((a, b) => {
            const valA = a[sortField];
            const valB = b[sortField];
            if (sortField === "units") {
              return sortAsc ? valA - valB : valB - valA;
            } else {
              return sortAsc
                ? valA.localeCompare(valB)
                : valB.localeCompare(valA);
            }
          });
        }

        setProducts(filtered);
      })
      .catch((err) => console.error("Failed to load products", err));
  }, [selectedWarehouse, warehouses, searchTerm, sortField, sortAsc]);

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

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
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
            placeholder="Search Item or Group ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button>
            <FaSearch />
          </button>
        </div>
      </div>

      <table className="masterlist-table">
        <thead>
          <tr>
            <th></th>
            <th onClick={() => toggleSort("groupId")}>
              Group ID {sortField === "groupId" && (sortAsc ? <FaSortAlphaDown /> : <FaSortAlphaUp />)}
            </th>
            <th onClick={() => toggleSort("item")}>
              Item {sortField === "item" && (sortAsc ? <FaSortAlphaDown /> : <FaSortAlphaUp />)}
            </th>
            <th onClick={() => toggleSort("warehouse")}>
              Warehouse {sortField === "warehouse" && (sortAsc ? <FaSortAlphaDown /> : <FaSortAlphaUp />)}
            </th>
            
            <th onClick={() => toggleSort("currentLocation")}>
              Location {sortField === "currentLocation" && (sortAsc ? <FaSortAlphaDown /> : <FaSortAlphaUp />)}
            </th>
            <th onClick={() => toggleSort("units")}>
              Units {sortField === "units" && (sortAsc ? <FaSortAlphaDown /> : <FaSortAlphaUp />)}
            </th>
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
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminProductMasterlist;
