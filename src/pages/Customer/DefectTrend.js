import React, { useState, useEffect } from 'react';
import DateRangeFilter from '../../components/Customer/Filter/DateRangeFilter';
import DefectFilterPopup from '../../components/Customer/Filter/DefectFilterPopup';
import CameraFilterPopup from '../../components/Customer/Filter/CameraFilterPopup';
import DateFilterPopup from '../../components/Customer/Filter/DateFilterPopup';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
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

// Updated to show current year's months from January to current month
const getRecentMonths = () => {
  const arr = [];
  const now = new Date();
  const year = now.getFullYear();
  
  // Get all months from January to current month
  for (let i = 0; i <= now.getMonth(); i++) {
    arr.push(`${year}.${String(i + 1).padStart(2, '0')}`);
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

// Updated to handle both month view and last 7 days view
const getRecentDays = (n = 30) => {
  const arr = [];
  const now = new Date();
  
  if (n === 7) {
    // Last 7 days (including today)
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      arr.push(d.toISOString().slice(0, 10));
    }
  } else {
    // This month (from 1st day to current day)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    for (let d = new Date(startOfMonth); d <= now; d.setDate(d.getDate() + 1)) {
      arr.push(new Date(d).toISOString().slice(0, 10));
    }
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
    const [customDatePickerOpen, setCustomDatePickerOpen] = useState(false);
    const [selectedDefects, setSelectedDefects] = useState([]);
    const [selectedCameras, setSelectedCameras] = useState([]);
    
    // 필터 적용 핸들러
    const handleDateRangeChange = (type) => {
      setDateRangeType(type);
      setDateRangeOpen(false);
      
      if (type === 'custom') {
        setCustomDatePickerOpen(true);
      } else {
        setCustomRange({ start: null, end: null });
      }
    };
    
    const handleCustomDateApply = (range) => {
      setCustomRange(range);
      setCustomDatePickerOpen(false);
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
    else if (dateRangeType === 'month') xAxisData = getRecentDays();
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
                    
                    // For year view, match by month
                    if (dateRangeType === 'year') {
                        const defectMonth = defectDate.slice(0, 7).replace('-', '.');
                        return defectMonth === dateStr && defect.type.includes(defectType);
                    }
                    
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
                    
                    // For year view, match by month
                    if (dateRangeType === 'year') {
                        const defectMonth = defectDate.slice(0, 7).replace('-', '.');
                        return defectMonth === dateStr && defect.cameraId.toString() === cameraId;
                    }
                    
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
                
                // For year view, match by month
                if (dateRangeType === 'year') {
                    const defectMonth = defectDate.slice(0, 7).replace('-', '.');
                    return defectMonth === dateStr;
                }
                
                const dateMatch = defectDate === dateStr;
                return dateMatch;
            });
            return { date: dateStr, value: filtered.length };
        });
    }
    
    // Calculate total defects for each date
    const totalDefectsByDate = {};
    xAxisData.forEach(dateStr => {
        let filtered = [];
        if (dateRangeType === 'year') {
            filtered = dummyDefectData.filter(defect => {
                const defectMonth = defect.timestamp.slice(0, 7).replace('-', '.');
                return defectMonth === dateStr;
            });
        } else {
            filtered = dummyDefectData.filter(defect => {
                const defectDate = defect.timestamp.slice(0, 10);
                return defectDate === dateStr;
            });
        }
        totalDefectsByDate[dateStr] = filtered.length;
    });
    
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
    
    // Format date for display based on filter type
    const formatDate = (dateStr) => {
        if (dateRangeType === 'year') {
            return `${dateStr.split('.')[0]}.${dateStr.split('.')[1]}`;
        } else if (dateRangeType === 'month' || dateRangeType === 'last7') {
            const date = new Date(dateStr);
            return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
        } else if (dateRangeType === 'week') {
            return dateStr;
        }
        return dateStr;
    };
    
    // Custom tooltip to show total and individual defect counts
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const date = formatDate(label);
            const totalDefects = totalDefectsByDate[label] || 0;
            
            return (
                <div className="custom-tooltip">
                    <p className="tooltip-date">{date}</p>
                    <p className="tooltip-total">Total: {totalDefects}</p>
                    {payload.map((entry, index) => (
                        <p key={index} className="tooltip-item" style={{ color: entry.stroke }}>
                            {entry.name}: {entry.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
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
                        {selectedDefects.length ? selectedDefects.join(', ') : 'Defect Type'}
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
                    <DateRangeFilter value={dateRangeType} onChange={handleDateRangeChange} />
                  </div>
                )}
                {customDatePickerOpen && (
                  <div style={{ position: 'absolute', zIndex: 10 }}>
                    <DateFilterPopup 
                      selected={customRange}
                      onApply={handleCustomDateApply}
                      onClose={() => setCustomDatePickerOpen(false)}
                    />
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
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
                        <XAxis 
                            dataKey="date"
                            tick={{ fontSize: 12 }}
                            padding={{ left: 10, right: 10 }}
                            stroke="#999"
                            tickFormatter={(value) => {
                                if (dateRangeType === 'year') {
                                    // Format: 2024.01, 2024.02, etc. -> display as 01, 02, etc.
                                    return value.split('.')[1];
                                } else if (dateRangeType === 'month') {
                                    // Format: 2024-05-01 -> display as 01
                                    return value.split('-')[2];
                                } else if (dateRangeType === 'last7') {
                                    // Format: 2024-05-01 -> display as 05.01
                                    const parts = value.split('-');
                                    return `${parts[1]}.${parts[2]}`;
                                } else if (dateRangeType === 'week') {
                                    return `W${value.split('-W')[1]}`;
                                }
                                return value;
                            }}
                        />
                        <YAxis 
                            domain={[0, 'dataMax + 20']}
                            tick={{ fontSize: 12 }}
                            stroke="#999"
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        {selectedDefects.length > 0 && selectedDefects.map((defectType, index) => (
                            <Line
                                key={index}
                                type="linear"
                                dataKey="value"
                                data={chartData.filter(data => data.type === defectType)}
                                stroke={typeColors[defectType] || '#4D4DFF'}
                                strokeWidth={2}
                                dot={{ r: 4, fill: typeColors[defectType] || '#4D4DFF', strokeWidth: 0 }}
                                activeDot={{ r: 6, fill: typeColors[defectType] || '#4D4DFF' }}
                                isAnimationActive={true}
                                name={defectType}
                            />
                        ))}
                        {selectedCameras.length > 0 && selectedCameras.map((cameraId, index) => (
                            <Line
                                key={index}
                                type="linear"
                                dataKey="value"
                                data={chartData.filter(data => data.camera === cameraId)}
                                stroke="#4D4DFF"
                                strokeWidth={2}
                                dot={{ r: 4, fill: "#4D4DFF", strokeWidth: 0 }}
                                activeDot={{ r: 6 }}
                                isAnimationActive={true}
                                name={`Camera ${cameraId}`}
                            />
                        ))}
                        {selectedDefects.length === 0 && selectedCameras.length === 0 && (
                            <Line
                                type="linear"
                                dataKey="value"
                                stroke="#4D4DFF"
                                strokeWidth={2}
                                dot={{ r: 4, fill: "#4D4DFF", strokeWidth: 0 }}
                                activeDot={{ r: 6 }}
                                isAnimationActive={true}
                                name="All Defects"
                            />
                        )}
                    </LineChart>
                </div>
            </div>
            <style jsx>{`
                .custom-tooltip {
                    background-color: white;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    padding: 10px;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                }
                .tooltip-date {
                    margin: 0 0 5px;
                    font-weight: bold;
                    border-bottom: 1px solid #eee;
                    padding-bottom: 5px;
                }
                .tooltip-total {
                    margin: 5px 0;
                    font-weight: bold;
                }
                .tooltip-item {
                    margin: 3px 0;
                }
            `}</style>
        </>
    );
};

export default DefectTrend; 