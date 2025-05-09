// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import "./WarehouseDashboard.css";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [logs, setLogs] = useState([]);
  const [clock, setClock] = useState(new Date().toLocaleString());
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setClock(new Date().toLocaleString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
  fetch("http://localhost:8080/api/admin/logs", {
    credentials: "include",
  })
    .then((res) => res.json())
    .then((data) => setLogs(data.logs || []))
    .catch((err) => {
      console.error("❌ Error fetching admin dashboard data:", err);
      setLogs([]);
    });
}, []);


  const handleLogout = () => {
    localStorage.clear(); // or remove specific keys
    navigate("/");
  };
  

  return (
    <DashboardLayout>
      <div className="dashboard-container">
        <div className="top-bar">
          <div className="left">Admin Dashboard</div>
          <div className="center">{clock}</div>
          <div className="right">
            
          </div>
        </div>

        <div className="content">
          <h2>All Logs from All Warehouses</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>User</th>
                <th>Action</th>
                <th>Item</th>
                <th>Warehouse</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              {logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td>{new Date(log.dateTime).toLocaleString()}</td>
                    <td>{log.username}</td>
                    <td>{log.action}</td>
                    <td>{log.item}</td>
                    <td>{log.warehouse}</td>
                    <td>{log.location}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center" }}>
                    No logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
