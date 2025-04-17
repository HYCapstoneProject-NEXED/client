import React from 'react';
import './Sidebar.css';

const Sidebar = ({ dataInfo, defects, selectedDefect, onDefectSelect, onToolChange, toolTypes }) => {
  // 결함 타입별 색상 클래스 반환 함수
  const getDefectColorClass = (defectType) => {
    switch(defectType) {
      case 'Defect_A':
        return 'annotator-defect-a';
      case 'Defect_B':
        return 'annotator-defect-b';
      case 'Defect_C':
        return 'annotator-defect-c';
      case 'Defect_D':
        return 'annotator-defect-d';
      default:
        return 'annotator-defect-a';
    }
  };

  // 결함 선택 및 손바닥 도구 활성화
  const handleDefectSelect = (defectId) => {
    onDefectSelect(defectId);
    
    // 결함 선택 시 자동으로 손바닥 도구 활성화
    if (onToolChange && toolTypes) {
      onToolChange(toolTypes.HAND);
    }
  };

  return (
    <aside className="annotator-sidebar">
      <div className="annotator-data-info">
        <div className="annotator-info-item">
          <h2>Data ID : {dataInfo.dataId}</h2>
        </div>
        <div className="annotator-info-item">
          <h2>Confidence Score : {dataInfo.confidenceScore.toFixed(2)}</h2>
        </div>
        <div className="annotator-info-item">
          <h2>State : {dataInfo.state}</h2>
        </div>
      </div>

      <div className="annotator-defect-list-container">
        <h2>Defect list</h2>
        <ul className="annotator-defect-list">
          {defects.map((defect) => (
            <li 
              key={defect.id} 
              data-id={defect.id}
              className={`annotator-defect-item ${selectedDefect === defect.id ? 'selected' : ''}`}
              onClick={() => handleDefectSelect(defect.id)}
            >
              <div className={`annotator-defect-color ${getDefectColorClass(defect.type)}`}></div>
              <span>({defect.id}) {defect.type}</span>
              <span className="annotator-confidence">{defect.confidence.toFixed(2)}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar; 