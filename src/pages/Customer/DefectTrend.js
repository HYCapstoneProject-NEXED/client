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
const getRecentMonths = () => {
  const arr = [];
  const now = new Date();
  for (let i = 0; i <= now.getMonth(); i++) {
    arr.push(`${now.getFullYear()}.${String(i + 1).padStart(2, '0')}`);
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
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  for (let d = startOfMonth; d <= now; d.setDate(d.getDate() + 1)) {
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
        setSelectedCameras([]);
    };
    const handleCameraFilter = (cameras) => {
        setSelectedCameras(cameras);
        setDefectPopupOpen(false);
        setSelectedDefects([]);
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
    else if (dateRangeType === 'month') xAxisData = getRecentDays(new Date().getDate());
    else if (dateRangeType === 'year') xAxisData = getRecentMonths();
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
    if (selectedDefects.length > 0) {
        chartData = selectedDefects.map(defectType => {
            return xAxisData.map(dateStr => {
                const filtered = dummyDefectData.filter(defect => {
                    const defectDate = defect.timestamp.slice(0, 10);
                    const dateMatch = defectDate === dateStr;
                    const defectMatch = defect.type.includes(defectType);
                    return dateMatch && defectMatch;
                });
                return { date: dateStr, value: filtered.length, type: defectType };
            });
        }).flat();
    } else if (selectedCameras.length > 0) {
        chartData = selectedCameras.map(cameraId => {
            return xAxisData.map(dateStr => {
                const filtered = dummyDefectData.filter(defect => {
                    const defectDate = defect.timestamp.slice(0, 10);
                    const dateMatch = defectDate === dateStr;
                    const cameraMatch = defect.cameraId.toString() === cameraId;
                    return dateMatch && cameraMatch;
                });
                return { date: dateStr, value: filtered.length, camera: cameraId };
            });
        }).flat();
    } else {
        chartData = xAxisData.map(dateStr => {
            const filtered = dummyDefectData.filter(defect => {
                const defectDate = defect.timestamp.slice(0, 10);
                const dateMatch = defectDate === dateStr;
                return dateMatch;
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
    const typeColors = {
        'Crack': '#FF0000',
        'Scratch': '#00FF00',
        'Burr': '#0000FF',
        'Particle': '#FFFF00'
    };
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
                            dataKey={dateRangeType === 'year' ? 'date' : dateRangeType === 'month' ? 'date' : dateRangeType === 'week' ? 'date' : 'date'}
                            tick={{ fontSize: 12 }}
                            padding={{ left: 0, right: 0 }}
                            stroke="#999"
                            tickFormatter={(value) => {
                                if (dateRangeType === 'year') return `${value.split('.')[1]}월`;
                                if (dateRangeType === 'month') return `${value.split('-')[2]}일`;
                                if (dateRangeType === 'week') return `W${value.split('-W')[1]}`;
                                return value;
                            }}
                        />
                        <YAxis 
                            domain={[0, Math.max(...chartData.map(d => d.value)) + 10]}
                            tick={{ fontSize: 12 }}
                            stroke="#999"
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip 
                            formatter={(value, name, props) => {
                                if (!Array.isArray(props.payload)) return [];
                                const total = props.payload.reduce((acc, curr) => acc + curr.value, 0);
                                return [
                                    `total: ${total}`,
                                    `선택한 결함: ${value}`
                                ];
                            }}
                            labelFormatter={(label) => `날짜: ${label}`}
                        />
                        {selectedDefects.length > 0 && selectedDefects.map((defectType, index) => (
                            <Line
                                key={index}
                                type="monotone"
                                dataKey="value"
                                data={chartData.filter(data => data.type === defectType)}
                                stroke={typeColors[defectType] || '#4D4DFF'}
                                strokeWidth={1.5}
                                dot={{ r: 3, fill: typeColors[defectType] || '#4D4DFF' }}
                                activeDot={{ r: 5 }}
                            />
                        ))}
                        {selectedCameras.length > 0 && selectedCameras.map((cameraId, index) => (
                            <Line
                                key={index}
                                type="monotone"
                                dataKey="value"
                                data={chartData.filter(data => data.camera === cameraId)}
                                stroke="#4D4DFF"
                                strokeWidth={1.5}
                                dot={{ r: 3, fill: "#4D4DFF" }}
                                activeDot={{ r: 5 }}
                            />
                        ))}
                        {selectedDefects.length === 0 && selectedCameras.length === 0 && (
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke="#4D4DFF"
                                strokeWidth={1.5}
                                dot={{ r: 3, fill: "#4D4DFF" }}
                                activeDot={{ r: 5 }}
                            />
                        )}
                    </LineChart>
                </div>
            </div>
        </>
    );
};

export default DefectTrend; 