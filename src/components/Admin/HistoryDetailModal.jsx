import React from 'react';
import { FaTimesCircle, FaClock } from 'react-icons/fa';
import './HistoryDetailModal.css';

/**
 * Modal component to show detailed annotation history
 */
const HistoryDetailModal = ({ item, onClose }) => {
  if (!item) return null;

  // Sample annotation data for demonstration
  const annotationData = {
    timestamps: {
      start: "2025-01-01T10:23:15",
      end: "2025-01-01T10:26:27",
      duration: "03:12" // mm:ss
    },
    task: {
      totalImages: 15,
      completedImages: 15
    },
    screenshot: `/screenshots/${item.id}.jpg` // Would be a real path in production
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="history-detail-modal-overlay">
      <div className="history-detail-modal">
        <div className="modal-header">
          <h2>Annotation Details: {item.id}</h2>
          <button className="close-button" onClick={onClose}>
            <FaTimesCircle />
          </button>
        </div>

        <div className="modal-content">
          <div className="detail-section basic-info">
            <h3>Basic Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <div className="info-label">Annotator:</div>
                <div className="info-value">{item.annotator}</div>
              </div>
              <div className="info-item">
                <div className="info-label">Date:</div>
                <div className="info-value">{item.date}</div>
              </div>
              <div className="info-item">
                <div className="info-label">Started at:</div>
                <div className="info-value">{formatDate(annotationData.timestamps.start)}</div>
              </div>
              <div className="info-item">
                <div className="info-label">Completed at:</div>
                <div className="info-value">{formatDate(annotationData.timestamps.end)}</div>
              </div>
              <div className="info-item">
                <div className="info-label">Duration:</div>
                <div className="info-value time-value">
                  <FaClock className="icon" />
                  {annotationData.timestamps.duration}
                </div>
              </div>
              <div className="info-item">
                <div className="info-label">Total Images:</div>
                <div className="info-value">{annotationData.task.totalImages}</div>
              </div>
              <div className="info-item">
                <div className="info-label">Completed Images:</div>
                <div className="info-value">{annotationData.task.completedImages}</div>
              </div>
              <div className="info-item">
                <div className="info-label">Payment Status:</div>
                <div className="info-value">
                  <div className="payment-status paid">Paid</div>
                </div>
              </div>
            </div>
          </div>

          <div className="detail-section annotation-preview">
            <h3>Annotation Preview</h3>
            <div className="image-preview">
              <img src={`https://via.placeholder.com/800x500?text=Annotation+for+${item.id}`} alt="Annotation preview" />
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-button download">Download Results</button>
          <button className="modal-button close" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default HistoryDetailModal; 