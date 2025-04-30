import React, { useState } from 'react';
import CustomerLayout from '../../components/Customer/CustomerLayout';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
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
          <div className="filters-container">
            <div>
              <label className="filter-label">Date Range</label>
              <select className="filter-select">
                <option>This Year</option>
                <option>Last Year</option>
                <option>Last 6 Months</option>
              </select>
            </div>
            <div>
              <label className="filter-label">Defect Type</label>
              <select className="filter-select">
                <option>All</option>
                <option>Scratch</option>
                <option>Particle</option>
                <option>Crack</option>
                <option>Burr</option>
              </select>
            </div>
            <div>
              <label className="filter-label">Camera ID</label>
              <select className="filter-select">
                <option>All</option>
                <option>Camera 1</option>
                <option>Camera 2</option>
                <option>Camera 3</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default Statistics;