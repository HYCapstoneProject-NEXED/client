import React, { useRef, useState } from 'react';
import useOutsideClick from '../../../hooks/useOutsideClick';
import './FilterPopup.css';

const DateFilterPopup = ({ selected, onApply, onClose }) => {
  const ref = useRef();
  useOutsideClick(ref, onClose);

  // Handle selected as either object or null/undefined
  const initialStart = selected && typeof selected === 'object' && selected.start ? selected.start : '';
  const initialEnd = selected && typeof selected === 'object' && selected.end ? selected.end : '';
  
  const [startDate, setStartDate] = useState(initialStart);
  const [endDate, setEndDate] = useState(initialEnd);

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
    // Reset end date if start date is after it
    if (endDate && e.target.value > endDate) {
      setEndDate('');
    }
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };

  const handleApply = () => {
    if (startDate && endDate) {
      onApply({ start: startDate, end: endDate });
    }
  };

  return (
    <div className="customer-filter-popup-wrapper" style={{ position: 'relative' }}>
      <div className="customer-filter-popup" ref={ref}>
        <div className="popup-header">
          <h3>Select Date Range</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="date-range-inputs">
          <div className="date-input-group">
            <label>Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={handleStartDateChange}
              className="popup-input"
            />
          </div>
          
          <div className="date-input-group">
            <label>End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={handleEndDateChange}
              min={startDate}
              className="popup-input"
              disabled={!startDate}
            />
          </div>
        </div>

        <div className="popup-footer">
          <button 
            onClick={handleApply} 
            className="popup-apply-btn"
            disabled={!startDate || !endDate}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default DateFilterPopup;
