/**
 * Annotation Sidebar Component
 * Displays data information and defect list.
 */
import React, { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import './Sidebar.css';
import { DEFECT_TYPES, DEFECT_COLOR_CLASSES, LOADED_DEFECT_CLASSES } from '../../constants/annotationConstants';

/**
 * Annotation Sidebar Component
 * @param {Object} props - Component properties
 * @param {Object} props.dataInfo - Image/data information
 * @param {Array} props.defects - List of defects
 * @param {string} props.selectedDefect - Selected defect ID
 * @param {Object} props.selectedDefectDetail - Selected defect detailed information
 * @param {function} props.onDefectSelect - Defect selection handler
 * @param {function} props.onToolChange - Tool change handler
 * @param {Object} props.toolTypes - Tool type constants
 * @param {boolean} props.isCollapsed - Sidebar collapsed state
 * @param {function} props.onToggle - Sidebar toggle handler
 * @param {boolean} props.readOnly - Whether sidebar is in read-only mode
 * @param {Array} props.defectClasses - Available defect classes from DB
 */
const Sidebar = ({
  dataInfo,
  defects,
  selectedDefect,
  selectedDefectDetail,
  onDefectSelect,
  onToolChange,
  toolTypes,
  isCollapsed,
  onToggle,
  readOnly = false,
  defectClasses = []
}) => {
  // 사이드바 접힘/펼침 상태 - 외부에서 관리하도록 수정
  const [localIsCollapsed, setLocalIsCollapsed] = useState(isCollapsed || false);

  // props에서 isCollapsed가 변경되면 로컬 상태도 업데이트
  useEffect(() => {
    if (isCollapsed !== undefined) {
      setLocalIsCollapsed(isCollapsed);
    }
  }, [isCollapsed]);

  // 토글 버튼 클릭 핸들러
  const toggleSidebar = () => {
    const newCollapsedState = !localIsCollapsed;
    setLocalIsCollapsed(newCollapsedState);
    
    // 상위 컴포넌트에 변경된 상태 전달
    if (onToggle) {
      onToggle(newCollapsedState);
    }
  };

  // Select defect and activate hand tool
  const handleDefectSelect = (defectId) => {
    // 이미 선택된 defect를 다시 클릭하면 선택 해제 (토글 기능)
    if (selectedDefect === defectId) {
      onDefectSelect(null); // 선택 해제
      return;
    }
    
    // 새로운 defect 선택
    onDefectSelect(defectId);
    
    // Automatically activate hand tool when defect is selected
    if (onToolChange && toolTypes && !readOnly) {
      onToolChange(toolTypes.HAND);
    }
  };

  // Get the appropriate color class for a defect type
  const getDefectColorClass = (defectType) => {
    // DB에서 로드된 defect classes에서 먼저 확인
    const defectClass = defectClasses.find(dc => dc.class_name === defectType);
    if (defectClass) {
      // class_id 기반으로 CSS 클래스 반환
      return `annotator-defect-${defectClass.class_id}`;
    }

    // 이전 코드 로직 유지 (fallback)
    switch(defectType) {
      case 'Scratch':
        return 'annotator-defect-a';
      case 'Dent':
        return 'annotator-defect-b';
      case 'Discoloration':
        return 'annotator-defect-c';
      case 'Contamination':
        return 'annotator-defect-d';
      // 이전 유형 이름도 지원 (역호환성)
      case 'Defect_A':
        return 'annotator-defect-a';
      case 'Defect_B':
        return 'annotator-defect-b';
      case 'Defect_C':
        return 'annotator-defect-c';
      case 'Defect_D':
        return 'annotator-defect-d';
      default:
        return 'annotator-defect-a'; // 기본값
    }
  };

  // DB에서 로드된 defect 이름 또는 ID로 색상 가져오기
  const getDefectColor = (defectType) => {
    // 이름으로 찾기
    const defectClass = defectClasses.find(dc => dc.class_name === defectType);
    if (defectClass && defectClass.class_color) {
      return defectClass.class_color;
    }
    
    // 기본값 반환
    switch(defectType) {
      case 'Scratch': return '#00B69B';
      case 'Dent': return '#5A8CFF';
      case 'Discoloration': return '#EF3826';
      case 'Contamination': return '#FCAA0B';
      default: return '#00B69B';
    }
  };

  const getDefectTypeName = (defectType) => {
    // Map defect type to its display name
    switch (defectType) {
      case DEFECT_TYPES.SCRATCH:
        return "Scratch";
      case DEFECT_TYPES.DENT:
        return "Dent";
      case DEFECT_TYPES.DISCOLORATION:
        return "Discoloration";
      case DEFECT_TYPES.CONTAMINATION:
        return "Contamination";
      default:
        return defectType;
    }
  };

  return (
    <>
      <aside className={`annotator-sidebar ${localIsCollapsed ? 'collapsed' : ''} ${readOnly ? 'read-only' : ''}`}>
        {/* 사이드바 내용 */}
        <div className="sidebar-content">
          {/* Data Information Section */}
          <div className="annotator-data-info">
            <h2 className="section-title">Data Information</h2>
            
            <div className="data-info-grid">
              <div className="info-row">
                <span className="info-label">Data ID</span>
                <span className="info-value">{dataInfo.dataId}</span>
              </div>
              
              <div className="info-row">
                <span className="info-label">Confidence Score</span>
                <span className="info-value score">
                  {dataInfo.confidenceScore ? dataInfo.confidenceScore.toFixed(2) : '-'}
                </span>
              </div>
              
              <div className="info-row">
                <span className="info-label">State</span>
                <span className="info-value">{dataInfo.state}</span>
              </div>
              
              <div className="info-divider"></div>
              
              <div className="info-row timestamp">
                <span className="info-label">Data Capture Timestamp</span>
                <span className="info-value">{dataInfo.captureDate || '-'}</span>
              </div>
              
              <div className="info-row timestamp">
                <span className="info-label">Last Modified</span>
                <span className="info-value">{dataInfo.lastModified || '-'}</span>
              </div>
            </div>
          </div>

          {/* Traditional Selected Annotation Details (now hidden via CSS) */}
          {selectedDefectDetail && (
            <div className="annotator-defect-detail">
              <h2>Selected Annotation Details</h2>
              <div className="annotator-detail-item">
                <span className="detail-label">Annotation ID:</span>
                <span className="detail-value">{selectedDefectDetail.id}</span>
              </div>
              <div className="annotator-detail-item">
                <span className="detail-label">Defect Type:</span>
                <span className="detail-value">
                  <span 
                    className={`detail-color-dot ${getDefectColorClass(selectedDefectDetail.type)}`}
                    style={{ backgroundColor: selectedDefectDetail.color || getDefectColor(selectedDefectDetail.type) }}
                  ></span>
                  {selectedDefectDetail.type}
                </span>
              </div>
              <div className="annotator-detail-item">
                <span className="detail-label">Confidence Score:</span>
                <span className="detail-value confidence">{selectedDefectDetail.confidence === null || selectedDefectDetail.confidence === 0.9 ? '-' : selectedDefectDetail.confidence.toFixed(2)}</span>
              </div>
              <div className="annotator-detail-item">
                <span className="detail-label">Position:</span>
                <span className="detail-value">
                  {`(${Math.round(selectedDefectDetail.coordinates.x)}, ${Math.round(selectedDefectDetail.coordinates.y)})`}
                </span>
              </div>
              <div className="annotator-detail-item">
                <span className="detail-label">Size:</span>
                <span className="detail-value">
                  {`${Math.round(selectedDefectDetail.coordinates.width)} x ${Math.round(selectedDefectDetail.coordinates.height)}`}
                </span>
              </div>
            </div>
          )}

          {/* Defect List Section */}
          <div className="annotator-defect-list-container">
            <h2>Defect List</h2>
            <ul className="annotator-defect-list">
              {defects.map((defect) => (
                <li 
                  key={defect.id} 
                  data-id={defect.id}
                  className={`annotator-defect-item ${selectedDefect === defect.id ? 'selected' : ''} ${readOnly ? 'read-only' : ''}`}
                  onClick={() => handleDefectSelect(defect.id)}
                >
                  <div 
                    className={`annotator-defect-color ${getDefectColorClass(defect.type)}`}
                    style={{ backgroundColor: defect.color || getDefectColor(defect.type) }}
                  ></div>
                  <span className="annotator-defect-id">#{defect.id}</span>
                  <span className="annotator-defect-name">{getDefectTypeName(defect.type)}</span>
                  <span className="annotator-confidence">{defect.confidence === null || defect.confidence === 0.9 ? '-' : defect.confidence.toFixed(2)}</span>
                  
                  {/* Toggle indicator icon - only shown in edit mode */}
                  {!readOnly && (
                    <span className="toggle-indicator">
                      {selectedDefect === defect.id ? <FaChevronUp /> : <FaChevronDown />}
                    </span>
                  )}
                  
                  {/* Inline detail information container */}
                  {selectedDefect === defect.id && selectedDefectDetail && !readOnly && (
                    <div className="defect-detail-inline">
                      <div className="detail-item-inline">
                        <span className="detail-label-inline">Annotation ID:</span>
                        <span className="detail-value-inline">{selectedDefectDetail.id}</span>
                      </div>
                      <div className="detail-item-inline">
                        <span className="detail-label-inline">Defect Type:</span>
                        <span className="detail-value-inline">
                          <span 
                            className={`detail-color-dot ${getDefectColorClass(selectedDefectDetail.type)}`}
                            style={{ backgroundColor: selectedDefectDetail.color || getDefectColor(selectedDefectDetail.type) }}
                          ></span>
                          {selectedDefectDetail.type}
                        </span>
                      </div>
                      <div className="detail-item-inline">
                        <span className="detail-label-inline">Confidence Score:</span>
                        <span className="detail-value-inline confidence">{selectedDefectDetail.confidence === null || selectedDefectDetail.confidence === 0.9 ? '-' : selectedDefectDetail.confidence.toFixed(2)}</span>
                      </div>
                      <div className="detail-item-inline">
                        <span className="detail-label-inline">Position:</span>
                        <span className="detail-value-inline">
                          {`(${Math.round(selectedDefectDetail.coordinates.x)}, ${Math.round(selectedDefectDetail.coordinates.y)})`}
                        </span>
                      </div>
                      <div className="detail-item-inline">
                        <span className="detail-label-inline">Size:</span>
                        <span className="detail-value-inline">
                          {`${Math.round(selectedDefectDetail.coordinates.width)} x ${Math.round(selectedDefectDetail.coordinates.height)}`}
                        </span>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
          
          {/* Last Modified information (only shown in read-only mode) */}
          {readOnly && (
            <div className="annotation-last-modified">
              Annotation Last Modified: {dataInfo.lastModified || '2024.12.12'}
            </div>
          )}
        </div>
      </aside>
      
      {/* 토글 버튼 - 사이드바 외부에 위치 */}
      <div 
        className={`sidebar-toggle-btn ${readOnly ? 'read-only' : ''}`}
        onClick={toggleSidebar}
        title={localIsCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {localIsCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
      </div>
    </>
  );
};

export default Sidebar;