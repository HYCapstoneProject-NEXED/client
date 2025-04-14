import React from 'react';
import './ClassSelector.css';

const ClassSelector = ({ onClassSelect }) => {
  return (
    <div className="class-selection">
      <h3>Class</h3>
      <div className="class-options">
        <div className="class-option" onClick={() => onClassSelect('Defect_A')}>
          <div className="class-color defect-a-color"></div>
          <span>Defect_A</span>
        </div>
        <div className="class-option" onClick={() => onClassSelect('Defect_B')}>
          <div className="class-color defect-b-color"></div>
          <span>Defect_B</span>
        </div>
        <div className="class-option" onClick={() => onClassSelect('Defect_C')}>
          <div className="class-color defect-c-color"></div>
          <span>Defect_C</span>
        </div>
        <div className="class-option" onClick={() => onClassSelect('Defect_D')}>
          <div className="class-color defect-d-color"></div>
          <span>Defect_D</span>
        </div>
      </div>
    </div>
  );
};

export default ClassSelector; 