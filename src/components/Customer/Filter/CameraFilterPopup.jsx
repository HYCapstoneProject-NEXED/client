import React, { useRef, useState } from 'react';
import useOutsideClick from '../../../hooks/useOutsideClick';
import './FilterPopup.css';

const cameras = ['1', '2', '3', '4', '5'];

const CameraFilterPopup = ({ selected, onApply, onClose }) => {
    const ref = useRef();
    useOutsideClick(ref, onClose);
  
    const [active, setActive] = useState([...selected]);
    const toggle = (name) => {
      setActive(prev => prev.includes(name) ? prev.filter(i => i !== name) : [...prev, name]);
    };

  return (
    <div className="customer-filter-popup-wrapper" style={{ position: 'relative' }}>
      <div className="customer-filter-popup" ref={ref}>
        <div className="popup-header">
          <p className="popup-title">Camera ID</p>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="button-grid">
          {cameras.map(name => (
            <button
              key={name}
              className={`popup-btn ${active.includes(name) ? 'active' : ''}`}
              onClick={() => toggle(name)}
            >
              {name}
            </button>
          ))}
        </div>
        <button onClick={() => onApply(active)} className="popup-apply-btn">Apply Now</button>
      </div>
    </div>
  );
};

export default CameraFilterPopup;
