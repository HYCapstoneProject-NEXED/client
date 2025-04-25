import React, { useState, useEffect } from 'react';
import { FaCheck, FaClock } from 'react-icons/fa';
import { formatConfidenceScore, getStatusStyles } from '../../../utils/annotatorDashboardUtils';
import './AnnotationTable.css';

/**
 * Annotation Table Component
 * Displays a table of annotations with filtering and sorting capabilities
 * 
 * @param {Object} props
 * @param {Array} props.annotations - List of annotations to display
 * @param {Function} props.onViewDetails - Function to call when a row is clicked
 * @param {Function} props.onDelete - Function to call when delete button is clicked
 */
const AnnotationTable = ({ annotations, onViewDetails, onDelete }) => {
  const [selectedItems, setSelectedItems] = useState({});
  const [selectAll, setSelectAll] = useState(false);

  // 모든 항목 선택/해제
  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    setSelectAll(isChecked);
    
    const newSelectedItems = {};
    if (isChecked) {
      annotations.forEach(item => {
        newSelectedItems[item.id] = true;
      });
    }
    setSelectedItems(newSelectedItems);
  };

  // 개별 항목 선택/해제
  const handleSelectItem = (e, id) => {
    e.stopPropagation();
    setSelectedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
    
    // 모든 항목이 선택되었는지 확인
    const updatedSelectedItems = {
      ...selectedItems,
      [id]: !selectedItems[id]
    };
    
    const allSelected = annotations.every(item => updatedSelectedItems[item.id]);
    setSelectAll(allSelected);
  };

  // annotations가 변경될 때 선택 상태 초기화
  useEffect(() => {
    setSelectedItems({});
    setSelectAll(false);
  }, [annotations]);

  // 부모 컴포넌트에 선택된 항목 전달
  useEffect(() => {
    // 버튼 클릭 이벤트 핸들러
    const handleDeleteSelected = () => {
      const selectedIds = Object.keys(selectedItems).filter(id => selectedItems[id]);
      if (selectedIds.length > 0) {
        if (window.confirm(`Are you sure you want to delete ${selectedIds.length} selected item(s)?`)) {
          selectedIds.forEach(id => onDelete(id));
          setSelectedItems({});
          setSelectAll(false);
        }
      } else {
        alert('Please select at least one item to delete');
      }
    };

    // 삭제 버튼에 이벤트 리스너 추가
    const deleteButton = document.querySelector('.delete-btn');
    if (deleteButton) {
      deleteButton.addEventListener('click', handleDeleteSelected);
    }

    // 클린업 함수
    return () => {
      if (deleteButton) {
        deleteButton.removeEventListener('click', handleDeleteSelected);
      }
    };
  }, [selectedItems, onDelete]);

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
      <table className="annotation-table">
        <thead>
          <tr>
            <th className="checkbox-col">
              <input 
                type="checkbox" 
                checked={selectAll}
                onChange={handleSelectAll}
              />
            </th>
            <th>CAMERA ID</th>
            <th>DATA ID</th>
            <th>CONFIDENCE SCORE(MIN)</th>
            <th>COUNT</th>
            <th>STATUS</th>
          </tr>
        </thead>
        <tbody>
          {annotations.map((annotation) => (
            <tr 
              key={annotation.id} 
              onClick={() => onViewDetails(annotation.id)}
              className={selectedItems[annotation.id] ? 'selected-row' : ''}
            >
              <td className="checkbox-col">
                <input 
                  type="checkbox" 
                  checked={!!selectedItems[annotation.id]} 
                  onChange={(e) => handleSelectItem(e, annotation.id)}
                  onClick={(e) => e.stopPropagation()}
                />
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
  );
};

export default AnnotationTable; 