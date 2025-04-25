import React from 'react';
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
  const handleDeleteClick = (id, event) => {
    event.stopPropagation();
    onDelete(id);
  };

  return (
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
            <tr key={annotation.id} onClick={() => onViewDetails(annotation.id)}>
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