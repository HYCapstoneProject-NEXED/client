import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  FaHome,
  FaChartBar,
  FaWrench,
  FaSignOutAlt
} from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // 로그아웃 로직 구현
    console.log('Logging out...');
    navigate('/');
  };

  return (
    <div className="sidebar">
      <div className="customer-logo">Defectect.</div>
      <nav className="nav">
        <NavLink 
          to="/customer/dashboard" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <div className="menu-content">
            <FaHome size={18} />
            <span>Dashboard</span>
          </div>
        </NavLink>
        <NavLink 
          to="/customer/statistics" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <div className="menu-content">
            <FaChartBar size={18} />
            <span>Statistics</span>
          </div>
        </NavLink>
        <NavLink 
          to="/customer/editclass" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <div className="menu-content">
            <FaWrench size={18} />
            <span>Edit class</span>
          </div>
        </NavLink>
      </nav>
      <div className="logout" onClick={handleLogout}>
        <FaSignOutAlt size={18} />
        <span>Logout</span>
      </div>
    </div>
  );
};

export default Sidebar;
