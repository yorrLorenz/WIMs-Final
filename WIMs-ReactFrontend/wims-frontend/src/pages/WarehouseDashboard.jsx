import React, { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./WarehouseDashboard.css";

const WarehouseDashboard = () => {
  const { warehouseId } = useParams();
  const [logs, setLogs] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    action: "Restocked",
    item: "",
    location: "",
    groupId: "",
  });
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetch(
      `http://localhost:8080/api/dashboard/${encodeURIComponent(warehouseId)}`,
      { credentials: "include" }
    )
      .then((res) => res.json())
      .then((data) => setLogs(data.logs))
      .catch((err) => console.error(err));
  }, [warehouseId]);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleExpand = (logId) => {
    setExpanded((prev) => ({ ...prev, [logId]: !prev[logId] }));
  };

  const getModalTitle = () => {
    if (formData.action === "Restocked") return "Add Product";
    if (formData.action === "Removed") return "Remove Product";
    if (formData.action === "Move") return "Move Product";
    return "Transaction";
  };

  const validateForm = () => {
    if (formData.action === "Restocked") {
      return formData.item && formData.location;
    } else if (formData.action === "Removed") {
      return formData.groupId;
    } else if (formData.action === "Move") {
      return formData.groupId && formData.location;
    }
    return true;
  };

  return (
    <DashboardLayout>
      <div className="dashboard-container">
        <div className="top-bar">
          <div className="left">Warehouse: {warehouseId}</div>
          <div className="center">
            {currentTime.toLocaleDateString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
            })}{" "}
            • {currentTime.toLocaleTimeString()}
          </div>
          <button className="add-product-btn" onClick={() => setShowAddModal(true)}>
            +
          </button>
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
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <React.Fragment key={log.id}>
                  <tr>
                    <td>
                      {log.groupId && (
                        <button
                          className="expand-btn"
                          onClick={() => toggleExpand(log.id)}
                        >
                          ☰
                        </button>
                      )}
                    </td>
                    <td>{new Date(log.dateTime).toLocaleString()}</td>
                    <td>{log.username}</td>
                    <td className={`action-cell ${log.action.toLowerCase()}`}>
                      {log.action === "Restocked"
                        ? "Restocked"
                        : log.action === "Removed"
                        ? "Removed"
                        : log.action === "Move"
                        ? "Moved"
                        : log.action}
                    </td>
                    <td>{log.item}</td>
                    <td>{log.location}</td>
                  </tr>
                  {expanded[log.id] && log.groupId && (
                    <tr>
                      <td colSpan="6">
                        <div className="related-logs">
                          <strong>Group ID:</strong> {log.groupId}
                          <ul>
                            {log.relatedLogs?.length ? (
                              log.relatedLogs.map((rLog) => (
                                <li key={rLog.id}>
                                  {new Date(rLog.dateTime).toLocaleString()} -{" "}
                                  {rLog.action} by {rLog.username} (Item: {rLog.item}, Location:{" "}
                                  {rLog.location})
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
        </div>

        {showAddModal && (
          <div className="modal">
            <div className="modal-content">
              <h3 style={{ marginTop: 0, marginBottom: "1rem", color: "#432e1b" }}>
                {getModalTitle()}
              </h3>

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
                  <input
                    name="item"
                    value={formData.item}
                    onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                  />
                  <label>Location:</label>
                  <input
                    name="location"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                  />
                </>
              )}

              {(formData.action === "Removed" || formData.action === "Move") && (
                <>
                  <label>Group ID:</label>
                  <input
                    name="groupId"
                    value={formData.groupId}
                    onChange={async (e) => {
                      const groupId = e.target.value;
                      setFormData({ ...formData, groupId });

                      try {
                        const res = await fetch(
                          `http://localhost:8080/api/logs/group/${groupId}`,
                          { credentials: "include" }
                        );
                        if (res.ok) {
                          const data = await res.json();
                          setFormData((prev) => ({
                            ...prev,
                            item: data.item,
                            location:
                              formData.action === "Removed" ? data.location : "",
                          }));
                        }
                      } catch (err) {
                        toast.error("Failed to fetch group data");
                      }
                    }}
                  />
                  <label>Item:</label>
                  <input name="item" value={formData.item} readOnly />
                  <label>
                    {formData.action === "Removed" ? "Location:" : "New Location:"}
                  </label>
                  <input
                    name="location"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    readOnly={formData.action === "Removed"}
                  />
                </>
              )}

              <button
                onClick={async () => {
                  if (!validateForm()) {
                    toast.error("Please complete all required fields.");
                    return;
                  }

                  try {
                    const username = localStorage.getItem("username");
                    const payload = {
                      ...formData,
                      warehouse: warehouseId,
                      username,
                    };

                    const res = await fetch(
                      "http://localhost:8080/api/products/add",
                      {
                        method: "POST",
                        credentials: "include",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify(payload),
                      }
                    );

                    if (res.ok) {
                      setShowAddModal(false);
                      setFormData({
                        action: "Restocked",
                        item: "",
                        location: "",
                        groupId: "",
                      });
                      toast.success("Transaction added successfully!");
                      window.location.reload();
                    } else {
                      const text = await res.text();
                      toast.error("Failed to add product: " + text);
                    }
                  } catch (err) {
                    toast.error("Submit error occurred");
                  }
                }}
              >
                Submit
              </button>
              <button onClick={() => setShowAddModal(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>

      <ToastContainer position="bottom-right" autoClose={3000} />
    </DashboardLayout>
  );
};

export default WarehouseDashboard;
