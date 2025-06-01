import React, { useState, useEffect } from 'react';
import './FilterPopup.css';

// API 기본 URL 설정 - 배포 환경에 맞게 수정
const API_URL = process.env.REACT_APP_API_URL || 'http://166.104.246.64:8000';

const DefectFilterPopup = ({ selected, onApply, onClose }) => {
  const [selectedItems, setSelectedItems] = useState(selected);
  const [defectTypes, setDefectTypes] = useState([]);

  useEffect(() => {
    const fetchDefectTypes = async () => {
      try {
        const response = await fetch(`${API_URL}/defect-classes`);
        const data = await response.json();
        const activeDefects = data.filter(defect => !defect.is_deleted);
        setDefectTypes(activeDefects);
      } catch (error) {
        console.error('결함 유형 목록 조회 실패:', error);
      }
    };

    fetchDefectTypes();
  }, []); // 컴포넌트가 마운트될 때 한 번만 실행

  const handleToggleItem = (classId) => {
    setSelectedItems(prev => {
      if (prev.includes(classId)) {
        return prev.filter(id => id !== classId);
      } else {
        return [...prev, classId];
      }
    });
  };

  const handleApply = () => {
    onApply(selectedItems);
  };

  return (
    <div className="customer-filter-popup-wrapper" style={{ position: 'relative' }}>
      <div className="customer-filter-popup">
        <div className="popup-header">
          <p className="popup-title">Defect Type</p>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="button-grid">
          {defectTypes.map((defect) => (
            <button
              key={defect.class_id}
              className={`popup-btn ${selectedItems.includes(defect.class_id) ? 'active' : ''}`}
              onClick={() => handleToggleItem(defect.class_id)}
            >
              {defect.class_name}
            </button>
          ))}
        </div>
        <button onClick={handleApply} className="popup-apply-btn">
          Apply Now
        </button>
      </div>
    </div>
  );
};

export default DefectFilterPopup;
