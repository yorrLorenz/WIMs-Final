import React, { useEffect, useState } from "react";

const MyLogs = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetch("https://wims-w48m.onrender.com/api/accounts/my-logs", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" }
      
    })
      .then((res) => res.json())
      .then((data) => {
        setLogs(data.logs || data || []);
      })
      .catch((err) => console.error("Failed to fetch logs:", err));
  }, []);

  return (
    <div className="p-4">
      <h3 className="text-xl font-bold mb-4">My Logs</h3>
      {logs.length > 0 ? (
        <div className="space-y-2">
          {logs.map((log) => (
            <div
              key={log.id}
              className="border rounded p-3 shadow-sm bg-white"
            >
              <p><strong>Date:</strong> {new Date(log.dateTime).toLocaleString("en-PH", { timeZone: "Asia/Manila" })}</p>
              <p><strong>Item:</strong> {log.item}</p>
              <p><strong>Action:</strong> {log.action}</p>
              <p><strong>Location:</strong> {log.location}</p>
              <p><strong>Warehouse:</strong> {log.warehouse}</p>
              <p><strong>Units:</strong> {log.units ?? "—"}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No logs found.</p>
      )}
    </div>
  );
};

export default MyLogs;
