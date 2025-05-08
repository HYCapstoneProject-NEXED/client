import React, { useState, useEffect } from 'react';
import DateRangeFilter from '../../components/Customer/Filter/DateRangeFilter';
import DefectFilterPopup from '../../components/Customer/Filter/DefectFilterPopup';
import CameraFilterPopup from '../../components/Customer/Filter/CameraFilterPopup';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import dummyDefectData from '../../data/dummyDefectData';
import './DefectTrend.css';

const getRecentYears = (n = 10) => {
  const arr = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    arr.push((now.getFullYear() - i).toString());
  }
  return arr;
};
const getRecentMonths = (n = 24) => {
  const arr = [];
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth() + 1;
  for (let i = 0; i < n; i++) {
    arr.unshift(`${year}.${String(month).padStart(2, '0')}`);
    month--;
    if (month === 0) {
      month = 12;
      year--;
    }
  }
  return arr;
};
const getRecentWeeks = (n = 20) => {
  const arr = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    const year = d.getFullYear();
    const week = getWeekNumber(d);
    arr.push(`${year}-W${String(week).padStart(2, '0')}`);
  }
  return arr;
};
function getWeekNumber(d) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1)/7);
  return weekNo;
}
const getRecentDays = (n = 30) => {
  const arr = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    arr.push(d.toISOString().slice(0, 10));
  }
  return arr;
};

