import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./WarehouseDashboard.css";

const WarehouseDashboard = () => {
  const { warehouseId } = useParams();
  const navigate = useNavigate();

  const [warehouseName, setWarehouseName] = useState("Loading...");
  const [logs, setLogs] = useState([]);
  const [clock, setClock] = useState(new Date().toLocaleString());
  const [expandedRows, setExpandedRows] = useState([]);

  const handleLogout = () => {
    localStorage.clear(); // or remove specific keys
    navigate("/");
  };
  

  useEffect(() => {
    const interval = setInterval(() => {
      setClock(new Date().toLocaleString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetch(`http://localhost:8080/api/dashboard/${encodeURIComponent(warehouseId)}`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status} - ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        setWarehouseName(data.warehouseName || warehouseId);
        setLogs(data.logs || []);
      })
      .catch((err) => {
        console.error("❌ Error fetching dashboard data:", err);
      });
  }, [warehouseId]);

  const toggleExpand = (logId) => {
    setExpandedRows((prev) =>
      prev.includes(logId) ? prev.filter((id) => id !== logId) : [...prev, logId]
    );
  };

  return (
    <div className="dashboard-container">
      <div className="top-bar">
        <div className="left">Warehouse: {warehouseName}</div>
        <div className="center">{clock}</div>
        <div className="right">
          <button
            onClick={() => navigate(`/warehouse/${warehouseId}/add-product`)}
            className="add-product-btn"
          >
            + Add Product
          </button>
          
        </div>
      </div>

      <div className="content">
        <h2>Recent Logs</h2>
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Date</th>
              <th>User</th>
              <th>Action</th>
              <th>Item</th>
              <th>Location</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {logs.length > 0 ? (
              logs.map((log) => (
                <React.Fragment key={log.id}>
                  <tr>
                    <td>
                      {log.groupId &&
                        log.relatedLogs &&
                        log.relatedLogs.length > 0 && (
                          <button onClick={() => toggleExpand(log.id)}>☰</button>
                        )}
                    </td>
                    <td>{new Date(log.dateTime).toLocaleString()}</td>
                    <td>{log.username}</td>
                    <td>{log.action}</td>
                    <td>{log.item}</td>
                    <td>{log.location}</td>
                    <td>
                      <button className="edit-btn">✎</button>
                    </td>
                  </tr>

                  {expandedRows.includes(log.id) &&
                    log.relatedLogs &&
                    log.relatedLogs.length > 0 && (
                      <tr key={`related-${log.id}`}>
                        <td colSpan="7">
                          <div className="related-logs">
                            <strong>
                              Related Transactions for Group {log.groupId}:
                            </strong>
                            <ul>
                              {log.relatedLogs.map((r) => (
                                <li key={r.id}>
                                  {new Date(r.dateTime).toLocaleString()} –{" "}
                                  {r.action} by {r.username}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </td>
                      </tr>
                    )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: "center" }}>
                  No logs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WarehouseDashboard;
