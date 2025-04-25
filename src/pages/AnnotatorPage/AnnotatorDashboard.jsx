/**
 * Annotator Dashboard Page
 * Displays overview of annotation tasks and their status
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronDown } from 'react-icons/fa';
import useAnnotatorDashboard from '../../hooks/useAnnotatorDashboard';
import { 
  FILTER_TYPES, 
  DEFECT_TYPE_FILTERS, 
  STATUS_FILTERS, 
  CONFIDENCE_SCORE_FILTERS 
} from '../../constants/annotatorDashboardConstants';
import { formatConfidenceScore, getStatusStyles, extractNumericId } from '../../utils/annotatorDashboardUtils';
import DashboardSidebar from '../../components/Annotator/Sidebar/DashboardSidebar';
import DashboardHeader from '../../components/Annotator/Header/DashboardHeader';
import './AnnotatorDashboard.css';

const AnnotatorDashboard = () => {
  const navigate = useNavigate();
  const { 
    annotations,
    isLoading,
    error,
    stats,
    filters,
    handleFilterChange,
    handleDelete,
    refreshData
  } = useAnnotatorDashboard();
  
  const handleViewDetails = (id) => {
    // Extract numeric ID from formatted ID (e.g., IMG_001 -> 1)
    const numericId = extractNumericId(id);
    if (numericId !== null) {
      navigate(`/annotator/detail/${numericId}`);
    } else {
      console.error(`Invalid ID format: ${id}`);
    }
  };
  
  const handleDeleteClick = (id, event) => {
    event.stopPropagation();
    handleDelete(id);
  };
  
  if (isLoading) {
    return (
      <div className="annotator-dashboard-page">
        <DashboardSidebar activeMenu="dashboard" />
        
        <div className="main-content">
          <DashboardHeader title="Annotator" />
          
          <div className="dashboard-content">
            <h2 className="section-title">Current Task</h2>
            <div className="loading-container">
              <div className="loader"></div>
              <p>Loading annotation data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="annotator-dashboard-page">
        <DashboardSidebar activeMenu="dashboard" />
        
        <div className="main-content">
          <DashboardHeader title="Annotator" />
          
          <div className="dashboard-content">
            <h2 className="section-title">Current Task</h2>
            <div className="error-container">
              <p className="error-message">{error}</p>
              <button className="retry-btn" onClick={refreshData}>다시 시도</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="annotator-dashboard-page">
      <DashboardSidebar activeMenu="dashboard" />
      
      <div className="main-content">
        <DashboardHeader title="Annotator" />
        
        <div className="dashboard-content">
          <h2 className="section-title">Current Task</h2>
          
          {/* Task Statistics Card */}
          <div className="task-stats-card">
            <div className="stats-item">
              <div className="stats-label">Total datas</div>
              <div className="stats-value">{stats.total}</div>
            </div>
            
            <div className="task-distribution">
              <div className="task-type">
                <div className="color-dot completed-dot"></div>
                <div className="task-type-info">
                  <div className="task-type-label">Completed Tasks</div>
                  <div className="task-type-value">{stats.completed}</div>
                </div>
              </div>
              
              <div className="task-type">
                <div className="color-dot pending-dot"></div>
                <div className="task-type-info">
                  <div className="task-type-label">Pending Tasks</div>
                  <div className="task-type-value">{stats.pending}</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Filters */}
          <div className="annotation-filters">
            <div className="filter-dropdown">
              <div 
                className="filter-input"
                onClick={() => {
                  // 추후 드롭다운 UI 구현
                  const newValue = window.prompt('결함 유형을 선택하세요: all, scratch, dent, discoloration, contamination', filters[FILTER_TYPES.DEFECT_TYPE]);
                  if (newValue) {
                    handleFilterChange(FILTER_TYPES.DEFECT_TYPE, newValue);
                  }
                }}
              >
                <span>
                  {DEFECT_TYPE_FILTERS.find(f => f.id === filters[FILTER_TYPES.DEFECT_TYPE])?.label || '모든 유형'}
                </span>
                <FaChevronDown />
              </div>
            </div>
            
            <div className="filter-dropdown">
              <div 
                className="filter-input"
                onClick={() => {
                  // 추후 드롭다운 UI 구현
                  const newValue = window.prompt('상태를 선택하세요: all, completed, pending', filters[FILTER_TYPES.STATUS]);
                  if (newValue) {
                    handleFilterChange(FILTER_TYPES.STATUS, newValue);
                  }
                }}
              >
                <span>
                  {STATUS_FILTERS.find(f => f.id === filters[FILTER_TYPES.STATUS])?.label || '모든 상태'}
                </span>
                <FaChevronDown />
              </div>
            </div>
            
            <div className="filter-dropdown">
              <div 
                className="filter-input"
                onClick={() => {
                  // 추후 드롭다운 UI 구현
                  const newValue = window.prompt('신뢰도 점수를 선택하세요: all, high, medium, low', filters[FILTER_TYPES.CONFIDENCE_SCORE]);
                  if (newValue) {
                    handleFilterChange(FILTER_TYPES.CONFIDENCE_SCORE, newValue);
                  }
                }}
              >
                <span>
                  {CONFIDENCE_SCORE_FILTERS.find(f => f.id === filters[FILTER_TYPES.CONFIDENCE_SCORE])?.label || '모든 점수'}
                </span>
                <FaChevronDown />
              </div>
            </div>
            
            <button className="view-details-btn" onClick={refreshData}>View Details</button>
          </div>
          
          {/* Annotation Table */}
          <div className="annotation-table-container">
            <table className="annotation-table">
              <thead>
                <tr>
                  <th className="checkbox-col">
                    <input type="checkbox" />
                  </th>
                  <th>Camera</th>
                  <th>DATA ID</th>
                  <th>CONFIDENCE SCORE(MIN)</th>
                  <th>COUNT</th>
                  <th>STATUS</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {annotations.map((annotation) => (
                  <tr key={annotation.id} onClick={() => handleViewDetails(annotation.id)}>
                    <td className="checkbox-col">
                      <input type="checkbox" onClick={(e) => e.stopPropagation()} />
                    </td>
                    <td>{annotation.cameraId}</td>
                    <td>{annotation.id}</td>
                    <td>{formatConfidenceScore(annotation.confidenceScore)}</td>
                    <td>{annotation.defectCount}</td>
                    <td>
                      <span 
                        className="status-tag"
                        style={{ 
                          backgroundColor: getStatusStyles(annotation.status).backgroundColor,
                          color: getStatusStyles(annotation.status).color
                        }}
                      >
                        {getStatusStyles(annotation.status).text}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="delete-btn"
                        onClick={(e) => handleDeleteClick(annotation.id, e)}
                      >
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
                
                {annotations.length === 0 && (
                  <tr>
                    <td colSpan="7" className="no-data-message">
                      표시할 데이터가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnotatorDashboard; 