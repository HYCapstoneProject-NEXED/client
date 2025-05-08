import React, { useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import './DefectSummary.css';

const defectTypeData = [
  { name: 'Scratch', color: '#9DA4BE', count: 600 },
  { name: 'Particle', color: '#B5C7F9', count: 820 },
  { name: 'Crack', color: '#FFF3B0', count: 1750 },
  { name: 'Burr', color: '#FDE2E2', count: 220 }
];
const totalDefects = defectTypeData.reduce((sum, d) => sum + d.count, 0);

const weeklyData = [
  { day: 'Sat', total: 45, scratch: 15, particle: 10, crack: 8, burr: 12 },
  { day: 'Sun', total: 35, scratch: 10, particle: 8, crack: 9, burr: 8 },
  { day: 'Mon', total: 32, scratch: 8, particle: 9, crack: 8, burr: 7 },
  { day: 'Tue', total: 45, scratch: 12, particle: 11, crack: 11, burr: 11 },
  { day: 'Wed', total: 38, scratch: 11, particle: 12, crack: 9, burr: 6 },
  { day: 'Thu', total: 38, scratch: 9, particle: 10, crack: 10, burr: 9 },
  { day: 'Fri', total: 38, scratch: 10, particle: 11, crack: 9, burr: 8 },
];

const DefectSummary = () => {
  const [selectedDefect, setSelectedDefect] = useState('Burr');
  const handlePieClick = (data) => {
    setSelectedDefect(data.name);
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
  return (
    <div className="Statistics-charts-container" style={{ display: 'flex', flexDirection: 'row', gap: 40, justifyContent: 'center', alignItems: 'flex-start' }}>
      <div className="Statistics-chart-card pie" style={{ flex: 1, minWidth: 420, maxWidth: 520, padding: '32px 40px', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
        <div>
          <h3>Defect Type</h3>
          <PieChart width={250} height={250}>
            <Pie
              data={defectTypeData}
              cx={125}
              cy={125}
              innerRadius={0}
              outerRadius={110}
              paddingAngle={0}
              dataKey="count"
              label={renderCustomizedLabel}
              labelLine={false}
              startAngle={90}
              endAngle={-270}
            >
              {defectTypeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} cornerRadius={0} />
              ))}
            </Pie>
          </PieChart>
        </div>
        <div className="Statistics-defect-legend-list" style={{ marginLeft: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
          {defectTypeData.map((d, idx) => (
            <div
              key={d.name}
              className="Statistics-defect-legend-item"
              style={{ display: 'flex', alignItems: 'center', background: '#f3f3f3', borderRadius: 20, padding: '8px 18px', minWidth: 120, cursor: 'pointer', opacity: selectedDefect === d.name ? 1 : 0.7, border: selectedDefect === d.name ? '2px solid #a084ca' : '2px solid transparent' }}
              onClick={() => setSelectedDefect(d.name)}
            >
              <span style={{ display: 'inline-block', width: 24, height: 24, borderRadius: '50%', background: d.color, marginRight: 10, border: '2px solid #e0e0e0' }}></span>
              <span style={{ color: '#7b88a8', fontWeight: 600, fontSize: 18, marginRight: 8 }}>{d.name}</span>
              <span style={{ color: '#222', fontWeight: 700, fontSize: 22 }}>{d.count}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="Statistics-chart-card bar" style={{ flex: 2, minWidth: 500 }}>
        <h3>Defect Proportion Chart</h3>
        <BarChart 
          width={750} 
          height={350} 
          data={weeklyData} 
          barGap={40}
          barCategoryGap={200}
          margin={{ top: 20, right: 60, bottom: 20, left: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
          <XAxis 
            dataKey="day" 
            padding={{ left: 40, right: 40 }}
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
              fill={defectTypeData.find(d => d.name === selectedDefect)?.color || '#888'} 
              name={selectedDefect}
              radius={[5, 5, 0, 0]}
              maxBarSize={20}
            />
          )}
        </BarChart>
      </div>
    </div>
  );
};

export default DefectSummary; 