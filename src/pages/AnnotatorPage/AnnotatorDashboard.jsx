/**
 * Annotator Dashboard Page
 * Displays overview of annotation tasks and their status
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronDown, FaTrash, FaEye, FaThList, FaTh } from 'react-icons/fa';
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
import AnnotationGrid from '../../components/Annotator/Grid/AnnotationGrid';
import DefectTypeFilter from '../../components/Annotator/Filter/DefectTypeFilter';
import StatusFilter from '../../components/Annotator/Filter/StatusFilter';
import ConfidenceScoreFilter from '../../components/Annotator/Filter/ConfidenceScoreFilter';
import './AnnotatorDashboard.css';

const AnnotatorDashboard = () => {
  // 대시보드 타이틀
  const dashboardTitle = "Annotator Dashboard";
  
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState({});
  const [viewMode, setViewMode] = useState('list'); // 'list' 또는 'thumbnail' 모드
  const [isTransitioning, setIsTransitioning] = useState(false);
  const dashboardRef = useRef(null);
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
  
  // 필터 팝업 상태
  const [openFilter, setOpenFilter] = useState({
    defectType: false,
    status: false,
    confidenceScore: false
  });
  
  // 외부 클릭 감지를 위한 refs
  const filterRefs = {
    defectType: useRef(null),
    status: useRef(null),
    confidenceScore: useRef(null)
  };

  // Disable browser back button on dashboard (improved implementation)
  useEffect(() => {
    // This function will be called when the back button is pressed
    const preventBackNavigation = (e) => {
      // Cancel the event
      e.preventDefault();
      // Push a new state to history to prevent going back
      window.history.pushState(null, '', window.location.pathname);
    };
    
    // Push two states to the history stack
    // This ensures there's always a state to go back to, triggering our handler
    window.history.pushState(null, '', window.location.pathname);
    window.history.pushState(null, '', window.location.pathname);
    
    // Add event listener for popstate (back button) events
    window.addEventListener('popstate', preventBackNavigation);
    
    // Cleanup
    return () => {
      window.removeEventListener('popstate', preventBackNavigation);
    };
  }, []);

  // 필터 팝업 토글 함수
  const toggleFilter = (filterName, event) => {
    // 이벤트 객체가 있으면 이벤트 전파 중지
    if (event) {
      event.stopPropagation();
    }
    
    // 현재 필터의 열림/닫힘 상태를 반전
    setOpenFilter(prev => ({
      defectType: false,
      status: false,
      confidenceScore: false,
      [filterName]: !prev[filterName]
    }));
  };

  // 모든 필터 팝업 닫기
  const closeAllFilters = () => {
    setOpenFilter({
      defectType: false,
      status: false,
      confidenceScore: false
    });
  };

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event) => {
      // 클릭한 요소가 필터 드롭다운이나 팝업 내부인지 확인
      let isInsideAnyFilter = false;
      
      // 필터 레퍼런스 확인
      Object.values(filterRefs).forEach(ref => {
        if (ref.current && ref.current.contains(event.target)) {
          isInsideAnyFilter = true;
        }
      });

      // 필터 외부를 클릭한 경우에만 닫기
      if (!isInsideAnyFilter) {
        closeAllFilters();
      }
    };

    // document 레벨에서 클릭 이벤트 감지
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []); // 의존성 배열을 비워서 한 번만 이벤트 리스너를 등록

  // 필터 적용 함수
  const applyDefectTypeFilter = (selected) => {
    // 선택된 항목이 없으면 'all'로 처리, 아니면 선택된 항목의 배열을 그대로
    const newValue = !selected || selected.length === 0 ? 'all' : selected;
    handleFilterChange(FILTER_TYPES.DEFECT_TYPE, newValue);
    closeAllFilters();
  };

  const applyStatusFilter = (selected) => {
    // 선택된 항목이 없으면 'all'로 처리, 아니면 선택된 항목의 배열을 그대로
    const newValue = !selected || selected.length === 0 ? 'all' : selected;
    handleFilterChange(FILTER_TYPES.STATUS, newValue);
    closeAllFilters();
  };

  const applyConfidenceScoreFilter = (range) => {
    // 범위가 없거나 빈 값이면 'all'로 처리
    if (!range || (!range.min && !range.max)) {
      handleFilterChange(FILTER_TYPES.CONFIDENCE_SCORE, 'all');
    } else {
      // 범위에 따라 적절한 필터 값을 설정
      let filterValue = 'all';
      if (range.min >= 0.8 || (range.min && !range.max)) {
        filterValue = 'high';
      } else if (range.min >= 0.5 || (range.min && range.max && range.max < 0.8)) {
        filterValue = 'medium';
      } else if (range.max && range.max <= 0.5) {
        filterValue = 'low';
      }
      
      handleFilterChange(FILTER_TYPES.CONFIDENCE_SCORE, filterValue);
    }
    closeAllFilters();
  };

  // 필터 값 표시 텍스트 반환
  const getDisplayText = (filterType) => {
    const value = filters[filterType];
    if (value === 'all') return 'All';
    
    if (filterType === FILTER_TYPES.DEFECT_TYPE || filterType === FILTER_TYPES.STATUS) {
      // 배열인 경우 처리
      if (Array.isArray(value)) {
        if (value.length === 1) {
          // 하나만 선택된 경우 해당 옵션의 레이블 표시
          const filterOptions = filterType === FILTER_TYPES.DEFECT_TYPE 
            ? DEFECT_TYPE_FILTERS 
            : STATUS_FILTERS;
          const option = filterOptions.find(opt => opt.id === value[0]);
          return option ? option.label : 'All';
        } else {
          // 두 개 이상 선택된 경우 개수 표시
          return `${value.length} selected`;
        }
      }
      
      // 이전 버전 호환성을 위한 코드 (문자열인 경우)
      const filterOptions = filterType === FILTER_TYPES.DEFECT_TYPE 
        ? DEFECT_TYPE_FILTERS 
        : STATUS_FILTERS;
      const option = filterOptions.find(opt => opt.id === value);
      return option ? option.label : 'All';
    } else if (filterType === FILTER_TYPES.CONFIDENCE_SCORE) {
      const option = CONFIDENCE_SCORE_FILTERS.find(opt => opt.id === value);
      return option ? option.label : 'All';
    }
    
    return 'All';
  };

  // 페이지 레이아웃 일관성 유지
  useEffect(() => {
    const ensureLayout = () => {
      // 대시보드 요소가 항상 꽉 차도록 스타일 적용
      const dashboard = dashboardRef.current;
      if (dashboard) {
        const content = dashboard.querySelector('.dashboard-content');
        const viewContainer = dashboard.querySelector('.view-container');
        const gridOrTable = viewContainer?.firstElementChild;
        
        if (content) {
          content.style.width = '100%';
        }
        
        if (viewContainer) {
          viewContainer.style.width = '100%';
          viewContainer.style.flex = '1';
        }
        
        if (gridOrTable) {
          gridOrTable.style.width = '100%';
        }
      }
    };

    ensureLayout();
    window.addEventListener('resize', ensureLayout);
    
    // 초기 로드 및 뷰 모드 변경 후 추가 레이아웃 고정
    const fixLayoutTimer = setTimeout(ensureLayout, 300);
    const secondFixTimer = setTimeout(ensureLayout, 1000);

    return () => {
      window.removeEventListener('resize', ensureLayout);
      clearTimeout(fixLayoutTimer);
      clearTimeout(secondFixTimer);
    };
  }, [viewMode, isLoading, error]);

  const handleViewDetails = (id) => {
    // Extract numeric ID from formatted ID (e.g., IMG_001 -> 1)
    const numericId = extractNumericId(id);
    if (numericId !== null) {
      navigate(`/annotator/detail/${numericId}`);
    } else {
      console.error(`Invalid ID format: ${id}`);
    }
  };

  // 체크박스로 선택된 항목(들)의 상세 페이지로 이동
  const handleViewSelectedDetails = () => {
    // 체크박스로 선택된 항목의 상세 페이지로 이동
    const selectedIds = Object.keys(selectedItems).filter(id => selectedItems[id]);
    
    if (selectedIds.length === 0) {
      alert('Please select at least one item to view details');
      return;
    }
    
    // 선택된 모든 이미지의 ID를 쿼리 파라미터로 전달
    const numericIds = selectedIds
      .map(id => extractNumericId(id))
      .filter(id => id !== null);
    
    if (numericIds.length === 0) {
      alert('Invalid selected items. Please try again.');
      return;
    }
    
    // 첫 번째 이미지의 상세 페이지로 이동하면서 선택된 모든 이미지 ID를 쿼리 파라미터로 전달
    navigate(`/annotator/detail/${numericIds[0]}?selectedIds=${numericIds.join(',')}`);
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

  // 뷰 모드 전환 함수
  const toggleViewMode = (mode) => {
    if (mode === viewMode) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      setViewMode(mode);
      setSelectedItems({});
      
      setTimeout(() => {
        setIsTransitioning(false);
      }, 100);
    }, 150);
  };
  
  if (isLoading) {
    return (
      <div className="annotator-dashboard-page" ref={dashboardRef}>
        <DashboardSidebar activeMenu="dashboard" />
        
        <div className="main-content">
          <DashboardHeader title={dashboardTitle} />
          
          <div className="dashboard-loading">
            <div className="loader"></div>
            <p>Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="annotator-dashboard-page" ref={dashboardRef}>
        <DashboardSidebar activeMenu="dashboard" />
        
        <div className="main-content">
          <DashboardHeader title={dashboardTitle} />
          
          <div className="dashboard-error">
            <p className="error-message">{error}</p>
            <button className="retry-btn" onClick={refreshData}>Retry</button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="annotator-dashboard-page" ref={dashboardRef}>
      <DashboardSidebar activeMenu="dashboard" />
      
      <div className="main-content">
        <DashboardHeader title={dashboardTitle} />
        
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
            <div 
              className="filter-dropdown" 
              ref={filterRefs.defectType}
            >
              <div 
                className="filter-input"
                onClick={(e) => toggleFilter('defectType', e)}
              >
                <span>Defect Type: {getDisplayText(FILTER_TYPES.DEFECT_TYPE)}</span>
                <FaChevronDown size={14} />
              </div>
              
              {openFilter.defectType && (
                <DefectTypeFilter
                  options={DEFECT_TYPE_FILTERS.filter(f => f.id !== 'all').map(f => f.id)}
                  selectedOptions={
                    filters[FILTER_TYPES.DEFECT_TYPE] === 'all' 
                      ? [] 
                      : Array.isArray(filters[FILTER_TYPES.DEFECT_TYPE])
                        ? filters[FILTER_TYPES.DEFECT_TYPE]
                        : [filters[FILTER_TYPES.DEFECT_TYPE]]
                  }
                  onApply={applyDefectTypeFilter}
                  onClose={() => setOpenFilter(prev => ({...prev, defectType: false}))}
                />
              )}
            </div>
            
            <div 
              className="filter-dropdown" 
              ref={filterRefs.status}
            >
              <div 
                className="filter-input"
                onClick={(e) => toggleFilter('status', e)}
              >
                <span>Status: {getDisplayText(FILTER_TYPES.STATUS)}</span>
                <FaChevronDown size={14} />
              </div>
              
              {openFilter.status && (
                <StatusFilter
                  options={STATUS_FILTERS.filter(f => f.id !== 'all').map(f => f.id)}
                  selectedOptions={
                    filters[FILTER_TYPES.STATUS] === 'all' 
                      ? [] 
                      : Array.isArray(filters[FILTER_TYPES.STATUS])
                        ? filters[FILTER_TYPES.STATUS]
                        : [filters[FILTER_TYPES.STATUS]]
                  }
                  onApply={applyStatusFilter}
                  onClose={() => setOpenFilter(prev => ({...prev, status: false}))}
                />
              )}
            </div>
            
            <div 
              className="filter-dropdown" 
              ref={filterRefs.confidenceScore}
            >
              <div 
                className="filter-input"
                onClick={(e) => toggleFilter('confidenceScore', e)}
              >
                <span>Confidence Score: {getDisplayText(FILTER_TYPES.CONFIDENCE_SCORE)}</span>
                <FaChevronDown size={14} />
              </div>
              
              {openFilter.confidenceScore && (
                <ConfidenceScoreFilter
                  range={
                    filters[FILTER_TYPES.CONFIDENCE_SCORE] === 'all' 
                    ? { min: '', max: '' }
                    : (() => {
                        const filter = CONFIDENCE_SCORE_FILTERS.find(
                          f => f.id === filters[FILTER_TYPES.CONFIDENCE_SCORE]
                        );
                        return filter ? { min: filter.min, max: filter.max } : { min: '', max: '' };
                      })()
                  }
                  onApply={applyConfidenceScoreFilter}
                  onClose={() => setOpenFilter(prev => ({...prev, confidenceScore: false}))}
                />
              )}
            </div>
            
            {/* 뷰 모드 전환 버튼 */}
            <div className="view-mode-buttons">
              <button 
                className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => toggleViewMode('list')}
                title="List View"
              >
                <FaThList size={18} />
              </button>
              <button 
                className={`view-mode-btn ${viewMode === 'thumbnail' ? 'active' : ''}`}
                onClick={() => toggleViewMode('thumbnail')}
                title="Thumbnail View"
              >
                <FaTh size={18} />
              </button>
            </div>
            
            <div className="filter-actions">
              <button 
                className="view-details-btn" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleViewSelectedDetails();
                }}
              >
                <FaEye size={14} style={{ marginRight: '5px' }} />
                View Details
              </button>
              <button 
                className="delete-btn" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDeleteSelected();
                }}
              >
                <FaTrash size={14} style={{ marginRight: '5px' }} />
                Delete Selected
              </button>
            </div>
          </div>
          
          {/* 뷰 모드에 따라 다른 컴포넌트 렌더링 */}
          <div className={`view-container ${isTransitioning ? 'transitioning' : ''}`}>
            {annotations.length === 0 ? (
              <div className="no-results-message">
                <div className="no-results-icon">🔍</div>
                <h3>No matching results found</h3>
                <p>Try changing your filter criteria or clear all filters to see all data.</p>
                <button 
                  className="clear-filters-btn"
                  onClick={() => {
                    handleFilterChange(FILTER_TYPES.DEFECT_TYPE, 'all');
                    handleFilterChange(FILTER_TYPES.STATUS, 'all');
                    handleFilterChange(FILTER_TYPES.CONFIDENCE_SCORE, 'all');
                  }}
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              viewMode === 'list' ? (
                <AnnotationTable 
                  annotations={annotations}
                  onViewDetails={handleViewDetails}
                  onDelete={handleDelete}
                  selectedItems={selectedItems}
                  setSelectedItems={setSelectedItems}
                />
              ) : (
                <AnnotationGrid 
                  annotations={annotations}
                  onViewDetails={handleViewDetails}
                  onDelete={handleDelete}
                  selectedItems={selectedItems}
                  setSelectedItems={setSelectedItems}
                />
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnotatorDashboard; 