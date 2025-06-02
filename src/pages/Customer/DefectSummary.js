import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import axios from 'axios';
import './DefectSummary.css';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://166.104.246.64:8000';

const DefectSummary = () => {
  const [defectTypeData, setDefectTypeData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [selectedDefect, setSelectedDefect] = useState('');

  useEffect(() => {
    const fetchDefectTypeData = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/annotations/statistics/defect-type`);
        const data = res.data.map(item => ({
          name: item.class_name,
          count: item.count,
          color: item.class_color,
          percentage: item.percentage
        }));
        
        setDefectTypeData(data);
        setSelectedDefect(data[0]?.name || '');
      } catch (err) {
        console.error('불량 통계 데이터를 불러오지 못했습니다:', err);
      }
    };

    const fetchWeeklyData = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/annotations/statistics/weekly-defect`);
        const raw = res.data.result;

        // 가능한 모든 class_name 추출
        const classNames = new Set();
        raw.forEach(dayData => {
          dayData.defect_counts.forEach(d => classNames.add(d.class_name));
        });

        const formatted = raw.map(dayData => {
          const dayObj = { day: dayData.day, total: dayData.total };
          classNames.forEach(name => {
            const found = dayData.defect_counts.find(d => d.class_name === name);
            dayObj[name] = found ? found.count : 0;
          });
          return dayObj;
        });

        setWeeklyData(formatted);
      } catch (err) {
        console.error('주간 결함 데이터 로딩 실패:', err);
      }
    };

    fetchDefectTypeData();
    fetchWeeklyData();
  }, []);

  const handleDefectSelect = (defectName) => {
    setSelectedDefect(defectName);
  };
  
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, value, name }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const defect = defectTypeData.find(d => d.name === name);
    const percentValue = defect ? defect.percentage.toFixed(1) : 0;

    // 텍스트 배경을 위한 계산
    const textWidth = percentValue.toString().length * 18; // 텍스트 크기에 맞춰 너비 증가
    const backgroundWidth = textWidth + 14; // 패딩도 약간 증가
    const backgroundHeight = 32; // 높이도 약간 증가

    return (
      <g>
        <rect
          x={x - backgroundWidth / 2}
          y={y - backgroundHeight / 2}
          width={backgroundWidth}
          height={backgroundHeight}
          fill="rgba(0, 0, 0, 0.5)"
          rx={4}
          ry={4}
        />
        <text
          x={x}
          y={y}
          fill="white"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={20}
          fontWeight="bold"
          style={{
            textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
          }}
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
                <PieChart width={350} height={350}>
                  <Pie
                    data={defectTypeData}
                    cx={175}
                    cy={175}
                    innerRadius={0}
                    outerRadius={165}
                    paddingAngle={2}
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
              barGap="10%"
              barCategoryGap="30%"
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
              {selectedDefect && (
                <Bar 
                  dataKey={selectedDefect} 
                  fill={selectedDefectColor} 
                  name={selectedDefect} 
                  radius={[5, 5, 0, 0]}
                  maxBarSize={20}
                />
              )}
            </BarChart>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DefectSummary; 