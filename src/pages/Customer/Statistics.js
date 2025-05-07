import React, { useState, useEffect } from 'react';
import CustomerLayout from '../../components/Customer/CustomerLayout';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
import DateFilterPopup from '../../components/Customer/Filter/DateFilterPopup';
import DefectFilterPopup from '../../components/Customer/Filter/DefectFilterPopup';
import CameraFilterPopup from '../../components/Customer/Filter/CameraFilterPopup';
import './Statistics.css';

const Statistics = () => {
    // 결함 유형 데이터
    const defectTypeData = [
      { name: 'Scratch', value: 25, label: 'Scratch\n25%' },
      { name: 'Particle', value: 25, label: 'Particle\n25%' },
      { name: 'Crack', value: 32, label: 'Crack\n32%' },
      { name: 'Burr', value: 18, label: 'Burr\n18%' },
    ];
  
    // 주간 데이터
    const weeklyData = [
      { day: 'Sat', total: 45, scratch: 15, particle: 10, crack: 8, burr: 12 },
      { day: 'Sun', total: 35, scratch: 10, particle: 8, crack: 9, burr: 8 },
      { day: 'Mon', total: 32, scratch: 8, particle: 9, crack: 8, burr: 7 },
      { day: 'Tue', total: 45, scratch: 12, particle: 11, crack: 11, burr: 11 },
      { day: 'Wed', total: 38, scratch: 11, particle: 12, crack: 9, burr: 6 },
      { day: 'Thu', total: 38, scratch: 9, particle: 10, crack: 10, burr: 9 },
      { day: 'Fri', total: 38, scratch: 10, particle: 11, crack: 9, burr: 8 },
    ];
  
    // 파이 차트 색상
    const COLORS = ['#9DA4BE', '#8884d8', '#E991FF', '#FF8042'];
  
    // 선택된 결함 유형 상태
    const [selectedDefect, setSelectedDefect] = useState('Burr');
  
    // 파이 차트 클릭 핸들러
    const handlePieClick = (data) => {
      setSelectedDefect(data.name);
    };
  
    // 결함 유형별 색상
    const defectColors = {
      Scratch: '#9DA4BE',
      Particle: '#8884d8',
      Crack: '#E991FF',
      Burr: '#FF8042'
    };
  
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, value, name }) => {
      const RADIAN = Math.PI / 180;
      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
      const x = cx + radius * Math.cos(-midAngle * RADIAN);
      const y = cy + radius * Math.sin(-midAngle * RADIAN);
  
      return (
        <g>
          <text
            x={x}
            y={y-6}
            fill="white"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={14}
            fontWeight="bold"
          >
            {value}%
          </text>
          <text
            x={x}
            y={y+8}
            fill="white"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={12}
          >
            {name}
          </text>
        </g>
      );
    };

    // 필터 팝업 상태 추가
    const [datePopupOpen, setDatePopupOpen] = useState(false);
    const [defectPopupOpen, setDefectPopupOpen] = useState(false);
    const [cameraPopupOpen, setCameraPopupOpen] = useState(false);
    
    // 선택된 필터 값들
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedDefects, setSelectedDefects] = useState([]);
    const [selectedCameras, setSelectedCameras] = useState([]);

    // 필터 적용 핸들러
    const handleDateFilter = (date) => {
        setSelectedDate(date);
        setDatePopupOpen(false);
    };

    const handleDefectFilter = (defects) => {
        setSelectedDefects(defects);
        setDefectPopupOpen(false);
    };

    const handleCameraFilter = (cameras) => {
        setSelectedCameras(cameras);
        setCameraPopupOpen(false);
    };

    // 월별 데이터 추가
    const monthlyData = [
        { month: '2024.01', value: 80 },
        { month: '2024.02', value: 68 },
        { month: '2024.03', value: 75 },
        { month: '2024.04', value: 70 },
        { month: '2024.05', value: 65 },
        { month: '2024.06', value: 60 },
        { month: '2024.07', value: 55 },
        { month: '2024.08', value: 62 },
        { month: '2024.09', value: 53 },
        { month: '2024.10', value: 48 },
        { month: '2024.11', value: 43 },
        { month: '2024.12', value: 38 },
    ];

    const [chartWidth, setChartWidth] = useState(window.innerWidth - 100);

    useEffect(() => {
        const handleResize = () => {
            setChartWidth(window.innerWidth - 100);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <CustomerLayout>
            <div className="statistics-container">
                <div className="charts-container">
                    <div className="chart-card">
                        <h3>Defect Type</h3>
                        <PieChart width={350} height={250}>
                            <Pie
                                data={defectTypeData}
                                cx={175}
                                cy={125}
                                innerRadius={0}
                                outerRadius={110}
                                paddingAngle={0}
                                dataKey="value"
                                onClick={handlePieClick}
                                label={renderCustomizedLabel}
                                labelLine={false}
                                startAngle={90}
                                endAngle={-270}
                            >
                                {defectTypeData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={defectColors[entry.name]} cornerRadius={0} />
                                ))}
                            </Pie>
                        </PieChart>
                    </div>
                    <div className="chart-card">
                        <h3>Defect Proportion Chart</h3>
                        <BarChart 
                            width={750} 
                            height={350} 
                            data={weeklyData} 
                            barGap={40}
                            barCategoryGap={120}
                            margin={{ top: 20, right: 60, bottom: 20, left: 60 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                            <XAxis 
                                dataKey="day" 
                                padding={{ left: 100, right: 100 }}
                                tick={{ fontSize: 14 }}
                            />
                            <YAxis 
                                domain={[0, 50]}
                                tick={{ fontSize: 14 }}
                            />
                            <Tooltip />
                            <Legend align="right" verticalAlign="top" />
                            <Bar 
                                dataKey="total" 
                                fill="#4D4DFF" 
                                name="total" 
                                radius={[5, 5, 0, 0]} 
                                maxBarSize={20}
                            />
                            {selectedDefect && (
                                <Bar 
                                    dataKey={selectedDefect.toLowerCase()} 
                                    fill={defectColors[selectedDefect]} 
                                    name={selectedDefect}
                                    radius={[5, 5, 0, 0]}
                                    maxBarSize={20}
                                />
                            )}
                        </BarChart>
                    </div>
                </div>
                <div className="filters-card">
                    <div className="statistics-filters-container">
                        <div>
                            <label className="statistics-filter-label">Date Range</label>
                            <button 
                                className="statistics-filter-button" 
                                onClick={() => setDatePopupOpen(true)}
                            >
                                {selectedDate || 'Select Date'}
                            </button>
                            {datePopupOpen && (
                                <DateFilterPopup
                                    onApply={handleDateFilter}
                                    onClose={() => setDatePopupOpen(false)}
                                />
                            )}
                        </div>
                        <div>
                            <label className="statistics-filter-label">Defect Type</label>
                            <button 
                                className="statistics-filter-button" 
                                onClick={() => setDefectPopupOpen(true)}
                            >
                                {selectedDefects.length ? selectedDefects.join(', ') : 'Select Defects'}
                            </button>
                            {defectPopupOpen && (
                                <DefectFilterPopup
                                    selected={selectedDefects}
                                    onApply={handleDefectFilter}
                                    onClose={() => setDefectPopupOpen(false)}
                                />
                            )}
                        </div>
                        <div>
                            <label className="statistics-filter-label">Camera ID</label>
                            <button 
                                className="statistics-filter-button" 
                                onClick={() => setCameraPopupOpen(true)}
                            >
                                {selectedCameras.length ? selectedCameras.join(', ') : 'Select Cameras'}
                            </button>
                            {cameraPopupOpen && (
                                <CameraFilterPopup
                                    selected={selectedCameras}
                                    onApply={handleCameraFilter}
                                    onClose={() => setCameraPopupOpen(false)}
                                />
                            )}
                        </div>
                    </div>
                </div>
                <div className="chart-card line-chart-card">
                    <LineChart
                        width={chartWidth}
                        height={300}
                        data={monthlyData}
                        margin={{ top: 5, right: 10, left: -30, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                        <XAxis 
                            dataKey="month" 
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
        </CustomerLayout>
    );
};

export default Statistics;