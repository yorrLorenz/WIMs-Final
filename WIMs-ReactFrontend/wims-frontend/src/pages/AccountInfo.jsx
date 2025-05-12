import React, { useEffect, useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import "./AccountInfo.css";

const AccountInfo = () => {
  const [user, setUser] = useState(null);
  const [logs, setLogs] = useState([]);
  const [showAll, setShowAll] = useState(false); // ✅ pagination toggle

  useEffect(() => {
    fetch("http://wims-w48m.onrender.com/api/accounts/me", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch((err) => console.error("Failed to fetch user", err));

    fetch("http://wims-w48m.onrender.com/api/accounts/my-logs", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setLogs(data))
      .catch((err) => console.error("Failed to fetch logs", err));
  }, []);

  const renderLogDetails = (log) => {
    if (log.action === "Move") {
      return `Moved ${log.units} units from ${log.previousLocation ?? "?"} to ${log.location}`;
    } else if (log.action === "Removed") {
      return `Removed ${log.units} units${log.remainingUnits != null ? `, ${log.remainingUnits} left` : ""}`;
    } else {
      return `Restocked ${log.units} units at ${log.location}`;
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="account-container">
      <div className="account-card">
        {/* Header Section */}
        <div className="account-header">
          <div className="profile-picture">
            {user.imageUrl ? (
              <img
                src={`http://wims-w48m.onrender.com${user.imageUrl}`}
                alt="Profile"
              />
            ) : (
              <FaUserCircle style={{ width: "100%", height: "100%", color: "#aaa" }} />
            )}
          </div>
          <div>
            <h2 className="account-name">{user.username}</h2>
            <p className="account-role">
              {user.role}
              {user.role === "CLERK" && ` | ${user.warehouse}`}
            </p>
          </div>
        </div>

        <hr className="divider" />

        {/* Logs Section */}
        <h2 className="section-title">Your Activity Logs</h2>
        <div className="section-underline"></div>

        <table className="account-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Action</th>
              <th>Item</th>
              <th>Warehouse</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {(showAll ? logs : logs.slice(0, 10)).length > 0 ? (
              (showAll ? logs : logs.slice(0, 10)).map((log, index) => (
                <tr key={index}>
                  <td>{new Date(log.dateTime).toLocaleString()}</td>
                  <td className={log.action.toLowerCase()}>{log.action}</td>
                  <td>{log.item?.split(" (")[0]}</td>
                  <td>{log.warehouse}</td>
                  <td>{renderLogDetails(log)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "1rem" }}>
                  No logs found.
                </td>
              </tr>
            )}
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
    </div>
  );
};

export default AccountInfo;
