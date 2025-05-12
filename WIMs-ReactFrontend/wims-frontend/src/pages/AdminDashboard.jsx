import React, { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { toast, ToastContainer } from "react-toastify";
import { FaSearch } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
//import "./Admindashboard.css";

const AdminDashboard = () => {
  const [logs, setLogs] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [showAll, setShowAll] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [groupId, setGroupId] = useState("");
  const [groupLogs, setGroupLogs] = useState([]);
  const [searchError, setSearchError] = useState("");

  useEffect(() => {
    fetch("https://wims-w48m.onrender.com/api/admin/logs", {
      method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
    })
      .then((res) => res.json())
      .then((data) => setLogs(data.logs))
      .catch((err) => console.error("Failed to load admin logs", err));
  }, []);

  const toggleExpand = (logId) => {
    setExpanded((prev) => ({ ...prev, [logId]: !prev[logId] }));
  };

  const formatDate = (dateTimeStr) => new Date(dateTimeStr).toLocaleString();

  const handleSearch = async () => {
    try {
      const res = await fetch(`https://wims-w48m.onrender.com/api/logs/group/${encodeURIComponent(groupId)}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Group ID not found");
      const log = await res.json();

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
      <div className="dashboard-container">
        <div className="top-bar">
          <div className="left">Admin Dashboard</div>
          <div className="center">
            {new Date().toLocaleDateString()} • {new Date().toLocaleTimeString()}
          </div>
          <div className="right">
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
                <th>Units</th>
              </tr>
            </thead>
            <tbody>
              {(showAll ? logs : logs.slice(0, 10)).map((log) => (
                <React.Fragment key={log.id}>
                  <tr>
                    <td style={{ textAlign: "center" }}>
                      {log.groupId && (
                        <button className="toggle-btn" onClick={() => toggleExpand(log.id)}>☰</button>
                      )}
                    </td>
                    <td>{formatDate(log.dateTime)}</td>
                    <td>{log.username}</td>
                    <td className={`action-cell ${log.action.toLowerCase()}`}>{log.action}</td>
                    <td>{log.item?.split(" (")[0]}</td>
                    <td>{log.warehouse}</td>
                    <td>{log.location}</td>
                    <td>{log.units ?? "—"}</td>
                  </tr>
                  {expanded[log.id] && log.groupId && (
                    <tr>
                      <td colSpan="8">
                        <div>
                          <strong>Group ID:</strong> {log.groupId}
                          <ul>
                            {log.relatedLogs?.length ? (
                              log.relatedLogs.map((rLog) => (
                                <li key={rLog.id}>
                                  {formatDate(rLog.dateTime)} - {rLog.action} by {rLog.username}
                                  {rLog.action === "Move"
                                    ? ` (Moved ${rLog.units} units from ${rLog.previousLocation ?? "?"} → ${rLog.location}${rLog.groupId !== log.groupId ? `, New ID: ${rLog.groupId}` : ""})`
                                    : rLog.action === "Removed"
                                      ? ` (Removed ${rLog.units} units${rLog.remainingUnits != null ? `, ${rLog.remainingUnits} left` : ""})`
                                      : ` (Item: ${rLog.item}, Location: ${rLog.location}, Units: ${rLog.units})`
                                  }
                                </li>
                              ))
                            ) : (
                              <li>No related transactions found.</li>
                            )}
                          </ul>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>

          {logs.length > 10 && (
            <div style={{ textAlign: "center", marginTop: "1rem" }}>
              <button className="brown-btn" onClick={() => setShowAll((prev) => !prev)}>
                {showAll ? "Show Less" : "Show All"}
              </button>
            </div>
          )}
        </div>

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
                        [{formatDate(log.dateTime)}] {log.username} - {log.action} - {log.item} at {log.location} ({log.units} units)
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </DashboardLayout>
  );
};

export default AdminDashboard;
