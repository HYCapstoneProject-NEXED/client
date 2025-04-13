import React from 'react';
import './Header.css';

const Header = ({ onSave }) => {
  return (
    <header className="header">
      <h1>Edit</h1>
      <button className="save-button" onClick={onSave}>Save</button>
    </header>
  );
};

export default Header; 