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

  const isAdmin = new URLSearchParams(window.location.search).get("admin") === "true";
const warehouse = localStorage.getItem("warehouse");

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const handleDayClick = (day) => {
    setSelectedDate(day);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  useEffect(() => {
    const formatted = format(selectedDate, "yyyy-MM-dd");
    const warehouse = localStorage.getItem("warehouse");

    const url = isAdmin
      ? `http://localhost:8080/api/accounts/dashboard-by-date?date=${formatted}`
      : `http://localhost:8080/api/dashboard-by-date?date=${formatted}&warehouse=${encodeURIComponent(warehouse)}`;

    fetch(url, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setLogs(data.logs || []);
      })
      .catch((err) => {
        console.error("Error loading logs", err);
        setLogs([]);
      });
  }, [selectedDate, isAdmin]);

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
        <div className="day-label">S</div>
        <div className="day-label">M</div>
        <div className="day-label">T</div>
        <div className="day-label">W</div>
        <div className="day-label">T</div>
        <div className="day-label">F</div>
        <div className="day-label">S</div>
        {Array.from({ length: days[0].getDay() }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {days.map((day) => (
          <div
            key={day}
            className={`calendar-day ${
              isToday(day) ? "today" : ""
            } ${isSameDay(day, selectedDate) ? "selected" : ""}`}
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
              {isAdmin && <th>Warehouse</th>}
            </tr>
          </thead>
          <tbody>
            {logs.length > 0 ? (
              logs.map((log) => (
                <tr key={log.id}>
                  <td>{new Date(log.dateTime).toLocaleTimeString()}</td>
                  <td>{log.username}</td>
                  <td className={`action-cell ${log.action.toLowerCase()}`}>{log.action}</td>
                  <td>{log.item}</td>
                  {isAdmin && <td>{log.warehouse}</td>}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={isAdmin ? "5" : "4"}>No logs for this date</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CalendarPage;
