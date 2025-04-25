/**
 * Annotator Dashboard Page
 * Displays overview of annotation tasks and their status
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronDown, FaTrash, FaEye } from 'react-icons/fa';
import useAnnotatorDashboard from '../../hooks/useAnnotatorDashboard';
import { 
  FILTER_TYPES, 
  DEFECT_TYPE_FILTERS, 
  STATUS_FILTERS, 
  CONFIDENCE_SCORE_FILTERS 
} from '../../constants/annotatorDashboardConstants';
import { extractNumericId } from '../../utils/annotatorDashboardUtils';
import DashboardSidebar from '../../components/Annotator/Sidebar/DashboardSidebar';
import DashboardHeader from '../../components/Annotator/Header/DashboardHeader';
import AnnotationTable from '../../components/Annotator/Table/AnnotationTable';
import './AnnotatorDashboard.css';

const AnnotatorDashboard = () => {
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState({});
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

  const handleViewSelectedDetails = () => {
    // 체크박스로 선택된 항목의 상세 페이지로 이동
    const selectedIds = Object.keys(selectedItems).filter(id => selectedItems[id]);
    
    if (selectedIds.length === 0) {
      alert('Please select an item to view details');
    } else if (selectedIds.length > 1) {
      alert('Please select only one item to view details');
    } else {
      // 선택된 항목이 하나인 경우 상세 페이지로 이동
      handleViewDetails(selectedIds[0]);
    }
  };

  const handleDeleteSelected = () => {
    // 체크박스로 선택된 항목들을 삭제하는 기능
    const selectedIds = Object.keys(selectedItems).filter(id => selectedItems[id]);
    
    if (selectedIds.length === 0) {
      alert('Please select at least one item to delete');
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} selected item(s)?`)) {
      selectedIds.forEach(id => handleDelete(id));
      setSelectedItems({});
    }
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
              <button className="retry-btn" onClick={refreshData}>Retry</button>
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
            
            {/* 진행률 현황 바 */}
            <div className="progress-section">
              <div className="progress-bar-container">
                <div 
                  className="progress-bar-completed" 
                  style={{ 
                    width: `${stats.total ? (stats.completed / stats.total) * 100 : 0}%` 
                  }}
                ></div>
                <div 
                  className="progress-bar-pending" 
                  style={{ 
                    width: `${stats.total ? (stats.pending / stats.total) * 100 : 0}%` 
                  }}
                ></div>
              </div>
              <div className="progress-percentage">
                {stats.total ? Math.round((stats.completed / stats.total) * 100) : 0}% completed
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
                  const newValue = window.prompt('Select defect type: all, scratch, dent, discoloration, contamination', filters[FILTER_TYPES.DEFECT_TYPE]);
                  if (newValue) {
                    handleFilterChange(FILTER_TYPES.DEFECT_TYPE, newValue);
                  }
                }}
              >
                <span>Defect Type</span>
                <FaChevronDown />
              </div>
            </div>
            
            <div className="filter-dropdown">
              <div 
                className="filter-input"
                onClick={() => {
                  // 추후 드롭다운 UI 구현
                  const newValue = window.prompt('Select status: all, completed, pending', filters[FILTER_TYPES.STATUS]);
                  if (newValue) {
                    handleFilterChange(FILTER_TYPES.STATUS, newValue);
                  }
                }}
              >
                <span>Status</span>
                <FaChevronDown />
              </div>
            </div>
            
            <div className="filter-dropdown">
              <div 
                className="filter-input"
                onClick={() => {
                  // 추후 드롭다운 UI 구현
                  const newValue = window.prompt('Select confidence score: all, high, medium, low', filters[FILTER_TYPES.CONFIDENCE_SCORE]);
                  if (newValue) {
                    handleFilterChange(FILTER_TYPES.CONFIDENCE_SCORE, newValue);
                  }
                }}
              >
                <span>Confidence Score</span>
                <FaChevronDown />
              </div>
            </div>
            
            <div className="filter-actions">
              <button className="view-details-btn" onClick={handleViewSelectedDetails}>
                <FaEye size={14} style={{ marginRight: '5px' }} />
                View Details
              </button>
              <button className="delete-btn" onClick={handleDeleteSelected}>
                <FaTrash size={14} style={{ marginRight: '5px' }} />
                Delete Selected
              </button>
            </div>
          </div>
          
          {/* Annotation Table */}
          <AnnotationTable 
            annotations={annotations}
            onViewDetails={handleViewDetails}
            onDelete={handleDelete}
            selectedItems={selectedItems}
            setSelectedItems={setSelectedItems}
          />
        </div>
      </div>
    </div>
  );
};

export default AnnotatorDashboard; 