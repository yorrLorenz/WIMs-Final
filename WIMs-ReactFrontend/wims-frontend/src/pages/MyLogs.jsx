import React, { useEffect, useState } from "react";

const MyLogs = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetch("https://wims-w48m.onrender.com/api/accounts/my-logs", {
      method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
    })
      .then((res) => res.json())
      .then((data) => setLogs(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="p-4">
      <h3 className="text-xl font-bold mb-4">My Logs</h3>
      <div className="space-y-2">
        {logs.map((log) => (
          <div
            key={log.id}
            className="border rounded p-3 shadow-sm bg-white"
          >
            <p><strong>Date:</strong> {new Date(log.dateTime).toLocaleString()}</p>
            <p><strong>Item:</strong> {log.item}</p>
            <p><strong>Action:</strong> {log.action}</p>
            <p><strong>Location:</strong> {log.location}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyLogs;
