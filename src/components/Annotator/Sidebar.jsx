import React, { useState, useEffect } from 'react';
import './Sidebar.css';

const Sidebar = ({ dataInfo, defects, selectedDefect, onDefectSelect, onToolChange, toolTypes }) => {
  // 선택된 결함의 상세 정보
  const [selectedDefectDetail, setSelectedDefectDetail] = useState(null);

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

  // 선택된 결함이 변경될 때 상세 정보 업데이트
  useEffect(() => {
    if (selectedDefect) {
      const detail = defects.find(d => d.id === selectedDefect);
      setSelectedDefectDetail(detail);
    } else {
      setSelectedDefectDetail(null);
    }
  }, [selectedDefect, defects]);

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
        <h2 className="section-title">Data Information</h2>
        
        <div className="data-info-grid">
          <div className="info-row">
            <span className="info-label">Data ID</span>
            <span className="info-value">{dataInfo.dataId}</span>
          </div>
          
          <div className="info-row">
            <span className="info-label">Confidence Score</span>
            <span className="info-value score">{dataInfo.confidenceScore.toFixed(2)}</span>
          </div>
          
          <div className="info-row">
            <span className="info-label">State</span>
            <span className="info-value">{dataInfo.state}</span>
          </div>
          
          <div className="info-divider"></div>
          
          <div className="info-row timestamp">
            <span className="info-label">Data Capture Timestamp</span>
            <span className="info-value">{dataInfo.captureDate || '-'}</span>
          </div>
          
          <div className="info-row timestamp">
            <span className="info-label">Last Modified</span>
            <span className="info-value">{dataInfo.lastModified || '-'}</span>
          </div>
        </div>
      </div>

      {/* 선택된 어노테이션 상세 정보 */}
      {selectedDefectDetail && (
        <div className="annotator-defect-detail">
          <h2>Selected Annotation Details</h2>
          <div className="annotator-detail-item">
            <span className="detail-label">Annotation ID:</span>
            <span className="detail-value">{selectedDefectDetail.id}</span>
          </div>
          <div className="annotator-detail-item">
            <span className="detail-label">Defect Type:</span>
            <span className="detail-value">
              <span className={`detail-color-dot ${getDefectColorClass(selectedDefectDetail.type)}`}></span>
              {selectedDefectDetail.type}
            </span>
          </div>
          <div className="annotator-detail-item">
            <span className="detail-label">Confidence Score:</span>
            <span className="detail-value confidence">{selectedDefectDetail.confidence.toFixed(2)}</span>
          </div>
          <div className="annotator-detail-item">
            <span className="detail-label">Position:</span>
            <span className="detail-value">
              {`(${Math.round(selectedDefectDetail.coordinates.x)}, ${Math.round(selectedDefectDetail.coordinates.y)})`}
            </span>
          </div>
          <div className="annotator-detail-item">
            <span className="detail-label">Size:</span>
            <span className="detail-value">
              {`${Math.round(selectedDefectDetail.coordinates.width)} x ${Math.round(selectedDefectDetail.coordinates.height)}`}
            </span>
          </div>
        </div>
      )}

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
              <span className="annotator-confidence">{defect.confidence === 0.9 ? '-' : defect.confidence.toFixed(2)}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar; 