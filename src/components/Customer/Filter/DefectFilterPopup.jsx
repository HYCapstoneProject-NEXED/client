import React, { useRef, useState }  from 'react';
import useOutsideClick from '../../../hooks/useOutsideClick';
import './FilterPopup.css';

const options = ['Crack', 'Scratch', 'Burr', 'Particle', 'Dent'];

const DefectFilterPopup = ({ selected, onApply, onClose }) => {
    const ref = useRef();
    useOutsideClick(ref, onClose);
  
    const [active, setActive] = useState([...selected]);
    const toggle = (name) => {
      setActive(prev => prev.includes(name) ? prev.filter(i => i !== name) : [...prev, name]);
    };

  return (
    <div className="filter-popup">
      <p>Defect Type</p>
      <div className="button-grid">
        {options.map(name => (
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
  );
};

export default DefectFilterPopup;
