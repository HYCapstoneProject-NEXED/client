// ✅ Defectdata.js - 팝업 필터 적용 완료

import React, { useEffect, useState } from 'react';
import CustomerLayout from '../../components/Customer/CustomerLayout';
import './Defectdata.css';

// 팝업 import
import DateFilterPopup from '../../components/Customer/Filter/DateFilterPopup';
import DefectFilterPopup from '../../components/Customer/Filter/DefectFilterPopup';
import CameraFilterPopup from '../../components/Customer/Filter/CameraFilterPopup';

const Defectdata = () => {
  const [classList, setClassList] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedDefects, setSelectedDefects] = useState([]);
  const [selectedCameras, setSelectedCameras] = useState([]);
  const [openFilter, setOpenFilter] = useState(null); // 'date', 'defect', 'camera'

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

  const handleReset = () => {
    setSelectedDate('');
    setSelectedDefects([]);
    setSelectedCameras([]);
    setOpenFilter(null);
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
        <div className="filter-bar" style={{ position: 'relative' }}>
          <div className="filter-btn-wrapper">
            <button
              className="filter-btn"
              onClick={() => setOpenFilter('date')}
              style={{ position: 'relative' }}
            >
              📅 Select Date ⌄
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
              🧪 Defect Type ⌄
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
              📸 Camera ID ⌄
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
             ↻ Reset Filter 
          </button>
        </div>


        {/* 테이블 영역 */}
      </div>
    </CustomerLayout>
  );
};

export default Defectdata;
