import React, { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import "./AdminDashboard.css";
import { FaSearch } from "react-icons/fa";


const AdminDashboard = () => {
  const [logs, setLogs] = useState([]);
  const [expandedRows, setExpandedRows] = useState([]);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [groupId, setGroupId] = useState("");
  const [groupLogs, setGroupLogs] = useState([]);
  const [searchError, setSearchError] = useState("");

  useEffect(() => {
    fetch("http://localhost:8080/api/admin/logs", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setLogs(data.logs))
      .catch((err) => console.error("Failed to load admin logs", err));
  }, []);

  const toggleRow = (logId) => {
    setExpandedRows((prev) =>
      prev.includes(logId) ? prev.filter((id) => id !== logId) : [...prev, logId]
    );
  };

  const formatDate = (dateTimeStr) => new Date(dateTimeStr).toLocaleString();

  const getActionClass = (action) => {
    const lower = action.toLowerCase();
    if (lower === "restocked") return "restocked";
    if (lower === "removed") return "removed";
    if (lower === "move") return "move";
    return "";
  };

  const handleSearch = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/logs/group/${encodeURIComponent(groupId)}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Group ID not found");
      const log = await res.json();

      // Fetch all logs with same groupId
      const related = logs.filter(l => l.groupId === log.groupId);
      setGroupLogs(related);
      setSearchError("");
    } catch (err) {
      setSearchError("No logs found for this Group ID.");
      setGroupLogs([]);
    }
  };

  return (
    <DashboardLayout>
      <div className="admin-dashboard-container">
        <div className="top-bar">
          <div className="top-left">Admin Dashboard</div>
          <div className="top-center">
            <div id="time">{new Date().toLocaleTimeString()}</div>
            <div id="date">{new Date().toLocaleDateString()}</div>
          </div>
          <div className="top-right">
<button className="search-btn" onClick={() => setShowSearchModal(true)}>
  <FaSearch />
</button>
          </div>
        </div>

        <div className="content">
          <h2>All Warehouse Logs</h2>
          <table className="dashboard-table">
            <thead>
              <tr>
                <th></th>
                <th>Date</th>
                <th>User</th>
                <th>Action</th>
                <th>Item</th>
                <th>Warehouse</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <React.Fragment key={log.id}>
                  <tr>
                    <td style={{ textAlign: "center" }}>
                      <button className="toggle-btn" onClick={() => toggleRow(log.id)}>☰</button>
                    </td>
                    <td>{formatDate(log.dateTime)}</td>
                    <td>{log.username}</td>
                    <td className={getActionClass(log.action)}>{log.action}</td>
                    <td>{log.item}</td>
                    <td>{log.warehouse}</td>
                    <td>{log.location}</td>
                  </tr>
                  {log.relatedLogs && expandedRows.includes(log.id) && (
                    <tr>
  <td colSpan="7">
    <div className="related-log-box">
      <strong>Group ID:</strong> {log.groupId}
      <ul>
        {log.relatedLogs.map((relLog) => (
          <li key={relLog.id}>
            {relLog.action} on {formatDate(relLog.dateTime)} by {relLog.username}
          </li>
        ))}
      </ul>
    </div>
  </td>
</tr>

                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showSearchModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Search Logs by Group ID</h3>
              <input
                type="text"
                placeholder="Enter Group ID"
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
              />
              <button onClick={handleSearch}>Search</button>
              <button className="close-btn" onClick={() => setShowSearchModal(false)}>Close</button>

              {searchError && <p className="error-text">{searchError}</p>}

              {groupLogs.length > 0 && (
                <div className="search-results">
                  <h4>Related Logs</h4>
                  <ul>
                    {groupLogs.map(log => (
                      <li key={log.id}>
                        [{formatDate(log.dateTime)}] {log.username} - {log.action} - {log.item} at {log.location}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
