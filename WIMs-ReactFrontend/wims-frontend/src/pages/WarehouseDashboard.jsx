import React, { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import SockJS from "sockjs-client";
import { FaSortUp, FaSortDown } from "react-icons/fa";
import { Client } from "@stomp/stompjs";
import "react-toastify/dist/ReactToastify.css";
import "./WarehouseDashboard.css";

const WarehouseDashboard = () => {
  const { warehouseId } = useParams();
  const [logs, setLogs] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showAll, setShowAll] = useState(false);
  const [sortField, setSortField] = useState("dateTime");
  const [sortAsc, setSortAsc] = useState(false);

  const renderSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortAsc ? <FaSortUp /> : <FaSortDown />;
  };

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
      } else if (sortField === "units") {
        valA = parseFloat(valA ?? 0);
        valB = parseFloat(valB ?? 0);
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

  return (
    <DashboardLayout>
      <div className="dashboard-container">
        <div className="top-bar">
          <div className="left">Warehouse: {warehouseId}</div>
          <div className="center">
            {currentTime.toLocaleDateString()} • {currentTime.toLocaleTimeString()}
          </div>
        </div>

        <div className="content">
          <h2>Recent Logs</h2>
          <table className="dashboard-table">
            <thead>
              <tr>
                <th></th>
                <th onClick={() => toggleSort("dateTime")}>Date {renderSortIcon("dateTime")}</th>
                <th onClick={() => toggleSort("username")}>User {renderSortIcon("username")}</th>
                <th onClick={() => toggleSort("action")}>Action {renderSortIcon("action")}</th>
                <th onClick={() => toggleSort("item")}>Item {renderSortIcon("item")}</th>
                <th onClick={() => toggleSort("location")}>Location {renderSortIcon("location")}</th>
                <th onClick={() => toggleSort("units")}>Units {renderSortIcon("units")}</th>
              </tr>
            </thead>
            <tbody>
              {getSortedLogs().map((log) => (
                <React.Fragment key={log.id}>
                  <tr>
                    <td>
                      {log.groupId && (
                        <button className="toggle-btn" onClick={() => toggleExpand(log.id)}>☰</button>
                      )}
                    </td>
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

        <ToastContainer position="bottom-right" autoClose={3000} />
      </div>
    </DashboardLayout>
  );
};

export default WarehouseDashboard;
