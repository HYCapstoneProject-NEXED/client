import React from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import './Header.css';

const Header = ({ onSave, onBack }) => {
  return (
    <header className="annotator-header">
      <div className="header-left">
        {onBack && (
          <button className="annotator-back-button" onClick={onBack}>
            <FaArrowLeft /> <span>Back</span>
          </button>
        )}
        <h1>Edit</h1>
      </div>
      <button className="annotator-save-button" onClick={onSave}>Save</button>
    </header>
  );
};

export default Header; 