import React, { useRef, useState } from 'react';
import useOutsideClick from '../../../hooks/useOutsideClick';
import './FilterPopup.css';

const DateFilterPopup = ({ selected = [], onApply, onClose }) => {
  const ref = useRef();
  useOutsideClick(ref, onClose);

  const [selectedDates, setSelectedDates] = useState([...selected]);
  const [currentDate, setCurrentDate] = useState('');

  const handleDateChange = (e) => {
    setCurrentDate(e.target.value);
  };

  const addDate = () => {
    if (currentDate && !selectedDates.includes(currentDate)) {
      setSelectedDates([...selectedDates, currentDate]);
      setCurrentDate('');
    }
  };

  const removeDate = (dateToRemove) => {
    setSelectedDates(selectedDates.filter(date => date !== dateToRemove));
  };

  return (
    <div className="customer-filter-popup-wrapper" style={{ position: 'relative' }}>
      <div className="customer-filter-popup">
        <p>Select Dates</p>
        <div style={{ marginBottom: '12px' }}>
          <input
            type="date"
            value={currentDate}
            onChange={handleDateChange}
            className="popup-input"
          />
          <button 
            onClick={addDate}
            className="popup-btn"
            style={{ marginTop: '8px', width: '100%' }}
          >
            Add Date
          </button>
        </div>

        {selectedDates.length > 0 && (
          <div style={{ marginBottom: '12px' }}>
            <p style={{ fontSize: '14px', marginBottom: '8px' }}>Selected Dates:</p>
            <div className="button-grid">
              {selectedDates.map(date => (
                <button
                  key={date}
                  className="popup-btn active"
                  onClick={() => removeDate(date)}
                >
                  {date} ×
                </button>
              ))}
            </div>
          </div>
        )}

        <button onClick={() => onApply(selectedDates)} className="popup-apply-btn">
          Apply Now
        </button>
      </div>
    </div>
  );
};

export default DateFilterPopup;
