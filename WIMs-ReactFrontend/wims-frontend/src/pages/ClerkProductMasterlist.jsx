import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FaBars, FaSearch, FaSortAlphaDown, FaSortAlphaUp } from "react-icons/fa";
import "./AdminProductMasterlist.css";

const ClerkProductMasterlist = () => {
  const { warehouseId } = useParams();
  const [products, setProducts] = useState([]);
  const [logs, setLogs] = useState({});
  const [expandedGroupId, setExpandedGroupId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    fetch(`https://wims-w48m.onrender.com/api/products/by-warehouse?name=${warehouseId}`, {
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => {
        let filtered = data.filter(
          p =>
            p.units > 0 &&
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
      .catch(err => console.error("Failed to load products", err));
  }, [warehouseId, searchTerm, sortField, sortAsc]);

  const toggleExpand = async (groupId) => {
    if (expandedGroupId === groupId) {
      setExpandedGroupId(null);
    } else {
      if (!logs[groupId]) {
        const res = await fetch(
          `https://wims-w48m.onrender.com/api/logs/group/${groupId}`,
          { credentials: "include" }
        );
        const data = await res.json();
        setLogs(prev => ({ ...prev, [groupId]: data }));
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
      <h2 className="masterlist-title">My Warehouse Products</h2>

      <div className="search-container" style={{ marginBottom: "1rem" }}>
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

      <table className="masterlist-table">
        <thead>
          <tr>
            <th></th>
            <th onClick={() => toggleSort("groupId")}>Group ID {sortField === "groupId" && (sortAsc ? <FaSortAlphaDown /> : <FaSortAlphaUp />)}</th>
            <th onClick={() => toggleSort("item")}>Item {sortField === "item" && (sortAsc ? <FaSortAlphaDown /> : <FaSortAlphaUp />)}</th>
            <th>Warehouse</th>
            <th onClick={() => toggleSort("currentLocation")}>Location {sortField === "currentLocation" && (sortAsc ? <FaSortAlphaDown /> : <FaSortAlphaUp />)}</th>
            <th onClick={() => toggleSort("units")}>Units {sortField === "units" && (sortAsc ? <FaSortAlphaDown /> : <FaSortAlphaUp />)}</th>
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
                          {new Date(log.dateTime).toLocaleString("en-PH", { timeZone: "Asia/Manila" })} by{" "}
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

export default ClerkProductMasterlist;
