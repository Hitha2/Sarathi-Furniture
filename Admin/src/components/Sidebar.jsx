import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import "../styles/Sidebar.css";

const Sidebar = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* ☰ MENU BUTTON (visible on mobile/tablet) */}
      <button className="menu-btn" onClick={() => setOpen(!open)}>
         <FaBars size={24} />
      </button>

      {/* OVERLAY */}
      <div
        className={`overlay ${open ? "active" : ""}`}
        onClick={() => setOpen(false)}
      ></div>

      {/* SIDEBAR */}
      <div className={`sidebar ${open ? "active" : ""}`}>
        <h2 className="slogo">Admin</h2>

        <ul>
          <li><Link to="/" onClick={() => setOpen(false)}>Dashboard</Link></li>
          <li><Link to="/category" onClick={() => setOpen(false)}>Create Category</Link></li>
          <li><Link to="/product" onClick={() => setOpen(false)}>Products</Link></li>
          <li><Link to="/inventory" onClick={() => setOpen(false)}>Inventory</Link></li>
          <li><Link to="/manageorders" onClick={() => setOpen(false)}>Manage Order</Link></li>
          <li><Link to="/customermanagement" onClick={() => setOpen(false)}>Customer Management</Link></li>
          <li><Link to="/accountmanagement" onClick={() => setOpen(false)}>Account Management</Link></li>
        </ul>
      </div>
    </>
  );
};

export default Sidebar;