const DefectTrend = () => {
    // 필터 팝업 상태
    const [dateRangeOpen, setDateRangeOpen] = useState(false);
    const [dateRangeType, setDateRangeType] = useState('last7');
    const [customRange, setCustomRange] = useState({ start: null, end: null });
    const [defectPopupOpen, setDefectPopupOpen] = useState(false);
    const [cameraPopupOpen, setCameraPopupOpen] = useState(false);
    const [selectedDefects, setSelectedDefects] = useState([]);
    const [selectedCameras, setSelectedCameras] = useState([]);
    // 필터 적용 핸들러
    const handleDateRangeChange = (type) => {
      setDateRangeType(type);
      setDateRangeOpen(false);
      if (type !== 'custom') setCustomRange({ start: null, end: null });
    };
    const handleDefectFilter = (defects) => {
        setSelectedDefects(defects);
        setDefectPopupOpen(false);
    };
    const handleCameraFilter = (cameras) => {
        setSelectedCameras(cameras);
        setCameraPopupOpen(false);
    };
    const handleReset = () => {
        setDateRangeType('last7');
        setCustomRange({ start: null, end: null });
        setSelectedDefects([]);
        setSelectedCameras([]);
    };
    // x축 생성 및 데이터 필터링
    let xAxisData = [];
    if (dateRangeType === 'last7') xAxisData = getRecentDays(7);
    else if (dateRangeType === 'month') xAxisData = getRecentMonths(24);
    else if (dateRangeType === 'year') xAxisData = getRecentYears(10);
    else if (dateRangeType === 'week') xAxisData = getRecentWeeks(20);
    else if (dateRangeType === 'custom' && customRange.start && customRange.end) {
      const arr = [];
      let d = new Date(customRange.start);
      const end = new Date(customRange.end);
      while (d <= end) {
        arr.push(d.toISOString().slice(0, 10));
        d.setDate(d.getDate() + 1);
      }
      xAxisData = arr;
    }
    // 그래프 데이터 생성
    let chartData = [];
    if (dateRangeType === 'year') {
      chartData = xAxisData.map(yearStr => {
        const filtered = dummyDefectData.filter(defect => {
          const defectYear = new Date(defect.timestamp).getFullYear().toString();
          const yearMatch = defectYear === yearStr;
          const defectMatch = selectedDefects.length === 0 || selectedDefects.some(type => defect.type.includes(type));
          const cameraMatch = selectedCameras.length === 0 || selectedCameras.includes(defect.cameraId.toString());
          return yearMatch && defectMatch && cameraMatch;
        });
        return { year: yearStr, value: filtered.length };
      });
    } else if (dateRangeType === 'month') {
      chartData = xAxisData.map(monthStr => {
        const filtered = dummyDefectData.filter(defect => {
          const defectMonth = new Date(defect.timestamp).toISOString().slice(0, 7).replace('-', '.');
          const monthMatch = defectMonth === monthStr;
          const defectMatch = selectedDefects.length === 0 || selectedDefects.some(type => defect.type.includes(type));
          const cameraMatch = selectedCameras.length === 0 || selectedCameras.includes(defect.cameraId.toString());
          return monthMatch && defectMatch && cameraMatch;
        });
        return { month: monthStr, value: filtered.length };
      });
    } else if (dateRangeType === 'week') {
      chartData = xAxisData.map(weekStr => {
        const [year, week] = weekStr.split('-W');
        const filtered = dummyDefectData.filter(defect => {
          const d = new Date(defect.timestamp);
          const defectYear = d.getFullYear();
          const defectWeek = getWeekNumber(d);
          const weekMatch = defectYear.toString() === year && String(defectWeek).padStart(2, '0') === week;
          const defectMatch = selectedDefects.length === 0 || selectedDefects.some(type => defect.type.includes(type));
          const cameraMatch = selectedCameras.length === 0 || selectedCameras.includes(defect.cameraId.toString());
          return weekMatch && defectMatch && cameraMatch;
        });
        return { week: weekStr, value: filtered.length };
      });
    } else {
      chartData = xAxisData.map(dateStr => {
        const filtered = dummyDefectData.filter(defect => {
          const defectDate = defect.timestamp.slice(0, 10);
          const dateMatch = defectDate === dateStr;
          const defectMatch = selectedDefects.length === 0 || selectedDefects.some(type => defect.type.includes(type));
          const cameraMatch = selectedCameras.length === 0 || selectedCameras.includes(defect.cameraId.toString());
          return dateMatch && defectMatch && cameraMatch;
        });
        return { date: dateStr, value: filtered.length };
      });
    }
    // chartWidth 계산: x축 데이터 개수에 따라 최소 60px씩 할당, 카드보다 적으면 카드에 맞게
    const [chartWidth, setChartWidth] = useState(window.innerWidth - 100);
    const dynamicWidth = Math.max(chartWidth, chartData.length * 60);
    useEffect(() => {
        const handleResize = () => {
            setChartWidth(window.innerWidth - 100);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return (
        <>
            <div className="filters-card">
                <div className="customer-filter-ui">
                    <span role="img" aria-label="filter">🔍</span> Filter By    
                    <button onClick={() => setDateRangeOpen(true)} className="filter-btn">
                        {dateRangeType === 'last7' && 'Last 7 Days'}
                        {dateRangeType === 'month' && 'This Month'}
                        {dateRangeType === 'year' && 'This Year'}
                        {dateRangeType === 'week' && 'This Week'}
                        {dateRangeType === 'custom' && customRange.start && customRange.end ? `${customRange.start} ~ ${customRange.end}` : dateRangeType === 'custom' ? 'Custom' : ''}
                        <span style={{ marginLeft: '10px' }}>⌄</span>
                    </button>
                    <button onClick={() => setDefectPopupOpen(true)} className="filter-btn">
                        {selectedDefects.length ? selectedDefects.join(', ') : 'Order Type'}
                        <span style={{ marginLeft: '10px' }}>⌄</span>
                    </button>
                    <button onClick={() => setCameraPopupOpen(true)} className="filter-btn">
                        {selectedCameras.length ? selectedCameras.join(', ') : 'Camera ID'}
                        <span style={{ marginLeft: '10px' }}>⌄</span>
                    </button>
                    <button onClick={handleReset} className="reset-btn">
                        <span role="img" aria-label="reset">↺</span> Reset Filter
                    </button>
                </div>
                {dateRangeOpen && (
                  <div style={{ position: 'absolute', zIndex: 10 }}>
                    <DateRangeFilter value={dateRangeType} onChange={v => {
                      setDateRangeType(v);
                      setDateRangeOpen(false);
                      if (v !== 'custom') setCustomRange({ start: null, end: null });
                    }} />
                    {dateRangeType === 'custom' && (
                      <div style={{ marginTop: 16, background: '#fff', borderRadius: 8, boxShadow: '0 1px 6px rgba(0,0,0,0.07)', padding: 16 }}>
                        {/* TODO: 달력 컴포넌트로 교체 */}
                        <div>Custom Date Picker Here</div>
                        <button onClick={() => setCustomRange({ start: '2024-04-01', end: '2024-04-10' })}>임시: 4/1~4/10 선택</button>
                      </div>
                    )}
                  </div>
                )}
                {defectPopupOpen && (
                    <DefectFilterPopup
                        selected={selectedDefects}
                        onApply={handleDefectFilter}
                        onClose={() => setDefectPopupOpen(false)}
                    />
                )}
                {cameraPopupOpen && (
                    <CameraFilterPopup
                        selected={selectedCameras}
                        onApply={handleCameraFilter}
                        onClose={() => setCameraPopupOpen(false)}
                    />
                )}
            </div>
            <div className="chart-card line-chart-card">
                <div style={{ overflowX: 'auto', width: '100%' }}>
                    <LineChart
                        width={dynamicWidth}
                        height={300}
                        data={chartData}
                        margin={{ top: 5, right: 10, left: -30, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                        <XAxis 
                            dataKey={dateRangeType === 'year' ? 'year' : dateRangeType === 'month' ? 'month' : dateRangeType === 'week' ? 'week' : 'date'}
                            tick={{ fontSize: 12 }}
                            padding={{ left: 0, right: 0 }}
                            stroke="#999"
                        />
                        <YAxis 
                            domain={[0, 100]}
                            tick={{ fontSize: 12 }}
                            stroke="#999"
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip />
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#4D4DFF"
                            strokeWidth={1.5}
                            dot={{ r: 3, fill: "#4D4DFF" }}
                            activeDot={{ r: 5 }}
                        />
                    </LineChart>
                </div>
            </div>
        </>
    );
};

export default DefectTrend; 