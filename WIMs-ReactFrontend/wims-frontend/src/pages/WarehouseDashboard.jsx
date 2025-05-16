import React, { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import "react-toastify/dist/ReactToastify.css";
import "./WarehouseDashboard.css";

const WarehouseDashboard = () => {
  const { warehouseId } = useParams();
  const [logs, setLogs] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showAll, setShowAll] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // ✅ added

  const [formData, setFormData] = useState({
    action: "Restocked",
    item: "",
    location: "",
    groupId: "",
    units: 1,
  });

  useEffect(() => {
    fetchLogs();
  }, [warehouseId]);

  const fetchLogs = () => {
    fetch(`https://wims-w48m.onrender.com/api/dashboard/${encodeURIComponent(warehouseId)}`, {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load dashboard");
        return res.json();
      })
      .then((data) => setLogs(data.logs || []))
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load dashboard.");
        setLogs([]);
      });
  };

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const socket = new SockJS("https://wims-w48m.onrender.com/ws");
    const stompClient = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        stompClient.subscribe(`/topic/logs/${warehouseId}`, (message) => {
          const newLog = JSON.parse(message.body);
          setLogs((prevLogs) => [newLog, ...prevLogs]);
        });
      },
      onStompError: (frame) => {
        console.error("WebSocket error", frame);
      },
    });

    stompClient.activate();
    return () => stompClient.deactivate();
  }, [warehouseId]);

  const toggleExpand = (logId) => {
    setExpanded((prev) => ({ ...prev, [logId]: !prev[logId] }));
  };

  const getModalTitle = () => {
    switch (formData.action) {
      case "Restocked": return "Add Product";
      case "Removed": return "Remove Product";
      case "Move": return "Move Product";
      default: return "Transaction";
    }
  };

  const validateForm = () => {
    if (formData.action === "Restocked")
      return formData.item && formData.location && formData.units > 0;
    if (formData.action === "Removed")
      return formData.groupId && formData.units > 0;
    if (formData.action === "Move")
      return formData.groupId && formData.location && formData.units > 0;
    return true;
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    if (!validateForm()) {
      toast.error("Please complete all required fields.");
      return;
    }

    setIsSubmitting(true); // ✅ lock buttons

    try {
      const username = localStorage.getItem("username");
      const payload = { ...formData, warehouse: warehouseId, username };

      const res = await fetch("https://wims-w48m.onrender.com/api/products/add", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowAddModal(false);
        setFormData({ action: "Restocked", item: "", location: "", groupId: "", units: 1 });
        toast.success("Transaction added!");
      } else {
        const text = await res.text();
        toast.error("Failed to add: " + text);
      }
    } catch {
      toast.error("Network error.");
    } finally {
      setIsSubmitting(false); // ✅ unlock
    }
  };

  return (
    <DashboardLayout>
      <div className="dashboard-container">
        <div className="top-bar">
          <div className="left">Warehouse: {warehouseId}</div>
          <div className="center">
            {currentTime.toLocaleDateString()} • {currentTime.toLocaleTimeString()}
          </div>
          <button className="add-product-btn" onClick={() => setShowAddModal(true)}>+</button>
        </div>

        <div className="content">
          <h2>Recent Logs</h2>
          <table className="dashboard-table">
            <thead>
              <tr>
                <th></th>
                <th>Date</th>
                <th>User</th>
                <th>Action</th>
                <th>Item</th>
                <th>Location</th>
                <th>Units</th>
              </tr>
            </thead>
            <tbody>
              {(showAll ? logs : logs.slice(0, 10)).map((log) => (
                <React.Fragment key={log.id}>
                  <tr>
                    <td>{log.groupId && <button className="toggle-btn" onClick={() => toggleExpand(log.id)}>☰</button>}</td>
                    <td>{new Date(log.dateTime).toLocaleString()}</td>
                    <td>{log.username}</td>
                    <td className={`action-cell ${log.action.toLowerCase()}`}>{log.action}</td>
                    <td>{log.item?.split(" (")[0] || "—"}</td>
                    <td>{log.location}</td>
                    <td>{log.units ?? "—"}</td>
                  </tr>
                  {expanded[log.id] && log.groupId && (
                    <tr>
                      <td colSpan="7">
                        <div>
                          <strong>Group ID:</strong> {log.groupId}
                          <ul>
                            {log.relatedLogs?.length ? (
                              log.relatedLogs.map((rLog) => (
                                <li key={rLog.id}>
                                  {new Date(rLog.dateTime).toLocaleString()} - {rLog.action} by {rLog.username}
                                  {rLog.action === "Move"
                                    ? ` (${rLog.units} units moved from ${rLog.previousLocation ?? "?"} → ${rLog.location}${rLog.groupId !== log.groupId ? `, New ID: ${rLog.groupId}` : ""})`
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
              <button onClick={() => setShowAll((prev) => !prev)} className="brown-btn">
                {showAll ? "Show Less" : "Show All"}
              </button>
            </div>
          )}
        </div>

        {showAddModal && (
          <div className="modal">
            <div className="modal-content">
              <h3>{getModalTitle()}</h3>

              <label>Action:</label>
              <select
                name="action"
                value={formData.action}
                onChange={(e) => setFormData({ ...formData, action: e.target.value })}
              >
                <option value="Restocked">Restock</option>
                <option value="Removed">Remove</option>
                <option value="Move">Move</option>
              </select>

              {formData.action === "Restocked" && (
                <>
                  <label>Item:</label>
                  <input name="item" value={formData.item} onChange={(e) => setFormData({ ...formData, item: e.target.value })} />
                  <label>Location:</label>
                  <input name="location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
                  <label>Units:</label>
                  <input type="number" name="units" min="1" value={formData.units} onChange={(e) => setFormData({ ...formData, units: parseInt(e.target.value) || 1 })} />
                </>
              )}

              {(formData.action === "Removed" || formData.action === "Move") && (
                <>
                  <label>Group ID:</label>
                  <input
                    name="groupId"
                    value={formData.groupId}
                    onChange={async (e) => {
                      const groupId = e.target.value.trim();
                      setFormData((prev) => ({ ...prev, groupId }));

                      if (!groupId) {
                        toast.error("Group ID cannot be empty");
                        return;
                      }

                      try {
                        const res = await fetch(`https://wims-w48m.onrender.com/api/logs/group/${groupId}`, {
                          method: "GET",
                          credentials: "include",
                          headers: { "Content-Type": "application/json" },
                        });

                        const result = await res.json();
                        const logs = Array.isArray(result) ? result : [result];

                        if (!res.ok || !logs.length) {
                          toast.error("Invalid Group ID");
                          return;
                        }

                        logs.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));
                        const latestValid = logs.find((log) => log.action !== "Removed");

                        if (!latestValid) {
                          toast.error("All units already removed for this Group ID.");
                          return;
                        }

                        const maxUnits = latestValid.units || 1;

                        setFormData((prev) => ({
                          ...prev,
                          item: latestValid.item.split(" (")[0],
                          location: prev.action === "Removed" ? latestValid.location : "",
                          units: maxUnits,
                        }));
                      } catch (err) {
                        console.error("Error fetching logs:", err);
                        toast.error("Failed to fetch logs");
                      }
                    }}
                  />

                  <label>Item:</label>
                  <input name="item" value={formData.item} readOnly />

                  {formData.action === "Removed" && (
                    <>
                      <label>Units to Remove:</label>
                      <input type="number" name="units" min="1" value={formData.units} onChange={(e) => setFormData({ ...formData, units: parseInt(e.target.value) || 1 })} />
                    </>
                  )}

                  {formData.action === "Move" && (
                    <>
                      <label>New Location:</label>
                      <input name="location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
                      <label>Units to Move:</label>
                      <input type="number" name="units" min="1" value={formData.units} onChange={(e) => setFormData({ ...formData, units: parseInt(e.target.value) || 1 })} />
                    </>
                  )}
                </>
              )}

              <button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
              <button onClick={() => setShowAddModal(false)} disabled={isSubmitting}>
                Cancel
              </button>
            </div>
          </div>
        )}

        <ToastContainer position="bottom-right" autoClose={3000} />
      </div>
    </DashboardLayout>
  );
};

export default WarehouseDashboard;
