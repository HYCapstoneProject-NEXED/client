/**
 * Annotation Sidebar Component
 * Displays data information and defect list.
 */
import React, { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight, FaChevronDown, FaChevronUp, FaCheck, FaClock } from 'react-icons/fa';
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
 * @param {function} props.onStatusChange - Status change handler
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
  defectClasses = [],
  onStatusChange
}) => {
  // 사이드바 접힘/펼침 상태 - 외부에서 관리하도록 수정
  const [localIsCollapsed, setLocalIsCollapsed] = useState(isCollapsed || false);
  // 상태 변경 드롭다운 표시 여부
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

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

    // 기본값으로 fallback (DB에서 찾지 못한 경우)
    switch(defectType) {
      case 'Scratch':
        return 'annotator-defect-1';
      case 'Dent':
        return 'annotator-defect-2';
      case 'Discoloration':
        return 'annotator-defect-3';
      case 'Contamination':
        return 'annotator-defect-4';
      default:
        return 'annotator-defect-1'; // 기본값은 Scratch
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

  // State 태그 클릭 핸들러
  const handleStateClick = () => {
    if (!readOnly && onStatusChange) {
      setShowStatusDropdown(!showStatusDropdown);
    }
  };

  // 상태 변경 핸들러
  const handleStatusChange = (newStatus) => {
    if (onStatusChange) {
      onStatusChange(newStatus);
      setShowStatusDropdown(false);
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
                <span className="info-value">
                  {(() => {
                    const state = dataInfo.state;
                    let backgroundColor = "#E0E0E0";
                    let textColor = "#555555";
                    let icon = null;
                    
                    if (state === "Completed" || state === "completed") {
                      backgroundColor = "#E0F2F1";
                      textColor = "#00B69B";
                      icon = <FaCheck size={10} style={{ marginRight: '4px' }} />;
                    } else {
                      // Default is Pending
                      backgroundColor = "#FFF8E1";
                      textColor = "#FCAA0B";
                      icon = <FaClock size={10} style={{ marginRight: '4px' }} />;
                    }
                    
                    return (
                      <div
                        style={{
                          position: "relative",
                          display: "inline-block"
                        }}
                      >
                        <div 
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "12px",
                            fontWeight: 600,
                            backgroundColor: backgroundColor,
                            color: textColor,
                            cursor: !readOnly && onStatusChange ? "pointer" : "default"
                          }}
                          onClick={handleStateClick}
                          title={!readOnly ? "Click to change status" : undefined}
                        >
                          {icon}
                          {typeof state === 'string' ? (
                            state.charAt(0).toUpperCase() + state.slice(1).toLowerCase()
                          ) : state}
                        </div>
                        
                        {/* 상태 변경 드롭다운 메뉴 */}
                        {!readOnly && showStatusDropdown && (
                          <div style={{
                            position: "absolute",
                            top: "100%",
                            left: 0,
                            marginTop: "5px",
                            backgroundColor: "white",
                            borderRadius: "4px",
                            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.15)",
                            zIndex: 100,
                            width: "120px",
                            overflow: "hidden"
                          }}>
                            <div 
                              style={{
                                display: "flex",
                                alignItems: "center",
                                padding: "8px 10px",
                                fontSize: "12px",
                                fontWeight: 600,
                                backgroundColor: "#FFF8E1",
                                color: "#FCAA0B",
                                cursor: "pointer",
                                borderBottom: "1px solid rgba(0,0,0,0.05)"
                              }}
                              onClick={() => handleStatusChange('pending')}
                            >
                              <FaClock size={10} style={{ marginRight: '5px' }} /> Pending
                            </div>
                            <div 
                              style={{
                                display: "flex",
                                alignItems: "center",
                                padding: "8px 10px",
                                fontSize: "12px",
                                fontWeight: 600,
                                backgroundColor: "#E0F2F1",
                                color: "#00B69B",
                                cursor: "pointer"
                              }}
                              onClick={() => handleStatusChange('completed')}
                            >
                              <FaCheck size={10} style={{ marginRight: '5px' }} /> Completed
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </span>
              </div>
            </div>
          </div>

          {/* Traditional Selected Annotation Details (now hidden via CSS) */}
          {selectedDefectDetail && (
            <div className="annotator-defect-detail">
              <h2 style={{
                color: "#343C6A",
                fontSize: "18px",
                fontWeight: 700,
                fontFamily: "'Nunito Sans', sans-serif",
                margin: "0 0 16px 0",
                padding: "0 0 8px 0",
                borderBottom: "1px solid #e6e8eb"
              }}>Selected Annotation Details</h2>
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
            <h2 style={{
              color: "#343C6A",
              fontSize: "18px",
              fontWeight: 700,
              fontFamily: "'Nunito Sans', sans-serif",
              margin: "0 0 16px 0",
              padding: "0 0 8px 0",
              borderBottom: "1px solid #e6e8eb"
            }}>Defects List</h2>
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
                  
                  {/* Toggle indicator for read-only mode */}
                  {readOnly && (
                    <span className="toggle-indicator read-only">
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

                  {/* Inline detail information container for read-only mode */}
                  {selectedDefect === defect.id && selectedDefectDetail && readOnly && (
                    <div className="defect-detail-inline read-only">
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