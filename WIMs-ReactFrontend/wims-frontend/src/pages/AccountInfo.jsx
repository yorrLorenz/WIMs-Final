import React, { useEffect, useState } from "react";
import { FaUserCircle, FaRegCopy, FaSortAlphaDown, FaSortAlphaUp } from "react-icons/fa";
import { toast } from "react-toastify";
import "./AccountInfo.css";
import { FaSortUp, FaSortDown } from "react-icons/fa";


const AccountInfo = () => {
  const [user, setUser] = useState(null);
  const [logs, setLogs] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [sortField, setSortField] = useState("dateTime");
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    fetch("https://wims-w48m.onrender.com/api/accounts/me", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch((err) => console.error("Failed to fetch user", err));

    fetch("https://wims-w48m.onrender.com/api/accounts/my-logs", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setLogs(data))
      .catch((err) => console.error("Failed to fetch logs", err));
  }, []);

  const copyUserId = () => {
    navigator.clipboard.writeText(user.id);
    toast.info("User ID copied to clipboard");
  };

  const renderLogDetails = (log) => {
    if (log.action === "Move") {
      return `Moved ${log.units} units from ${log.previousLocation ?? "?"} to ${log.location}`;
    } else if (log.action === "Removed") {
      return `Removed ${log.units} units${log.remainingUnits != null ? `, ${log.remainingUnits} left` : ""}`;
    } else {
      return `Restocked ${log.units} units at ${log.location}`;
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

  const getSortedLogs = () => {
    const sorted = [...logs].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === "dateTime") {
        valA = new Date(valA);
        valB = new Date(valB);
      } else {
        valA = (valA || "").toString().toLowerCase();
        valB = (valB || "").toString().toLowerCase();
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });

    return showAll ? sorted : sorted.slice(0, 10);
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="account-container">
      <div className="account-card">
        <div className="account-header">
          <div className="profile-picture">
            {user.imageUrl ? (
              <img
                src={`https://wims-w48m.onrender.com${user.imageUrl}`}
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
            <p className="account-id">
              <strong>User ID:</strong> {user.id}
              <button onClick={copyUserId} className="copy-btn" title="Copy User ID">
                <FaRegCopy />
              </button>
            </p>
          </div>
        </div>

        <hr className="divider" />

        <h2 className="section-title">Your Activity Logs</h2>
        <div className="section-underline"></div>

        <table className="account-table">
          <thead>
            <tr>
              <th onClick={() => toggleSort("dateTime")}>
                Date {sortField === "dateTime" && (sortAsc ? <FaSortAlphaDown /> : <FaSortAlphaUp />)}
              </th>
              <th onClick={() => toggleSort("action")}>
                Action {sortField === "action" && (sortAsc ? <FaSortAlphaDown /> : <FaSortAlphaUp />)}
              </th>
              <th onClick={() => toggleSort("item")}>
                Item {sortField === "item" && (sortAsc ? <FaSortAlphaDown /> : <FaSortAlphaUp />)}
              </th>
              <th onClick={() => toggleSort("warehouse")}>
                Warehouse {sortField === "warehouse" && (sortAsc ? <FaSortAlphaDown /> : <FaSortAlphaUp />)}
              </th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {getSortedLogs().length > 0 ? (
              getSortedLogs().map((log, index) => (
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
