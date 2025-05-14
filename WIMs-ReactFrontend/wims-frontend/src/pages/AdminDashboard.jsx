import React, { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { toast, ToastContainer } from "react-toastify";
import { FaSearch } from "react-icons/fa";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import "react-toastify/dist/ReactToastify.css";
import "./AdminDashboardd.css";

const AdminDashboard = () => {
  const [logs, setLogs] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [showAll, setShowAll] = useState(false);

  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchMode, setSearchMode] = useState("group");
  const [groupId, setGroupId] = useState("");
  const [userId, setUserId] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchError, setSearchError] = useState("");

  // Initial fetch
  useEffect(() => {
    fetch("https://wims-w48m.onrender.com/api/admin/logs", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setLogs(data.logs))
      .catch((err) => console.error("Failed to load admin logs", err));
  }, []);

  // WebSocket listener for all logs
  useEffect(() => {
    const socket = new SockJS("https://wims-w48m.onrender.com/ws");
    const stompClient = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        stompClient.subscribe("/topic/logs/admin", (message) => {
          const newLog = JSON.parse(message.body);
          setLogs((prevLogs) => [newLog, ...prevLogs]);
        });
      },
      onStompError: (frame) => {
        console.error("WebSocket error", frame);
      },
    });

    stompClient.activate();
    return () => {
      stompClient.deactivate();
    };
  }, []);

  const toggleExpand = (logId) => {
    setExpanded((prev) => ({ ...prev, [logId]: !prev[logId] }));
  };

  const formatDate = (dateTimeStr) => new Date(dateTimeStr).toLocaleString();

  const handleSearch = async () => {
    setSearchError("");
    try {
      const url =
        searchMode === "group"
          ? `https://wims-w48m.onrender.com/api/logs/group/${encodeURIComponent(groupId)}`
          : `https://wims-w48m.onrender.com/api/accounts/logs/by-userid/${userId}`;

      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Search failed");

      const result = await res.json();
      const logsArray = Array.isArray(result) ? result : [result];
      if (!logsArray.length) throw new Error("No logs found");

      setSearchResults(logsArray);
    } catch (err) {
      setSearchError(
        "No logs found for this " + (searchMode === "group" ? "Group ID." : "User ID.")
      );
      setSearchResults([]);
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
                        <button className="toggle-btn" onClick={() => toggleExpand(log.id)}>
                          ☰
                        </button>
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
                                    : ` (Item: ${rLog.item}, Location: ${rLog.location}, Units: ${rLog.units})`}
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
              <h3>Search Logs</h3>

<label htmlFor="searchType">Search by:</label>
<select
  id="searchType"
  value={searchMode}
  onChange={(e) => setSearchMode(e.target.value)}
  style={{
    marginBottom: "1rem",
    padding: "0.5rem",
    border: "1px solid #ccc",
    borderRadius: "6px",
    width: "100%",
  }}
>
  <option value="group">Group ID</option>
  <option value="user">User ID</option>
</select>

<input
  type={searchMode === "group" ? "text" : "number"}
  placeholder={`Enter ${searchMode === "group" ? "Group ID" : "User ID"}`}
  value={searchMode === "group" ? groupId : userId}
  onChange={(e) =>
    searchMode === "group" ? setGroupId(e.target.value) : setUserId(e.target.value)
  }
  style={{
    marginBottom: "1rem",
    padding: "0.5rem",
    border: "1px solid #ccc",
    borderRadius: "6px",
    width: "100%",
  }}
/>

<button onClick={handleSearch} className="brown-btn" style={{ marginBottom: "0.5rem" }}>
  Search
</button>
<button className="close-btn" onClick={() => setShowSearchModal(false)}>
  Close
</button>

{searchError && <p className="error-text">{searchError}</p>}


              {searchResults.length > 0 && (
                <div className="search-results">
                  <h4>Search Results</h4>
                  <ul>
                    {searchResults.map((log) => (
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
