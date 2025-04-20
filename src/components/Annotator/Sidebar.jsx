/**
 * Annotation Sidebar Component
 * Displays data information and defect list.
 */
import React, { useState, useEffect } from 'react';
import { getDefectColorClass } from '../../utils/annotationUtils';
import './Sidebar.css';

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
 */
const Sidebar = ({
  dataInfo,
  defects,
  selectedDefect,
  selectedDefectDetail,
  onDefectSelect,
  onToolChange,
  toolTypes
}) => {
  // Select defect and activate hand tool
  const handleDefectSelect = (defectId) => {
    onDefectSelect(defectId);
    
    // Automatically activate hand tool when defect is selected
    if (onToolChange && toolTypes) {
      onToolChange(toolTypes.HAND);
    }
  };

  return (
    <aside className="annotator-sidebar">
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

      {/* Selected Annotation Details */}
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
              <span className={`detail-color-dot ${getDefectColorClass(selectedDefectDetail.type)}`}></span>
              {selectedDefectDetail.type}
            </span>
          </div>
          <div className="annotator-detail-item">
            <span className="detail-label">Confidence Score:</span>
            <span className="detail-value confidence">{selectedDefectDetail.confidence.toFixed(2)}</span>
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
              className={`annotator-defect-item ${selectedDefect === defect.id ? 'selected' : ''}`}
              onClick={() => handleDefectSelect(defect.id)}
            >
              <div className={`annotator-defect-color ${getDefectColorClass(defect.type)}`}></div>
              <span>({defect.id}) {defect.type}</span>
              <span className="annotator-confidence">{defect.confidence === 0.9 ? '-' : defect.confidence.toFixed(2)}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar; 