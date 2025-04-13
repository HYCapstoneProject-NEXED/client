import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FaHome,
  FaDatabase,
  FaChartBar,
  FaWrench,
  FaSignOutAlt
} from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="logo">Defetect.</div>
      <nav className="nav">
        <NavLink to="/customer-dashboard" className="nav-link">
          <FaHome /> Dashboard
        </NavLink>
        <NavLink to="/customer-defectdata" className="nav-link">
          <FaDatabase /> Defect data
        </NavLink>
        <NavLink to="/customer-statistics" className="nav-link">
          <FaChartBar /> Statistics
        </NavLink>
        <NavLink to="/customer-editclass" className="nav-link">
          <FaWrench /> Edit class
        </NavLink>
      </nav>
      <div className="logout">
        <FaSignOutAlt /> Logout
      </div>
    </div>
  );
};

export default Sidebar;
