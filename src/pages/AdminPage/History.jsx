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
import useHistoryControl from '../../hooks/useHistoryControl';
import AnnotationService from '../../services/AnnotationService';

/**
 * Admin history page component
 * Shows annotator work history
 */
const History = () => {
  const navigate = useNavigate();
  const [historyData, setHistoryData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [annotatorStats, setAnnotatorStats] = useState([]);
  const [annotatorList, setAnnotatorList] = useState([]);
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
  const [error, setError] = useState('');
  
  // Use history control to manage back navigation
  useHistoryControl();

  // Load annotator filter list on component mount
  useEffect(() => {
    const fetchAnnotatorList = async () => {
      try {
        const data = await AnnotationService.getAnnotatorFilterList();
        // Add "All" option to the list
        setAnnotatorList([{ user_id: -1, name: 'All' }, ...data]);
      } catch (err) {
        console.error('Error fetching annotator list:', err);
        setError('Failed to load annotator list');
      }
    };
    
    fetchAnnotatorList();
  }, []);

  // Fetch history data when filters change
  useEffect(() => {
    const fetchHistoryData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Prepare filter parameters
        const historyFilters = {
          start_date: dateRange.startDate || undefined,
          end_date: dateRange.endDate || undefined,
          user_name: filters.annotator !== 'All' ? filters.annotator : undefined,
          search: searchTerm || undefined,
          status: 'completed' // Always filter for completed status
        };
        
        // Fetch annotation history
        const historyData = await AnnotationService.getAnnotationHistory(historyFilters);
        setHistoryData(historyData);
        
        // Fetch worker summary stats
        const summaryFilters = {
          start_date: dateRange.startDate || undefined,
          end_date: dateRange.endDate || undefined,
          search: searchTerm || undefined,
          status: 'completed' // Always filter for completed status
        };
        
        // Add user_id to filters if specific annotator is selected
        if (filters.annotator !== 'All') {
          const selectedAnnotator = annotatorList.find(a => a.name === filters.annotator);
          if (selectedAnnotator) {
            summaryFilters.user_id = selectedAnnotator.user_id;
          }
        }
        
        const summaryData = await AnnotationService.getWorkerSummary(summaryFilters);
        setAnnotatorStats(summaryData);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching history data:', err);
        setError('Failed to load history data');
        setLoading(false);
      }
    };
    
    if (annotatorList.length > 0) {
      fetchHistoryData();
    }
  }, [filters, dateRange, searchTerm, annotatorList]);

  // Update filtered data when history data changes
  useEffect(() => {
    // Sort by date in descending order (newest first)
    const sortedData = [...historyData].sort((a, b) => {
      return new Date(b.annotation_date) - new Date(a.annotation_date);
    });
    
    setFilteredData(sortedData);
  }, [historyData]);

  const handleViewDetails = (item) => {
    // Navigate to the annotator detail page with the image ID
    navigate(`/annotator/detail/${item.image_id}?selectedIds=${item.image_id}&isAdmin=true`);
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

  // Function to get unique annotator names from history data
  const getAnnotatorNames = () => {
    return ['All', ...new Set(historyData.map(item => item.user_name))];
  };

  // Function to format date for display
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="admin-dashboard-page">
      <AdminSidebar activeMenu="history" />
      
      <div className="main-content">
        <DashboardHeader />
        
        <div className="dashboard-content">
          <div className="admin-controls">
            <div>
              <h1>작업 히스토리</h1>
            </div>
          </div>
          
          {error && (
            <div className="error-message">{error}</div>
          )}
          
          <div className="history-container">
            {/* Left sidebar with filters and stats */}
            <div className="history-left-sidebar">
              {/* User filter */}
              <div className="sidebar-section">
                <h3>사용자 필터</h3>
                <div className="annotator-filter-list">
                  {annotatorList.map((annotator) => (
                    <div 
                      key={annotator.user_id} 
                      className={`annotator-filter-item ${annotator.name === filters.annotator ? 'selected' : ''}`}
                      onClick={() => handleFilterChange('annotator', annotator.name)}
                    >
                      {annotator.name === filters.annotator && <FaCheck className="check-icon" />}
                      <span>{annotator.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Annotator statistics */}
              <div className="sidebar-section">
                <h3>작업자별 통계</h3>
                <div className="workload-bars">
                  {annotatorStats.map((stat, index) => {
                    // Calculate percentage of total work
                    const totalWork = annotatorStats.reduce((sum, item) => sum + item.work_count, 0);
                    const percentage = totalWork > 0 ? Math.round((stat.work_count / totalWork) * 100) : 0;
                    
                    return (
                      <div key={index} className="workload-item">
                        <div className="workload-info">
                          <span className="annotator-name">{stat.user_name}</span>
                          <span className="workload-count">{stat.work_count} 작업</span>
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
                    placeholder="Search by Image ID or Annotator..." 
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
                            <th>Image ID</th>
                            <th>Annotator</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th className="text-right">View</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredData.map((item, index) => (
                            <tr key={index}>
                              <td className="camera-id-cell">{item.image_id}</td>
                              <td>{item.user_name}</td>
                              <td>{formatDate(item.annotation_date)}</td>
                              <td>{item.image_status}</td>
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