import React, { useEffect, useState } from "react";
import { FaUserCircle, FaList, FaEdit } from "react-icons/fa";

const AccountInfo = () => {
  const [user, setUser] = useState(null);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8080/api/accounts/me", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch((err) => console.error("Failed to fetch user", err));

    fetch("http://localhost:8080/api/accounts/my-logs", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setLogs(data))
      .catch((err) => console.error("Failed to fetch logs", err));
  }, []);

  if (!user) return <div>Loading...</div>;

  return (
    <div style={{ padding: "2rem", background: "#f2f2f2", minHeight: "100vh" }}>
      <div
        style={{
          background: "#fff",
          borderRadius: "10px",
          padding: "2rem",
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        {/* Profile Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <div
            style={{
              width: "120px",
              height: "120px",
              border: "3px solid orange",
              borderRadius: "50%",
              overflow: "hidden",
              backgroundColor: "#eee",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {user.imageUrl ? (
              <img
                src={`http://localhost:8080${user.imageUrl}`}
                alt="Profile"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <FaUserCircle style={{ fontSize: "6rem", color: "#aaa" }} />
            )}
          </div>
          <div>
            <h2 style={{ margin: 0 }}>{user.username}</h2>
            <p style={{ fontWeight: "bold", fontSize: "1.1rem" }}>
              {user.role} {user.role === "CLERK" && `| Warehouse ${user.warehouse}`}
            </p>
          </div>
        </div>

        <hr style={{ margin: "2rem 0" }} />

        {/* Recent Logs Table */}
        <h3 style={{ marginBottom: "1rem" }}>Recent Logs</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#222", color: "#2a3f54" }}>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>User</th>
                <th style={thStyle}>Action</th>
                <th style={thStyle}>Item</th>
                <th style={thStyle}>Warehouse</th>
                <th style={thStyle}>Location</th>
                <th style={thStyle}></th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => (
                <tr
                  key={index}
                  style={{
                    backgroundColor: index % 2 === 0 ? "#d7ecff" : "#eaf4ff",
                    borderBottom: "1px solid #ccc",
                  }}
                >
                  <td style={tdStyle}>
                    <FaList style={{ marginRight: "6px" }} />
                    {new Date(log.dateTime).toLocaleString()}
                  </td>
                  <td style={tdStyle}>{log.username}</td>
                  <td style={tdStyle}>{log.action}</td>
                  <td style={tdStyle}>{log.item}</td>
                  <td style={tdStyle}>{log.warehouse}</td>
                  <td style={tdStyle}>{log.location}</td>
                  <td style={tdStyle}>
                    <FaEdit style={{ cursor: "pointer" }} />
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "1rem" }}>
                    No logs available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Shared styles
const thStyle = {
  padding: "0.75rem",
  textAlign: "left",
  fontWeight: "bold",
};

const tdStyle = {
  padding: "0.75rem",
};

export default AccountInfo;
