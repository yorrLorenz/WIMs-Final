import React, { useState, useEffect } from "react";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";
import "./CalendarPage.css";

const CalendarPage = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [logs, setLogs] = useState([]);
  const [warehouse, setWarehouse] = useState("");
  const [showAll, setShowAll] = useState(false); // ✅ pagination toggle

  const isAdmin = new URLSearchParams(window.location.search).get("admin") === "true";

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const handleDayClick = (day) => setSelectedDate(day);
  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  useEffect(() => {
    if (!isAdmin) {
      const stored = localStorage.getItem("warehouse");
      if (stored) setWarehouse(stored);
      else console.warn("No warehouse found in localStorage.");
    }
  }, [isAdmin]);

  useEffect(() => {
    const formattedDate = format(selectedDate, "yyyy-MM-dd");
    if (!isAdmin && !warehouse) return;

    const url = isAdmin
      ? `https://wims-w48m.onrender.com/api/accounts/dashboard-by-date?date=${formattedDate}`
      : `https://wims-w48m.onrender.com/api/dashboard-by-date?date=${formattedDate}&warehouse=${encodeURIComponent(warehouse)}`;

    fetch(url, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setLogs(data.logs || []))
      .catch((err) => {
        console.error("Error loading logs", err);
        setLogs([]);
      });
  }, [selectedDate, warehouse, isAdmin]);

  const renderLogDetails = (log) => {
    if (log.action === "Move") {
      return `Moved ${log.units} units from ${log.previousLocation ?? "?"} to ${log.location}`;
    } else if (log.action === "Removed") {
      return `Removed ${log.units} units${log.remainingUnits != null ? `, ${log.remainingUnits} left` : ""}`;
    } else {
      return `Restocked ${log.units} units at ${log.location}`;
    }
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h2>{isAdmin ? "Admin Calendar" : `Warehouse: ${warehouse}`}</h2>
        <h3>{format(currentMonth, "MMMM yyyy")}</h3>
        <div>
          <button onClick={handlePrevMonth}>←</button>
          <button onClick={handleNextMonth}>→</button>
        </div>
      </div>

      <div className="calendar-grid">
        {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
          <div key={d} className="day-label">{d}</div>
        ))}
        {Array.from({ length: days[0].getDay() }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {days.map((day) => (
          <div
            key={day}
            className={`calendar-day ${isToday(day) ? "today" : ""} ${isSameDay(day, selectedDate) ? "selected" : ""}`}
            onClick={() => handleDayClick(day)}
          >
            {day.getDate()}
          </div>
        ))}
      </div>

      <div className="log-section">
        <h3 className="log-heading">Logs for {format(selectedDate, "PPP")}</h3>
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>User</th>
              <th>Action</th>
              <th>Item</th>
              <th>Details</th>
              {isAdmin && <th>Warehouse</th>}
            </tr>
          </thead>
          <tbody>
            {(showAll ? logs : logs.slice(0, 10)).length > 0 ? (
              (showAll ? logs : logs.slice(0, 10)).map((log) => (
                <tr key={log.id}>
                  <td>{new Date(log.dateTime).toLocaleTimeString()}</td>
                  <td>{log.username}</td>
                  <td className={`action-cell ${log.action.toLowerCase()}`}>{log.action}</td>
                  <td>{log.item?.split(" (")[0]}</td>
                  <td>{renderLogDetails(log)}</td>
                  {isAdmin && <td>{log.warehouse}</td>}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={isAdmin ? "6" : "5"}>No logs for this date</td>
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

export default CalendarPage;
