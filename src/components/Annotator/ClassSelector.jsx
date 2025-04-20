import React from 'react';
import './ClassSelector.css';

const ClassSelector = ({ onClassSelect }) => {
  return (
    <div className="annotator-class-selection">
      <h3>Class</h3>
      <div className="annotator-class-options">
        <div className="annotator-class-option" onClick={() => onClassSelect('Defect_A')}>
          <div className="annotator-class-color annotator-defect-a-color"></div>
          <span>Defect_A</span>
        </div>
        <div className="annotator-class-option" onClick={() => onClassSelect('Defect_B')}>
          <div className="annotator-class-color annotator-defect-b-color"></div>
          <span>Defect_B</span>
        </div>
        <div className="annotator-class-option" onClick={() => onClassSelect('Defect_C')}>
          <div className="annotator-class-color annotator-defect-c-color"></div>
          <span>Defect_C</span>
        </div>
        <div className="annotator-class-option" onClick={() => onClassSelect('Defect_D')}>
          <div className="annotator-class-color annotator-defect-d-color"></div>
          <span>Defect_D</span>
        </div>
      </div>
    </div>
  );
};

export default ClassSelector; 