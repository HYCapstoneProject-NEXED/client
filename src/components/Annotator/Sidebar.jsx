import React from 'react';
import './Sidebar.css';

const Sidebar = ({ dataInfo, defects, selectedDefect, onDefectSelect }) => {
  return (
    <aside className="sidebar">
      <div className="data-info">
        <div className="info-item">
          <h2>Data ID : {dataInfo.dataId}</h2>
        </div>
        <div className="info-item">
          <h2>Confidence Score : {dataInfo.confidenceScore}</h2>
        </div>
        <div className="info-item">
          <h2>State : {dataInfo.state}</h2>
        </div>
      </div>

      <div className="defect-list-container">
        <h2>Defect list</h2>
        <ul className="defect-list">
          {defects.map((defect) => (
            <li 
              key={defect.id} 
              className={`defect-item ${selectedDefect === defect.id ? 'selected' : ''}`}
              onClick={() => onDefectSelect(defect.id)}
            >
              <div className={`defect-color ${defect.type === 'Defect_A' ? 'defect-a' : 'defect-b'}`}></div>
              <span>({defect.id}) {defect.type}</span>
              <span className="confidence">{defect.confidence.toFixed(2)}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar; 