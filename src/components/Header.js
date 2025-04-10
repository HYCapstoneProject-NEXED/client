import React from 'react';
import { FaBell } from 'react-icons/fa';
import './Header.css';

const Header = () => {
  return (
    <div className="top-header">
      <div className="header-right">
        <div className="user-role">Customer</div>
        <div className="user-info">
          <FaBell className="icon" />
          <img src="/default-profile.jpg" alt="profile" className="profile-img" />
        </div>
      </div>
    </div>
  );
};

export default Header;
