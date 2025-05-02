import React, { useState, useEffect } from 'react';
import { FaCheck, FaClock } from 'react-icons/fa';
import { formatConfidenceScore, getStatusStyles } from '../../../utils/annotatorDashboardUtils';
import './AnnotationTable.css';

/**
 * 체크박스 컴포넌트 - 점(..)이 표시되는 문제를 해결하기 위한 분리된 컴포넌트
 */
const CheckboxCell = ({ checked, onChange }) => {
  return (
    <div className="checkbox-wrapper" onClick={(e) => e.stopPropagation()}>
      <input 
        type="checkbox" 
        checked={checked}
        onChange={onChange}
      />
    </div>
  );
};

/**
 * Annotation Table Component
 * Displays a table of annotations with filtering and sorting capabilities
 * 
 * @param {Object} props
 * @param {Array} props.annotations - List of annotations to display
 * @param {Function} props.onViewDetails - Function to call when a row is clicked
 * @param {Function} props.onDelete - Function to call when delete button is clicked
 * @param {Object} props.selectedItems - Object containing selected items with their IDs as keys
 * @param {Function} props.setSelectedItems - Function to update selected items
 */
const AnnotationTable = ({ 
  annotations, 
  onViewDetails, 
  onDelete, 
  selectedItems = {}, 
  setSelectedItems = null 
}) => {
  // 내부 상태 사용 여부 결정 (부모로부터 props가 전달되지 않은 경우 내부 상태 사용)
  const [internalSelectedItems, setInternalSelectedItems] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  
  // 실제 사용할 상태 및 setter 결정
  const effectiveSelectedItems = setSelectedItems ? selectedItems : internalSelectedItems;
  const effectiveSetSelectedItems = setSelectedItems || setInternalSelectedItems;

  // 모든 항목 선택/해제
  const handleSelectAll = (e) => {
    e.stopPropagation();
    const isChecked = e.target.checked;
    setSelectAll(isChecked);
    
    const newSelectedItems = {};
    if (isChecked) {
      annotations.forEach(item => {
        newSelectedItems[item.id] = true;
      });
    }
    effectiveSetSelectedItems(newSelectedItems);
  };

  // 개별 항목 선택/해제
  const handleSelectItem = (e, id) => {
    e.stopPropagation();
    
    // 이벤트 전파 중지 (클릭 하이라이트나 다른 이벤트 방지)
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
    
    effectiveSetSelectedItems(prev => {
      const newItems = { ...prev };
      newItems[id] = !prev[id];
      
      // selectAll 업데이트
      const allSelected = annotations.every(item => 
        newItems[item.id] === true
      );
    setSelectAll(allSelected);
      
      return newItems;
    });
  };

  // annotations가 변경될 때 선택 상태 초기화
  useEffect(() => {
    effectiveSetSelectedItems({});
    setSelectAll(false);
  }, [annotations, effectiveSetSelectedItems]);

  useEffect(() => {
    // 중복된 이벤트 리스너 제거
    // 부모 컴포넌트에서 이미 구현되어 있으므로 여기서는 불필요합니다
  }, []);
  
  // 행 클릭시 세부 정보 보기
  const handleRowClick = (id) => {
    // 선택된 항목이 없을 때만 세부 정보로 바로 이동 
    if (Object.keys(effectiveSelectedItems).filter(itemId => effectiveSelectedItems[itemId]).length === 0) {
      onViewDetails(id);
      }
    };

  /**
   * 상태에 맞는 스타일 및 아이콘을 렌더링합니다
   */
  const renderStatusTag = (status) => {
    let backgroundColor = "#E0E0E0";
    let textColor = "#555555";
    let icon = null;
    let displayText = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    
    if (status === "completed" || status === "Completed") {
      backgroundColor = "#E0F2F1";
      textColor = "#00B69B";
      icon = <FaCheck size={10} style={{ marginRight: '4px' }} />;
      displayText = "Completed";
    } else if (status === "pending" || status === "Pending") {
      backgroundColor = "#FFF8E1";
      textColor = "#FCAA0B";
      icon = <FaClock size={10} style={{ marginRight: '4px' }} />;
      displayText = "Pending";
    }
    
    return (
      <span 
        className="status-tag"
        style={{ 
          backgroundColor: backgroundColor,
          color: textColor,
          display: "inline-flex",
          alignItems: "center",
          padding: "4px 8px",
          borderRadius: "4px",
          fontSize: "12px",
          fontWeight: 600
        }}
      >
        {icon}
        {displayText}
      </span>
    );
  };

  return (
    <div className="annotation-table-container">
      {/* 고정된 테이블 헤더 */}
      <table className="annotation-table header-table">
        <colgroup>
          <col className="checkbox-col" />
          <col className="camera-id-col" />
          <col className="data-id-col" />
          <col className="confidence-col" />
          <col className="count-col" />
          <col className="status-col" />
        </colgroup>
        <thead>
          <tr>
            <th className="checkbox-col">
              <div className="select-control" onClick={(e) => e.stopPropagation()}>
                <CheckboxCell 
                  checked={selectAll}
                  onChange={handleSelectAll}
                />
              </div>
            </th>
            <th>CAMERA ID</th>
            <th>DATA ID</th>
            <th>CONF. SCORE (MIN)</th>
            <th>COUNT</th>
            <th className="status-selection-col">
              <div className="header-content">
                <span>STATUS</span>
                <span className="selection-info">
                  {annotations.length > 0 && 
                    `${Object.keys(effectiveSelectedItems).filter(id => effectiveSelectedItems[id]).length} of ${annotations.length} selected`
                  }
                </span>
              </div>
            </th>
          </tr>
        </thead>
      </table>
      
      {/* 스크롤 가능한 테이블 본문 */}
      <div className="table-body-container">
        <table className="annotation-table body-table">
          <colgroup>
            <col className="checkbox-col" />
            <col className="camera-id-col" />
            <col className="data-id-col" />
            <col className="confidence-col" />
            <col className="count-col" />
            <col className="status-col" />
          </colgroup>
          <tbody>
            {annotations.map((annotation) => (
              <tr 
                key={annotation.id} 
                onClick={() => handleRowClick(annotation.id)}
                className={effectiveSelectedItems[annotation.id] ? 'selected-row' : ''}
              >
                <td className="checkbox-col">
                  <div onClick={(e) => e.stopPropagation()}>
                  <CheckboxCell 
                    checked={!!effectiveSelectedItems[annotation.id]} 
                    onChange={(e) => handleSelectItem(e, annotation.id)}
                  />
                  </div>
                </td>
                <td>{annotation.cameraId}</td>
                <td>{annotation.id}</td>
                <td>{formatConfidenceScore(annotation.confidenceScore)}</td>
                <td>{annotation.defectCount}</td>
                <td>{renderStatusTag(annotation.status)}</td>
              </tr>
            ))}
            
            {annotations.length === 0 && (
              <tr>
                <td colSpan="6" className="no-data-message">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AnnotationTable; 