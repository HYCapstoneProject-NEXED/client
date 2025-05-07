import React, { useState } from 'react';
import CustomerLayout from '../../components/Customer/CustomerLayout';
import './Dashboard.css';
import DateFilterPopup from '../../components/Customer/Filter/DateFilterPopup';
import DefectFilterPopup from '../../components/Customer/Filter/DefectFilterPopup';
import CameraFilterPopup from '../../components/Customer/Filter/CameraFilterPopup';
//더미데이터
import dummyDefectData from '../../data/dummyDefectData';
import { defectStats } from '../../data/dummyDefectData';



const Dashboard = () => {
  const [filter, setFilter] = useState({
    dates: [],
    orderType: '',
    cameraId: ''
  });

  const [openFilter, setOpenFilter] = useState(null);
  const [selectedDefects, setSelectedDefects] = useState([]);
  const [selectedCameras, setSelectedCameras] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);

  const handleReset = () => {
    setFilter({ dates: [], orderType: '', cameraId: '' });
    setSelectedDates([]);
    setSelectedDefects([]);
    setSelectedCameras([]);
    setOpenFilter(null);
  };

  const handleDateApply = (dates) => {
    setSelectedDates(dates);
    setFilter({ ...filter, dates });
    setOpenFilter(null);
  };

  const handleDefectApply = (orderType) => {
    setSelectedDefects(orderType.split(', '));
    setFilter({ ...filter, orderType });
    setOpenFilter(null);
  };

  const handleCameraApply = (cameraId) => {
    setSelectedCameras(cameraId.split(', '));
    setFilter({ ...filter, cameraId });
    setOpenFilter(null);
  };

  const filteredData = dummyDefectData.filter((defect) => {
    const dateMatch = selectedDates.length === 0 || selectedDates.some(date => {
      const defectDate = new Date(defect.timestamp);
      const filterDate = new Date(date);
      return defectDate.toDateString() === filterDate.toDateString();
    });

    const defectMatch = selectedDefects.length === 0 || 
      selectedDefects.some(type => defect.type.includes(type));

    const cameraMatch = selectedCameras.length === 0 || 
      selectedCameras.includes(defect.cameraId.toString());

    return dateMatch && defectMatch && cameraMatch;
  });

  return (
    <CustomerLayout>
      <div style={{ padding: '32px' }}>
        <div style={{ display: 'flex', gap: '24px' }}>

          {/* 왼쪽 요약 박스 */}
          <div className="customer-summary-box">
            <div className="summary-section">
              <h2>Today's Total defect count</h2>
              <h1>46</h1>
            </div>
            <div className="summary-section">
              <h2>Today's Most frequent defect</h2>
              <h1>Crack</h1>
            </div>
          </div>

          {/* 오른쪽 통계 박스 */}
          <div className="customer-stats-box">
            <p>Compared to the previous day</p>

            {defectStats.map((item, index) => (
              <div key={index} className="customer-stats-item">
                <div className="customer-color-circle" style={{ backgroundColor: item.class_color }}></div>

                <div className="customer-info">
                  <p>{item.class_name}</p>
                  <p className="customer-count">{item.count}</p>
                </div>

                <div className="customer-change" style={{ color: item.change > 0 ? '#D9534F' : item.change < 0 ? '#28A745' : '#888' }}>
                  {item.change > 0 ? `+${item.change}` : `${item.change}`}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 필터 UI 추가 */}
        <div className="customer-filter-ui">
            <span role="img" aria-label="filter">🔍</span> Filter By    
          <button onClick={() => setOpenFilter('date')} className="filter-btn">
            {filter.dates.length > 0 ? `${filter.dates.length} dates selected` : 'Select Date'}
            <span style={{ marginLeft: '10px' }}>⌄</span>
          </button>
          <button onClick={() => setOpenFilter('defect')} className="filter-btn">
            {filter.orderType || 'Order Type'}
            <span style={{ marginLeft: '10px' }}>⌄</span>
          </button>
          <button onClick={() => setOpenFilter('camera')} className="filter-btn">
            {filter.cameraId || 'Camera ID'}
            <span style={{ marginLeft: '10px' }}>⌄</span>
          </button>
          <button onClick={handleReset} className="reset-btn">
            <span role="img" aria-label="reset">↺</span> Reset Filter
          </button>
        </div>

        {openFilter === 'date' && (
          <DateFilterPopup
            selected={filter.dates}
            onApply={handleDateApply}
            onClose={() => setOpenFilter(null)}
          />
        )}
        {openFilter === 'defect' && (
          <DefectFilterPopup
            selected={selectedDefects}
            onApply={(list) => {
              setSelectedDefects(list);
              handleDefectApply(list.join(', '));
            }}
            onClose={() => setOpenFilter(null)}
          />
        )}
        {openFilter === 'camera' && (
          <CameraFilterPopup
            selected={selectedCameras}
            onApply={(list) => {
              setSelectedCameras(list);
              handleCameraApply(list.join(', '));
            }}
            onClose={() => setOpenFilter(null)}
          />
        )}

        {/* 테이블 영역 */}
        <div style={{ marginTop: '32px' }}>
          <div
            className="customer-table-container"
            style={{
              maxHeight: '600px', 
              overflowY: 'auto',
              border: '1px solid #eee',
              borderRadius: '8px',
              background: '#fff'
            }}
          >
            <table className="customer-defect-table">
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
                {filteredData.map((defect) => (
                  <tr key={defect.id}>
                    <td>
                      <img 
                        src={defect.image}
                        alt={`defect-${defect.id}`}
                        className="customer-table-image"
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
                    <td>{defect.type.join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default Dashboard;