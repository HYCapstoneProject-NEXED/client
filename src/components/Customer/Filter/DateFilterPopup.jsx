import React, { useRef } from 'react';
import useOutsideClick from '../../../hooks/useOutsideClick';
import './FilterPopup.css';

const DateFilterPopup = ({ onApply, onClose }) => {
  const ref = useRef();
  useOutsideClick(ref, onClose); 

  const [date, setDate] = React.useState('2025-02-14');

  return (
    <div className="customer-filter-popup-wrapper" style={{ position: 'relative' }}>
      <div className="customer-filter-popup">
        <p style={{ marginBottom: '12px' }}>Pick a Date</p>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="popup-input"
        />
        <button onClick={() => onApply(date)} className="popup-apply-btn">Apply Now</button>
      </div>
    </div>
  );
};

export default DateFilterPopup;
