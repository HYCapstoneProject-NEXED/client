import React from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import './Header.css';

const Header = ({ onSave, onGoBack }) => {
  return (
    <header className="annotator-header">
      {onGoBack && (
        <button className="annotator-back-button" onClick={onGoBack}>
          <FaArrowLeft size={16} style={{ marginRight: '5px' }} /> Back
        </button>
      )}
      <h1>Edit</h1>
      <button className="annotator-save-button" onClick={onSave}>Save</button>
    </header>
  );
};

export default Header; 