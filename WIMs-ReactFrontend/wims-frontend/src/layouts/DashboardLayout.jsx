// src/layouts/DashboardLayout.jsx
import React from "react";
import Sidebar from "../components/Sidebar";

const DashboardLayout = ({ children }) => {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main style={{ marginLeft: "60px", padding: "1rem", width: "100%" }}>
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
