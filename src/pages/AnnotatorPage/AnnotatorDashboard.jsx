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
import AnnotationService from '../../services/AnnotationService';

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
    defectClasses,
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
    // 범위가 없거나 빈 객체이면 'all'로 처리
    if (!range || Object.keys(range).length === 0) {
      handleFilterChange(FILTER_TYPES.CONFIDENCE_SCORE, 'all');
    } else {
      // 사용자가 직접 입력한 범위 값 사용
      handleFilterChange(FILTER_TYPES.CONFIDENCE_SCORE, range);
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
      // 객체인 경우 (사용자가 직접 입력한 범위)
      if (typeof value === 'object') {
        const min = value.min !== undefined ? `${Math.round(value.min * 100)}%` : '0%';
        const max = value.max !== undefined ? `${Math.round(value.max * 100)}%` : '100%';
        return `${min} ~ ${max}`;
      }
      // 문자열인 경우 (미리 정의된 범위 - high, medium, low)
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
    
    if (window.confirm(`정말로 선택한 ${selectedIds.length}개의 이미지를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
      // 이미지 ID 추출 (IMG_001 형식에서 숫자만 추출)
      const numericIds = selectedIds
        .map(id => extractNumericId(id))
        .filter(id => id !== null);
      
      if (numericIds.length === 0) {
        alert('유효한 이미지 ID가 없습니다.');
        return;
      }
      
      // 한번에 여러 이미지 삭제 API 호출
      AnnotationService.deleteImages(numericIds)
        .then(response => {
          if (response.success) {
            console.log('이미지 삭제 성공:', response);
            alert(`${response.deleted_ids.length}개의 이미지가 삭제되었습니다.`);
            setSelectedItems({});  // 선택 상태 초기화
            refreshData();  // 데이터 새로고침
          } else {
            console.error('이미지 삭제 실패:', response.message);
            alert(`이미지 삭제에 실패했습니다: ${response.message}`);
          }
        })
        .catch(error => {
          console.error('이미지 삭제 중 오류 발생:', error);
          alert('이미지 삭제 중 오류가 발생했습니다.');
        });
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
  
  // DEFECT_TYPE_FILTERS에서 결함 클래스 ID와 일치하는지 확인하는 함수
  const mapDefectClassIdToFilterId = (classId) => {
    // 기본 필터 ID가 있는지 확인
    const matchingFilter = DEFECT_TYPE_FILTERS.find(f => f.id === classId.toString().toLowerCase());
    if (matchingFilter) {
      return matchingFilter.id;
    }
    // 없으면 classId를 문자열로 변환하여 반환
    return classId.toString();
  };

  if (isLoading) {
    return (
      <div className="annotator-dashboard-page" ref={dashboardRef}>
        <DashboardSidebar activeMenu="dashboard" />
        
        <div className="main-content">
          <DashboardHeader />
          
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
          <DashboardHeader />
          
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
        <DashboardHeader />
        
        <div className="dashboard-content">
          <h2 className="section-title">Current Task</h2>
          
          {/* Task Statistics Card - 사용자 ID 2 기준의 Task 통계 */}
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
                  // 실제 API에서 가져온 결함 클래스를 사용
                  options={defectClasses && defectClasses.length > 0 ? defectClasses : DEFECT_TYPE_FILTERS.filter(f => f.id !== 'all').map(f => ({ class_id: f.id, class_name: f.label }))}
                  selectedOptions={
                    filters[FILTER_TYPES.DEFECT_TYPE] === 'all' 
                      ? [] 
                      : Array.isArray(filters[FILTER_TYPES.DEFECT_TYPE])
                        ? filters[FILTER_TYPES.DEFECT_TYPE].map(id => 
                            // defectClasses에서 찾아보고 없으면 그대로 사용
                            defectClasses.find(dc => dc.class_id.toString() === id)
                              ? id
                              : id
                          )
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
                /* 사용자 ID 2 기준으로 /annotations/list/{user_id} API를 사용하여 데이터 가져옴 */
                <AnnotationTable 
                  annotations={annotations}
                  onViewDetails={handleViewDetails}
                  onDelete={handleDelete}
                  selectedItems={selectedItems}
                  setSelectedItems={setSelectedItems}
                />
              ) : (
                /* 사용자 ID 2 기준으로 /annotations/list/{user_id} API를 사용하여 데이터 가져옴 */
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