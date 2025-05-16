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
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { FaSortUp, FaSortDown } from "react-icons/fa";
import "./CalendarPage.css";

const CalendarPage = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [logs, setLogs] = useState([]);
  const [warehouse, setWarehouse] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [sortField, setSortField] = useState("dateTime");
  const [sortAsc, setSortAsc] = useState(false);

  const isAdmin = new URLSearchParams(window.location.search).get("admin") === "true";

  const renderSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortAsc ? <FaSortUp /> : <FaSortDown />;
  };

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

  const fetchLogs = () => {
    const formattedDate = format(selectedDate, "yyyy-MM-dd");

    if (!isAdmin && (!warehouse || warehouse.trim() === "")) {
      console.warn("Invalid or missing warehouse name");
      return;
    }

    const url = isAdmin
      ? `https://wims-w48m.onrender.com/api/accounts/dashboard-by-date?date=${formattedDate}`
      : `https://wims-w48m.onrender.com/api/dashboard-by-date?date=${formattedDate}&warehouse=${encodeURIComponent(
          warehouse
        )}`;

    fetch(url, { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error("Failed to fetch logs: " + text);
        }
        return res.json();
      })
      .then((data) => {
        const sorted = (data.logs || []).sort(
          (a, b) => new Date(b.dateTime) - new Date(a.dateTime)
        );
        setLogs(sorted);
      })
      .catch((err) => {
        console.error("Error loading logs:", err);
        setLogs([]);
      });
  };

  useEffect(() => {
    fetchLogs();
  }, [selectedDate, warehouse, isAdmin]);

  useEffect(() => {
    const socket = new SockJS("https://wims-w48m.onrender.com/ws");
    const stompClient = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        const topic = isAdmin ? "/topic/logs/admin" : `/topic/logs/${warehouse}`;
        stompClient.subscribe(topic, (message) => {
          const newLog = JSON.parse(message.body);
          const logDate = new Date(newLog.dateTime);
          if (isSameDay(logDate, selectedDate)) {
            setLogs((prevLogs) => [newLog, ...prevLogs]);
          }
        });
      },
      onStompError: (frame) => {
        console.error("WebSocket error", frame);
      },
    });

    stompClient.activate();
    return () => stompClient.deactivate();
  }, [selectedDate, warehouse, isAdmin]);

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

  const renderLogDetails = (log) => {
    if (log.action === "Move") {
      return `Moved ${log.units} units from ${log.previousLocation ?? "?"} to ${log.location}`;
    } else if (log.action === "Removed") {
      return `Removed ${log.units} units${
        log.remainingUnits != null ? `, ${log.remainingUnits} left` : ""
      }`;
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
            className={`calendar-day ${isToday(day) ? "today" : ""} ${
              isSameDay(day, selectedDate) ? "selected" : ""
            }`}
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
              <th onClick={() => toggleSort("dateTime")}>
                Time {renderSortIcon("dateTime")}
              </th>
              <th onClick={() => toggleSort("username")}>
                User {renderSortIcon("username")}
              </th>
              <th onClick={() => toggleSort("action")}>
                Action {renderSortIcon("action")}
              </th>
              <th onClick={() => toggleSort("item")}>
                Item {renderSortIcon("item")}
              </th>
              <th>Details</th>
              {isAdmin && (
                <th onClick={() => toggleSort("warehouse")}>
                  Warehouse {renderSortIcon("warehouse")}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {getSortedLogs().length > 0 ? (
              getSortedLogs().map((log) => (
                <tr key={log.id}>
                  <td>{new Date(log.dateTime).toLocaleTimeString()}</td>
                  <td>{log.username}</td>
                  <td className={`action-cell ${log.action.toLowerCase()}`}>
                    {log.action}
                  </td>
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
