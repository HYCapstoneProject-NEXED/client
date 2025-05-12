// ✅ Defectdata.js - 팝업 필터 적용 완료

import React, { useEffect, useState } from 'react';
import CustomerLayout from '../../components/Customer/CustomerLayout';
import './Defectdata.css';

// 팝업 import
import DateFilterPopup from '../../components/Customer/Filter/DateFilterPopup';
import DefectFilterPopup from '../../components/Customer/Filter/DefectFilterPopup';
import CameraFilterPopup from '../../components/Customer/Filter/CameraFilterPopup';

// 더미데이터 정의
const dummyDefectData = [
  {
    id: 1,
    image: '/circle-placeholder.png',
    line: 'Line-A',
    cameraId: 1,
    timestamp: '2025-04-19T10:00:00',
    type: 'Crack'
  },
  {
    id: 2,
    image: '/circle-placeholder.png',
    line: 'Line-B',
    cameraId: 2,
    timestamp: '2025-04-19T10:05:00',
    type: 'Scratch'
  },
  {
    id: 3,
    image: '/circle-placeholder.png',
    line: 'Line-A',
    cameraId: 3,
    timestamp: '2025-04-19T10:10:00',
    type: 'Burr'
  }
];

const Defectdata = () => {
  const [classList, setClassList] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
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

  // 필터링 로직
  useEffect(() => {
    let filteredData = [...dummyDefectData];

    // 날짜 필터링
    if (selectedDate) {
      const selectedDateObj = new Date(selectedDate);
      filteredData = filteredData.filter(defect => {
        const defectDate = new Date(defect.timestamp);
        return defectDate.toDateString() === selectedDateObj.toDateString();
      });
    }

    // 불량 유형 필터링
    if (selectedDefects.length > 0) {
      filteredData = filteredData.filter(defect => 
        selectedDefects.includes(defect.type)
      );
    }

    // 카메라 ID 필터링
    if (selectedCameras.length > 0) {
      filteredData = filteredData.filter(defect => 
        selectedCameras.includes(defect.cameraId)
      );
    }

    setDefectData(filteredData);
  }, [selectedDate, selectedDefects, selectedCameras]);

  const handleReset = () => {
    setSelectedDate('');
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
              Select Date
              <span style={{ fontSize: '12px', marginLeft: '4px' }}>⌄</span>
            </button>
            {openFilter === 'date' && (
              <DateFilterPopup
                onApply={(date) => {
                  setSelectedDate(date);
                  setOpenFilter(null);
                }}
                onClose={() => setOpenFilter(null)}
              />
            )}
          </div>

          <div className="filter-btn-wrapper">
            <button className="filter-btn" onClick={() => setOpenFilter('defect')}>
              <span>🔍</span>
              Defect Type
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
              Camera ID
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
                  <td>{defect.type}</td>
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
