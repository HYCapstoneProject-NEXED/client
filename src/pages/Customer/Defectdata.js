// ✅ Defectdata.js - 팝업 필터 적용 완료

import React, { useEffect, useState } from 'react';
import CustomerLayout from '../../components/Customer/CustomerLayout';
import './Defectdata.css';
import dummyDefectData from '../../data/dummyDefectData';
import DefectFilterPopup from '../../components/Customer/Filter/DefectFilterPopup';
import CameraFilterPopup from '../../components/Customer/Filter/CameraFilterPopup';
import DateFilterPopup from '../../components/Customer/Filter/DateFilterPopup';

const Defectdata = () => {
  const [classList, setClassList] = useState([]);
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [selectedDefects, setSelectedDefects] = useState([]);
  const [selectedCameras, setSelectedCameras] = useState([]);
  const [openFilter, setOpenFilter] = useState(null);
  const [defectData, setDefectData] = useState(dummyDefectData);

  useEffect(() => {
    const dummyClassData = [
      { class_name: 'Scratch', class_color: '#dbe4ff', count: 600 },
      { class_name: 'Burr', class_color: '#fde2e2' , count: 60},
      { class_name: 'Crack', class_color: '#fff3b0' , count: 1750 },
      { class_name: 'Paticle', class_color: '#cbf1f5' , count: 820}
    ];
    setTimeout(() => {
      setClassList(dummyClassData);
    }, 500);
  }, []);

  // Helper functions for safe type checking
  const hasCommonElement = (arr1, arr2) => {
    if (!Array.isArray(arr1) || !Array.isArray(arr2)) return false;
    return arr1.some(item => arr2.includes(item));
  };

  // 필터링 로직
  useEffect(() => {
    let filteredData = [...dummyDefectData];

    // 날짜 범위 필터링
    if (dateRange.start && dateRange.end) {
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      // Set end date to end of day
      endDate.setHours(23, 59, 59, 999);
      
      filteredData = filteredData.filter(defect => {
        const defectDate = new Date(defect.timestamp);
        return defectDate >= startDate && defectDate <= endDate;
      });
    }

    // 불량 유형 필터링
    if (selectedDefects.length > 0) {
      filteredData = filteredData.filter(defect => 
        hasCommonElement(selectedDefects, Array.isArray(defect.type) ? defect.type : [defect.type])
      );
    }

    // 카메라 ID 필터링
    if (selectedCameras.length > 0) {
      filteredData = filteredData.filter(defect => 
        selectedCameras.includes(defect.cameraId.toString())
      );
    }

    setDefectData(filteredData);
  }, [dateRange, selectedDefects, selectedCameras]);

  const handleReset = () => {
    setDateRange({ start: null, end: null });
    setSelectedDefects([]);
    setSelectedCameras([]);
    setOpenFilter(null);
    setDefectData(dummyDefectData);
  };

  return (
    <CustomerLayout>
      <div style={{ padding: '24px' }}>
        {/* 요약 카드 영역 */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
          {classList.map((cls, idx) => (
            <div
              key={idx}
              className="summary-card horizontal"
            >
              <div
                className="summary-dot"
                style={{ backgroundColor: cls.class_color }}
              />
              <div className="summary-content">
                <div className="summary-label">{cls.class_name}</div>
                <div className="summary-count">{cls.count}</div>
              </div>
            </div>
          ))}
        </div>

        {/* 필터 바 + 팝업 */}
        <div className="filter-bar">
          <div className="filter-btn-wrapper">
            <button
              className="filter-btn"
              onClick={() => setOpenFilter('date')}
              style={{ position: 'relative' }}
            >
              <span>📅</span>
              {dateRange.start && dateRange.end 
                ? `${dateRange.start} ~ ${dateRange.end}` 
                : 'Select Date Range'}
              <span style={{ fontSize: '12px', marginLeft: '4px' }}>⌄</span>
            </button>
            {openFilter === 'date' && (
              <DateFilterPopup
                selected={dateRange}
                onApply={(range) => {
                  setDateRange(range);
                  setOpenFilter(null);
                }}
                onClose={() => setOpenFilter(null)}
              />
            )}
          </div>

          <div className="filter-btn-wrapper">
            <button className="filter-btn" onClick={() => setOpenFilter('defect')}>
              <span>🔍</span>
              {selectedDefects.length > 0 
                ? selectedDefects.join(', ') 
                : 'Defect Type'}
              <span style={{ fontSize: '12px', marginLeft: '4px' }}>⌄</span>
            </button>
            {openFilter === 'defect' && (
              <DefectFilterPopup
                selected={selectedDefects}
                onApply={(list) => {
                  setSelectedDefects(list);
                  setOpenFilter(null);
                }}
                onClose={() => setOpenFilter(null)}
              />
            )}
          </div>

          <div className="filter-btn-wrapper">
            <button className="filter-btn" onClick={() => setOpenFilter('camera')}>
              <span>📸</span>
              {selectedCameras.length > 0 
                ? selectedCameras.join(', ') 
                : 'Camera ID'}
              <span style={{ fontSize: '12px', marginLeft: '4px' }}>⌄</span>
            </button>
            {openFilter === 'camera' && (
              <CameraFilterPopup
                selected={selectedCameras}
                onApply={(list) => {
                  setSelectedCameras(list);
                  setOpenFilter(null);
                }}
                onClose={() => setOpenFilter(null)}
              />
            )}
          </div>
          
          <button className="reset-btn" onClick={handleReset}>
            <span>↺</span>
            Reset Filter
          </button>
        </div>

        {/* 테이블 영역 */}
        <div className="table-container">
          <table className="defect-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Line</th>
                <th>Camera ID</th>
                <th>Time</th>
                <th>Type</th>
              </tr>
            </thead>

            <tbody>
              {defectData.map((defect) => (
                <tr key={defect.id}>
                  <td>
                    <img 
                      src={defect.image}
                      alt={`defect-${defect.id}`}
                      className="table-image"
                    />
                  </td>
                  <td>{defect.line}</td>
                  <td>{defect.cameraId}</td>
                  <td>{new Date(defect.timestamp).toLocaleString('ko-KR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                  })}</td>
                  <td>{Array.isArray(defect.type) ? defect.type.join(', ') : defect.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default Defectdata;
