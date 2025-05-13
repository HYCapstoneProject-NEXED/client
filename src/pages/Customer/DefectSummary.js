import React, { useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import './DefectSummary.css';

const defectTypeData = [
  { name: 'Scratch', color: '#7B84A1', count: 600 },
  { name: 'Burr', color: '#E07642', count: 60 },
  { name: 'Crack', color: '#E879D3', count: 1750 },
  { name: 'Particle', color: '#8BA2E5', count: 820 }
];
const totalDefects = defectTypeData.reduce((sum, d) => sum + d.count, 0);

const weeklyData = [
  { day: 'Sat', total: 50, scratch: 15, burr: 10, crack: 18, particle: 7 },
  { day: 'Sun', total: 35, scratch: 10, burr: 8, crack: 12, particle: 5 },
  { day: 'Mon', total: 32, scratch: 8, burr: 8, crack: 10, particle: 6 },
  { day: 'Tue', total: 48, scratch: 12, burr: 10, crack: 16, particle: 10 },
  { day: 'Wed', total: 38, scratch: 9, burr: 7, crack: 15, particle: 7 },
  { day: 'Thu', total: 38, scratch: 10, burr: 8, crack: 12, particle: 8 },
  { day: 'Fri', total: 40, scratch: 11, burr: 9, crack: 13, particle: 7 },
];

const DefectSummary = () => {
  const [selectedDefect, setSelectedDefect] = useState('Burr');
  
  const handleDefectSelect = (defectName) => {
    setSelectedDefect(defectName);
  };
  
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, value, name }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const defect = defectTypeData.find(d => d.name === name);
    const percentValue = ((defect.count / totalDefects) * 100).toFixed(0);
    return (
      <g>
        <text
          x={x}
          y={y}
          fill="white"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={20}
          fontWeight="bold"
        >
          {percentValue}%
        </text>
      </g>
    );
  };
  
  // Get the selected defect's color
  const selectedDefectColor = defectTypeData.find(d => d.name === selectedDefect)?.color || '#26B7B9';
  
  return (
    <div className="defect-summary-container">
      <div className="chart-container">
        <div className="chart-card">
          <h3 className="chart-title">Defect Type</h3>
          <div className="chart-content pie-content">
            <div className="pie-chart-wrapper">
              <div className="pie-chart-container">
                <PieChart width={250} height={250}>
                  <Pie
                    data={defectTypeData}
                    cx={125}
                    cy={125}
                    innerRadius={0}
                    outerRadius={100}
                    paddingAngle={0}
                    dataKey="count"
                    label={renderCustomizedLabel}
                    labelLine={false}
                    startAngle={90}
                    endAngle={-270}
                    onClick={(data) => handleDefectSelect(data.name)}
                  >
                    {defectTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </div>
              <div className="defect-legend-list">
                {defectTypeData.map((d) => (
                  <div
                    key={d.name}
                    className={`defect-legend-item ${selectedDefect === d.name ? 'selected' : ''}`}
                    onClick={() => handleDefectSelect(d.name)}
                  >
                    <span className="legend-color" style={{ backgroundColor: d.color }}></span>
                    <span className="legend-name">{d.name}</span>
                    <span className="legend-count">{d.count.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="chart-card">
          <h3 className="chart-title">Defect Proportion Chart</h3>
          <div className="chart-content bar-chart-content">
            <BarChart 
              width={700} 
              height={280} 
              data={weeklyData} 
              barGap="10%"             // 요일 내 막대 간 간격
              barCategoryGap="30%"     // 요일 간 그룹 간 간격
              margin={{ top: 20, right: 30, bottom: 20, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
              <XAxis 
                dataKey="day" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                domain={[0, 50]}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
              />
              <Tooltip />
              <Legend 
                align="right" 
                verticalAlign="top"
                iconType="circle"
                wrapperStyle={{ paddingBottom: '10px' }}
              />
              <Bar 
                dataKey="total" 
                fill="#3030D9" 
                name="total" 
                radius={[5, 5, 0, 0]} 
                maxBarSize={20}
              />
              <Bar 
                dataKey={selectedDefect.toLowerCase()} 
                fill={selectedDefectColor} 
                name={selectedDefect} 
                radius={[5, 5, 0, 0]}
                maxBarSize={20}
              />
            </BarChart>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DefectSummary; 