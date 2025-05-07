/**
 * Admin Task Assignments Page
 * Manage and assign tasks to annotators by camera ID
 */
import React, { useState, useEffect } from 'react';
import DashboardHeader from '../../components/Annotator/Header/DashboardHeader';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import './AdminDashboard.css';
import AnnotationService from '../../services/AnnotationService';
import UserService from '../../services/UserService';

/**
 * Admin task assignments page component
 * Provides task management and assignment features
 */
const TaskAssignments = () => {
  const [images, setImages] = useState([]);
  const [annotators, setAnnotators] = useState([]);
  const [cameraIds, setCameraIds] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [stats, setStats] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch images and users
        setIsLoading(true);
        setErrorMessage(''); // 에러 메시지 초기화
        
        console.log('Fetching images data...');
        // 싱글톤 인스턴스 사용
        const allImages = await AnnotationService.getAllImages();
        console.log('Images fetched:', allImages.length);
        setImages(allImages);
        
        // Extract unique camera IDs
        const uniqueCameraIds = [...new Set(allImages.map(img => img.camera_id))];
        console.log('Unique camera IDs:', uniqueCameraIds);
        setCameraIds(uniqueCameraIds);
        
        console.log('Fetching users data...');
        // Get only annotator users
        const allUsers = await UserService.getAllUsers();
        const annotatorUsers = allUsers.filter(user => 
          (user.user_type === 'Annotator' || user.user_type === 'annotator') && user.is_active
        );
        console.log('Annotators fetched:', annotatorUsers.length);
        setAnnotators(annotatorUsers);
        
        // Initialize assignments object
        const initialAssignments = {};
        uniqueCameraIds.forEach(cameraId => {
          initialAssignments[cameraId] = null;
        });
        setAssignments(initialAssignments);
        
        // Calculate statistics
        calculateStats(uniqueCameraIds, allImages, {});
        console.log('Data loading complete');
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setErrorMessage(`Failed to load data: ${error.message || 'Unknown error'}`);
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const calculateStats = (cameraIds, images, currentAssignments) => {
    // Calculate images per camera
    const cameraStats = {};
    cameraIds.forEach(cameraId => {
      cameraStats[cameraId] = images.filter(img => img.camera_id === cameraId).length;
    });
    
    // Calculate assignments per annotator
    const annotatorStats = {};
    Object.entries(currentAssignments).forEach(([cameraId, annotatorId]) => {
      if (annotatorId) {
        annotatorStats[annotatorId] = (annotatorStats[annotatorId] || 0) + cameraStats[cameraId];
      }
    });
    
    setStats({
      cameras: cameraStats,
      annotators: annotatorStats,
      totalImages: images.length,
      totalAssigned: Object.values(annotatorStats).reduce((sum, count) => sum + count, 0)
    });
  };
  
  const handleAssignmentChange = (cameraId, annotatorId) => {
    const updatedAssignments = {
      ...assignments,
      [cameraId]: annotatorId === "" ? null : parseInt(annotatorId)
    };
    
    setAssignments(updatedAssignments);
    calculateStats(cameraIds, images, updatedAssignments);
  };
  
  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      // Filter out unassigned cameras
      const assignmentsToSave = Object.entries(assignments)
        .filter(([_, annotatorId]) => annotatorId !== null)
        .reduce((acc, [cameraId, annotatorId]) => {
          acc[cameraId] = annotatorId;
          return acc;
        }, {});
      
      // Call the API endpoint to assign tasks - 싱글톤 인스턴스 사용
      const response = await AnnotationService.assignTasksByCameraId(assignmentsToSave);
      
      setSuccessMessage('Tasks successfully assigned to annotators!');
      setTimeout(() => setSuccessMessage(''), 5000);
      setIsLoading(false);
    } catch (error) {
      console.error('Error assigning tasks:', error);
      setErrorMessage('Failed to assign tasks. Please try again.');
      setIsLoading(false);
    }
  };
  
  const getImagesCountByCameraId = (cameraId) => {
    return images.filter(img => img.camera_id === cameraId).length;
  };
  
  const getAnnotatorAssignedCount = (annotatorId) => {
    return stats.annotators[annotatorId] || 0;
  };
  
  const getAnnotatorName = (annotatorId) => {
    const annotator = annotators.find(a => a.user_id === annotatorId);
    return annotator ? annotator.name : 'Unknown';
  };
  
  const getAssignmentSummary = () => {
    const assignedAnnotators = Object.values(assignments).filter(a => a !== null).length;
    const totalCameras = cameraIds.length;
    return `${assignedAnnotators} of ${totalCameras} cameras assigned`;
  };
  
  const getTotalAssignedImages = () => {
    return stats.totalAssigned || 0;
  };
  
  const getPercentAssigned = () => {
    if (!stats.totalImages) return 0;
    return Math.round((stats.totalAssigned || 0) / stats.totalImages * 100);
  };
  
  const handleAutoAssign = () => {
    if (annotators.length === 0) {
      setErrorMessage('No annotators available for auto-assignment');
      return;
    }
    
    // Create a balanced distribution of cameras to annotators
    const newAssignments = {...assignments};
    
    // Sort cameras by number of images (descending)
    const sortedCameras = [...cameraIds].sort((a, b) => 
      getImagesCountByCameraId(b) - getImagesCountByCameraId(a)
    );
    
    // Assign each camera to the annotator with the least current workload
    sortedCameras.forEach(cameraId => {
      // Calculate current workload for each annotator
      const workloads = annotators.map(annotator => ({
        annotatorId: annotator.user_id,
        workload: getAnnotatorAssignedCount(annotator.user_id)
      }));
      
      // Sort by workload (ascending)
      workloads.sort((a, b) => a.workload - b.workload);
      
      // Assign to annotator with lowest workload
      newAssignments[cameraId] = workloads[0].annotatorId;
    });
    
    setAssignments(newAssignments);
    calculateStats(cameraIds, images, newAssignments);
  };
  
  const handleClearAssignments = () => {
    const clearedAssignments = {};
    cameraIds.forEach(cameraId => {
      clearedAssignments[cameraId] = null;
    });
    
    setAssignments(clearedAssignments);
    calculateStats(cameraIds, images, clearedAssignments);
  };
  
  return (
    <div className="admin-dashboard-page">
      <AdminSidebar activeMenu="tasks" />
      
      <div className="main-content">
        <DashboardHeader title="Admin" />
        
        <div className="dashboard-content">
          <div className="admin-controls">
            <div>
              <h1>Task Assignments</h1>
              <p>Assign images to annotators based on camera ID</p>
            </div>
            
            {!isLoading && (
              <div className="assignment-summary">
                <div className="summary-stat">
                  <span className="stat-label">Cameras:</span>
                  <span className="stat-value">{getAssignmentSummary()}</span>
                </div>
                <div className="summary-stat">
                  <span className="stat-label">Images:</span>
                  <span className="stat-value">{getTotalAssignedImages()} of {stats.totalImages} ({getPercentAssigned()}%)</span>
                </div>
              </div>
            )}
          </div>
          
          {isLoading ? (
            <div className="loading-indicator">
              <div className="loader"></div>
              <p>Loading task data...</p>
            </div>
          ) : (
            <div className="task-assignment-container">
              {successMessage && (
                <div className="success-message">{successMessage}</div>
              )}
              {errorMessage && (
                <div className="error-message">{errorMessage}</div>
              )}
              
              <div className="assignment-actions top-actions">
                <button 
                  className="secondary-button"
                  onClick={handleAutoAssign}
                  disabled={annotators.length === 0}
                >
                  Auto-Assign Tasks
                </button>
                <button 
                  className="tertiary-button"
                  onClick={handleClearAssignments}
                  disabled={Object.values(assignments).every(val => val === null)}
                >
                  Clear All Assignments
                </button>
              </div>
              
              <div className="assignment-table-container">
                <table className="assignment-table">
                  <thead>
                    <tr>
                      <th>Camera ID</th>
                      <th>Number of Images</th>
                      <th>Assigned Annotator</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cameraIds.map(cameraId => (
                      <tr key={cameraId}>
                        <td className="camera-id-cell">{cameraId}</td>
                        <td className="image-count-cell">{getImagesCountByCameraId(cameraId)}</td>
                        <td className="annotator-select-cell">
                          <select 
                            value={assignments[cameraId] || ""}
                            onChange={(e) => handleAssignmentChange(cameraId, e.target.value)}
                            className={assignments[cameraId] ? "assigned" : ""}
                          >
                            <option value="">Not Assigned</option>
                            {annotators.map(annotator => (
                              <option key={annotator.user_id} value={annotator.user_id}>
                                {annotator.name} ({getAnnotatorAssignedCount(annotator.user_id)} images)
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="status-cell">
                          {assignments[cameraId] ? (
                            <span className="status assigned">
                              Assigned to {getAnnotatorName(assignments[cameraId])}
                            </span>
                          ) : (
                            <span className="status unassigned">Unassigned</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="assignment-stats">
                <h3>Workload Distribution</h3>
                <div className="workload-bars">
                  {annotators.map(annotator => {
                    const assignedCount = getAnnotatorAssignedCount(annotator.user_id);
                    const percentage = stats.totalImages ? (assignedCount / stats.totalImages * 100) : 0;
                    
                    return (
                      <div key={annotator.user_id} className="workload-item">
                        <div className="workload-info">
                          <span className="annotator-name">{annotator.name}</span>
                          <span className="workload-count">{assignedCount} images ({Math.round(percentage)}%)</span>
                        </div>
                        <div className="workload-bar-container">
                          <div className="workload-bar" style={{ width: `${percentage}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="assignment-actions bottom-actions">
                <button 
                  className="primary-button" 
                  onClick={handleSubmit}
                  disabled={isLoading || Object.values(assignments).every(val => val === null)}
                >
                  Save Assignments
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskAssignments; 