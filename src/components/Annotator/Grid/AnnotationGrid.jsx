import React, { useState, useEffect } from 'react';
import { FaCheck, FaClock } from 'react-icons/fa';
import { formatConfidenceScore } from '../../../utils/annotatorDashboardUtils';
import './AnnotationGrid.css';

/**
 * 체크박스 컴포넌트 - 분리된 컴포넌트
 */
const CheckboxCell = ({ checked, onChange, onClick }) => {
  return (
    <div className="grid-checkbox-wrapper">
      <input 
        type="checkbox" 
        checked={checked}
        onChange={onChange}
        onClick={onClick}
      />
    </div>
  );
};

/**
 * Annotation Grid Component
 * 썸네일 뷰로 데이터를 그리드 형태로 표시
 * 
 * @param {Object} props
 * @param {Array} props.annotations - List of annotations to display
 * @param {Function} props.onViewDetails - Function to call when a card is clicked
 * @param {Function} props.onDelete - Function to call when delete button is clicked
 * @param {Object} props.selectedItems - Object containing selected items with their IDs as keys
 * @param {Function} props.setSelectedItems - Function to update selected items
 */
const AnnotationGrid = ({ 
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
  const handleSelectAll = () => {
    const isAllSelected = !selectAll;
    setSelectAll(isAllSelected);
    
    const newSelectedItems = {};
    if (isAllSelected) {
      annotations.forEach(item => {
        newSelectedItems[item.id] = true;
      });
    }
    effectiveSetSelectedItems(newSelectedItems);
  };

  // 개별 항목 선택/해제
  const handleSelectItem = (e, id) => {
    e.stopPropagation();
    effectiveSetSelectedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
    
    // 모든 항목이 선택되었는지 확인
    const updatedSelectedItems = {
      ...effectiveSelectedItems,
      [id]: !effectiveSelectedItems[id]
    };
    
    const allSelected = annotations.every(item => updatedSelectedItems[item.id]);
    setSelectAll(allSelected);
  };

  // annotations가 변경될 때 선택 상태 초기화
  useEffect(() => {
    effectiveSetSelectedItems({});
    setSelectAll(false);
  }, [annotations, effectiveSetSelectedItems]);

  /**
   * 상태에 맞는 태그를 렌더링합니다
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
        className="grid-status-tag"
        style={{ 
          backgroundColor: backgroundColor,
          color: textColor
        }}
      >
        {icon}
        {displayText}
      </span>
    );
  };

  /**
   * 그리드 카드 렌더링
   */
  const renderCard = (annotation) => {
    const isSelected = !!effectiveSelectedItems[annotation.id];
    
    return (
      <div 
        key={annotation.id}
        className={`annotation-card ${isSelected ? 'selected' : ''}`}
        onClick={() => onViewDetails(annotation.id)}
      >
        <div className="annotation-card-header">
          <CheckboxCell 
            checked={isSelected}
            onChange={(e) => handleSelectItem(e, annotation.id)}
            onClick={(e) => e.stopPropagation()}
          />
          <div className="annotation-title">{annotation.id}</div>
        </div>
        
        <div className="annotation-card-image-container">
          {/* 여기에 실제 이미지가 들어갈 것입니다. 현재는 플레이스홀더로 대체 */}
          <div className="thumbnail-placeholder">
            <span>Image</span>
          </div>
        </div>
        
        <div className="card-content">
          <div className="card-info">
            <div className="info-item">
              <div className="info-label">Camera:</div>
              <div className="info-value">{annotation.cameraId}</div>
            </div>
            
            <div className="info-item">
              <div className="info-label">Confidence:</div>
              <div className="info-value">{formatConfidenceScore(annotation.confidenceScore)}</div>
            </div>
            
            <div className="info-item">
              <div className="info-label">Defects:</div>
              <div className="info-value">{annotation.defectCount}</div>
            </div>
          </div>
          
          <div className="annotation-card-footer">
            {renderStatusTag(annotation.status)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="annotation-grid-container">
      <div className="grid-actions">
        <div className="select-all-control">
          <CheckboxCell 
            checked={selectAll}
            onChange={handleSelectAll}
          />
          <span className="select-all-label">Select All</span>
        </div>
        
        <div className="grid-info">
          {annotations.length > 0 ? (
            <span>{Object.keys(effectiveSelectedItems).filter(id => effectiveSelectedItems[id]).length} of {annotations.length} selected</span>
          ) : (
            <span>No data available</span>
          )}
        </div>
      </div>
      
      <div className="grid-content">
        {annotations.length > 0 ? (
          <div className="annotation-grid">
            {annotations.map(renderCard)}
          </div>
        ) : (
          <div className="no-data-message">
            <p>No data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnotationGrid; 