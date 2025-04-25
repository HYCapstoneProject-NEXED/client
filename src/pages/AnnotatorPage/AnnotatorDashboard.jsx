/**
 * Annotator Dashboard Page
 * Displays overview of annotation tasks and their status
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronDown, FaTrash } from 'react-icons/fa';
import { ANNOTATION_STATUS } from '../../constants/annotationConstants';
import AnnotationService from '../../services/AnnotationService';
import DashboardSidebar from '../../components/Annotator/Sidebar/DashboardSidebar';
import DashboardHeader from '../../components/Annotator/Header/DashboardHeader';
import './AnnotatorDashboard.css';

const AnnotatorDashboard = () => {
  const navigate = useNavigate();
  const [annotations, setAnnotations] = useState([]);
  const [totalAnnotations, setTotalAnnotations] = useState(0);
  const [completedAnnotations, setCompletedAnnotations] = useState(0);
  const [pendingAnnotations, setPendingAnnotations] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [defectTypeFilter, setDefectTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [confidenceScoreFilter, setConfidenceScoreFilter] = useState('');
  
  useEffect(() => {
    // Fetch annotation data from API
    const fetchAnnotations = async () => {
      try {
        setIsLoading(true);
        const data = await AnnotationService.getAllAnnotationSummaries();
        setAnnotations(data);
        
        // Calculate statistics
        setTotalAnnotations(data.length);
        const completed = data.filter(item => item.status === ANNOTATION_STATUS.COMPLETED).length;
        setCompletedAnnotations(completed);
        setPendingAnnotations(data.length - completed);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching annotation data:', error);
        setIsLoading(false);
      }
    };
    
    fetchAnnotations();
  }, []);
  
  const handleViewDetails = (id) => {
    // Convert from ID format (e.g., IMG_001) to numeric ID for routing
    const numericId = parseInt(id.split('_')[1]);
    navigate(`/annotator/detail/${numericId}`);
  };
  
  const handleDelete = (id, event) => {
    event.stopPropagation();
    if (window.confirm(`정말로 ${id} 어노테이션을 삭제하시겠습니까?`)) {
      console.log('Deleting annotation with ID:', id);
      // In a real implementation, would call the service to delete
      // and then refetch the data
      setAnnotations(annotations.filter(annotation => annotation.id !== id));
      
      // Update statistics
      const deletedItem = annotations.find(item => item.id === id);
      setTotalAnnotations(prev => prev - 1);
      if (deletedItem && deletedItem.status === ANNOTATION_STATUS.COMPLETED) {
        setCompletedAnnotations(prev => prev - 1);
      } else {
        setPendingAnnotations(prev => prev - 1);
      }
    }
  };
  
  const getStatusStyle = (status) => {
    if (status === ANNOTATION_STATUS.COMPLETED) {
      return { color: '#16DBCC' };
    }
    return { color: '#718EBF' };
  };
  
  if (isLoading) {
    return (
      <div className="annotator-dashboard-page">
        <DashboardSidebar activeMenu="dashboard" />
        
        <div className="main-content">
          <DashboardHeader title="Annotator" />
          
          <div className="dashboard-content">
            <h2 className="section-title">Current Task</h2>
            <div className="loading-container">
              <div className="loader"></div>
              <p>Loading annotation data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="annotator-dashboard-page">
      <DashboardSidebar activeMenu="dashboard" />
      
      <div className="main-content">
        <DashboardHeader title="Annotator" />
        
        <div className="dashboard-content">
          <h2 className="section-title">Current Task</h2>
          
          {/* Task Statistics Card */}
          <div className="task-stats-card">
            <div className="stats-item">
              <div className="stats-label">Total datas</div>
              <div className="stats-value">{totalAnnotations}</div>
            </div>
            
            <div className="task-distribution">
              <div className="task-type">
                <div className="color-dot completed-dot"></div>
                <div className="task-type-info">
                  <div className="task-type-label">Completed Tasks</div>
                  <div className="task-type-value">{completedAnnotations}</div>
                </div>
              </div>
              
              <div className="task-type">
                <div className="color-dot pending-dot"></div>
                <div className="task-type-info">
                  <div className="task-type-label">Pending Tasks</div>
                  <div className="task-type-value">{pendingAnnotations}</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Filters */}
          <div className="annotation-filters">
            <div className="filter-dropdown">
              <div className="filter-input">
                <span>Defect Type</span>
                <FaChevronDown />
              </div>
            </div>
            
            <div className="filter-dropdown">
              <div className="filter-input">
                <span>Status</span>
                <FaChevronDown />
              </div>
            </div>
            
            <div className="filter-dropdown">
              <div className="filter-input">
                <span>Confidence Score</span>
                <FaChevronDown />
              </div>
            </div>
            
            <button className="view-details-btn">View Details</button>
          </div>
          
          {/* Annotation Table */}
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
                  <tr key={annotation.id} onClick={() => handleViewDetails(annotation.id)}>
                    <td className="checkbox-col">
                      <input type="checkbox" onClick={(e) => e.stopPropagation()} />
                    </td>
                    <td>{annotation.cameraId}</td>
                    <td>{annotation.id}</td>
                    <td>{annotation.confidenceScore !== null ? annotation.confidenceScore.toFixed(2) : '-'}</td>
                    <td>{annotation.defectCount}</td>
                    <td>
                      <span style={getStatusStyle(annotation.status)}>
                        {annotation.status}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="delete-btn"
                        onClick={(e) => handleDelete(annotation.id, e)}
                      >
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnotatorDashboard; 