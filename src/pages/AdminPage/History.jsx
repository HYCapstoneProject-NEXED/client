/**
 * Admin History Page
 * View annotator work history and track information
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../../components/Annotator/Header/DashboardHeader';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import { FaEye, FaCheck } from 'react-icons/fa';
import './AdminDashboard.css';
import './History.css';

/**
 * Admin history page component
 * Shows annotator work history
 */
const History = () => {
  const navigate = useNavigate();
  const [historyData, setHistoryData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState({
    annotator: false,
  });
  const [filters, setFilters] = useState({
    annotator: 'All',
  });
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock data for example purposes
  const mockData = [
    { id: 1, annotator: 'Woo', date: '2025-01-01', details: '/details/1' },
    { id: 2, annotator: 'Woo', date: '2025-01-01', details: '/details/2' },
    { id: 3, annotator: 'Woo', date: '2025-01-01', details: '/details/3' },
    { id: 4, annotator: 'Woo', date: '2025-01-01', details: '/details/4' },
    { id: 5, annotator: 'Woo', date: '2025-01-01', details: '/details/5' },
    { id: 6, annotator: 'Woo', date: '2025-01-01', details: '/details/6' },
    { id: 7, annotator: 'Kim', date: '2025-01-02', details: '/details/7' },
    { id: 8, annotator: 'Park', date: '2025-01-03', details: '/details/8' },
    { id: 9, annotator: 'Lee', date: '2025-01-03', details: '/details/9' },
    { id: 10, annotator: 'Choi', date: '2025-01-04', details: '/details/10' },
  ];

  // Extract unique values for annotator filter
  const annotators = ['All', ...new Set(mockData.map(item => item.annotator))];

  useEffect(() => {
    // Simulate API call to fetch history data
    setTimeout(() => {
      setHistoryData(mockData);
      setFilteredData(mockData);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    // Apply filters when they change
    let result = historyData;
    
    // Apply annotator filter
    if (filters.annotator !== 'All') {
      result = result.filter(item => item.annotator === filters.annotator);
    }
    
    // Apply date range filter
    if (dateRange.startDate && dateRange.endDate) {
      const start = new Date(dateRange.startDate);
      const end = new Date(dateRange.endDate);
      result = result.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= start && itemDate <= end;
      });
    }
    
    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(item => 
        String(item.id).toLowerCase().includes(term) || 
        item.annotator.toLowerCase().includes(term)
      );
    }
    
    // Sort by date in descending order (newest first)
    result = [...result].sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });
    
    setFilteredData(result);
  }, [filters, searchTerm, historyData, dateRange]);

  const handleViewDetails = (item) => {
    // Navigate to the annotator detail page with the item ID
    // We're using the numeric part of the ID for demo purposes
    const numericId = item.id;
    // Create an array with just this ID for the selectedIds query parameter
    // Add isAdmin=true to indicate we're viewing from admin mode (to hide edit/delete buttons)
    navigate(`/annotator/detail/${numericId}?selectedIds=${numericId}&isAdmin=true`);
  };

  const toggleFilter = (filter) => {
    setFilterOpen({
      ...filterOpen,
      [filter]: !filterOpen[filter]
    });
  };

  const handleFilterChange = (filter, value) => {
    setFilters({
      ...filters,
      [filter]: value
    });
    
    setFilterOpen({
      ...filterOpen,
      [filter]: false
    });
  };

  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="admin-dashboard-page">
      <AdminSidebar activeMenu="history" />
      
      <div className="main-content">
        <DashboardHeader title="Admin" />
        
        <div className="dashboard-content">
          <div className="admin-controls">
            <div>
              <h1>작업 히스토리</h1>
            </div>
          </div>
          
          <div className="history-container">
            {/* Left sidebar with filters and stats */}
            <div className="history-left-sidebar">
              {/* User filter */}
              <div className="sidebar-section">
                <h3>사용자 필터</h3>
                <div className="annotator-filter-list">
                  {annotators.map((annotator, index) => (
                    <div 
                      key={index} 
                      className={`annotator-filter-item ${annotator === filters.annotator ? 'selected' : ''}`}
                      onClick={() => handleFilterChange('annotator', annotator)}
                    >
                      {annotator === filters.annotator && <FaCheck className="check-icon" />}
                      <span>{annotator}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Annotator statistics */}
              <div className="sidebar-section">
                <h3>작업자별 통계</h3>
                <div className="workload-bars">
                  {annotators.filter(name => name !== 'All').map((annotator, index) => {
                    const count = filteredData.filter(item => item.annotator === annotator).length;
                    const percentage = Math.round((count / mockData.length) * 100);
                    
                    return (
                      <div key={index} className="workload-item">
                        <div className="workload-info">
                          <span className="annotator-name">{annotator}</span>
                          <span className="workload-count">{count} 작업</span>
                        </div>
                        <div className="workload-bar-container">
                          <div 
                            className="workload-bar"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            {/* Main content area */}
            <div className="history-main-content">
              {/* Search and date filters */}
              <div className="top-filters">
                <div className="search-box">
                  <input 
                    type="text" 
                    placeholder="Search by Data ID or Annotator..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="compact-date-filter">
                  <div className="date-input-group">
                    <label>시작일:</label>
                    <input 
                      type="date" 
                      name="startDate" 
                      value={dateRange.startDate}
                      onChange={handleDateRangeChange}
                    />
                  </div>
                  <div className="date-input-group">
                    <label>종료일:</label>
                    <input 
                      type="date" 
                      name="endDate" 
                      value={dateRange.endDate}
                      onChange={handleDateRangeChange}
                    />
                  </div>
                </div>
              </div>
              
              {/* Data table */}
              {loading ? (
                <div className="loading-indicator">
                  <div className="loader"></div>
                  <p>작업 기록을 불러오는 중...</p>
                </div>
              ) : (
                <>
                  {filteredData.length > 0 ? (
                    <div className="history-table-container">
                      <table className="assignment-table">
                        <thead>
                          <tr>
                            <th>Data ID</th>
                            <th>Annotator ID</th>
                            <th>Date</th>
                            <th className="text-right">View</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredData.map((item, index) => (
                            <tr key={index}>
                              <td className="camera-id-cell">{item.id}</td>
                              <td>{item.annotator}</td>
                              <td>{item.date}</td>
                              <td>
                                <button 
                                  className="view-button"
                                  onClick={() => handleViewDetails(item)}
                                >
                                  <FaEye /> 상세 보기
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="empty-list-message">
                      검색 조건에 맞는 작업 기록이 없습니다
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default History; 