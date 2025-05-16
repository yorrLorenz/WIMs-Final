import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaTachometerAlt,
  FaCalendarAlt,
  FaUsers,
  FaCog,
  FaSignOutAlt,
  FaUserCircle,
  FaBoxes,
} from "react-icons/fa";
import "./Sidebar.css";

const Sidebar = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("auth") === "true" ? localStorage.getItem("role") : null;
  const warehouse = localStorage.getItem("warehouse");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="sidebar">
      <div className="sidebar-top">
        <SidebarItem
          to={role === "ADMIN" ? "/admin-dashboard" : `/warehouse/${encodeURIComponent(warehouse || "")}`}
          icon={<FaTachometerAlt />}
          label="Dashboard"
        />

        {/* ✅ Product Masterlist visible for both Admin and Clerk */}
        <SidebarItem
          to={role === "ADMIN" ? "/admin/products" : `/warehouse/${encodeURIComponent(warehouse || "")}/products`}
          icon={<FaBoxes />}
          label="Product Masterlist"
        />

        <SidebarItem
          to={role === "ADMIN" ? "/calendar?admin=true" : "/calendar"}
          icon={<FaCalendarAlt />}
          label="Calendar"
        />

        <SidebarItem
          to="/account-info"
          icon={<FaUserCircle />}
          label="Profile"
        />

        {role === "ADMIN" && (
          <SidebarItem
            to="/select-warehouse"
            icon={<FaCog />}
            label="Warehouse Management"
          />
        )}
      </div>

      <div className="sidebar-bottom">
        <button className="sidebar-icon logout-btn" onClick={handleLogout} title="Logout">
          <FaSignOutAlt />
          <span className="sidebar-label">Logout</span>
        </button>
      </div>
    </div>
  );
};

const SidebarItem = ({ to, icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `sidebar-icon ${isActive ? "active" : ""}`
    }
    title={label}
  >
    {icon}
    <span className="sidebar-label">{label}</span>
  </NavLink>
);

export default Sidebar;
