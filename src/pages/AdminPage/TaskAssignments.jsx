/**
 * Admin Task Assignments Page
 * Manage and assign tasks to annotators by user
 */
import React, { useState, useEffect } from 'react';
import DashboardHeader from '../../components/Annotator/Header/DashboardHeader';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import './AdminDashboard.css';
import AnnotationService from '../../services/AnnotationService';
import UserService from '../../services/UserService';

/**
 * Admin task assignments page component
 * Provides task management and assignment features (user-to-camera approach)
 */
const TaskAssignments = () => {
  const [images, setImages] = useState([]);
  const [annotators, setAnnotators] = useState([]);
  const [cameraIds, setCameraIds] = useState([]);
  const [userAssignments, setUserAssignments] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [stats, setStats] = useState({});
  const [cameraStats, setCameraStats] = useState({});
  const [selectedAnnotator, setSelectedAnnotator] = useState('');
  const [isDragActive, setIsDragActive] = useState(false);
  const [dragTargetCamera, setDragTargetCamera] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch images and users
        setIsLoading(true);
        setErrorMessage(''); // 에러 메시지 초기화
        
        console.log('Fetching images data...');
        const allImages = await AnnotationService.getAllImages();
        console.log('Images fetched:', allImages.length);
        setImages(allImages);
        
        // Extract unique camera IDs
        const uniqueCameraIds = [...new Set(allImages.map(img => img.camera_id))];
        console.log('Unique camera IDs:', uniqueCameraIds);
        setCameraIds(uniqueCameraIds);
        
        console.log('Fetching users data...');
        const allUsers = await UserService.getAllUsers();
        const annotatorUsers = allUsers.filter(user => 
          (user.user_type === 'Annotator' || user.user_type === 'annotator') && user.is_active
        );
        console.log('Annotators fetched:', annotatorUsers.length);
        setAnnotators(annotatorUsers);
        
        // Initialize assignments object (user-to-camera)
        const initialUserAssignments = {};
        annotatorUsers.forEach(annotator => {
          initialUserAssignments[annotator.user_id] = [];
        });
        setUserAssignments(initialUserAssignments);
        
        // Calculate camera stats
        const camStats = {};
        uniqueCameraIds.forEach(cameraId => {
          camStats[cameraId] = allImages.filter(img => img.camera_id === cameraId).length;
        });
        setCameraStats(camStats);
        
        // Calculate statistics
        calculateStats(initialUserAssignments, camStats);
        console.log('Data loading complete');
        
        // Set the first annotator as selected by default if available
        if (annotatorUsers.length > 0) {
          setSelectedAnnotator(String(annotatorUsers[0].user_id));
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setErrorMessage(`Failed to load data: ${error.message || 'Unknown error'}`);
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const calculateStats = (currentAssignments, camStats) => {
    // Calculate images per annotator based on assigned cameras
    const annotatorStats = {};
    Object.entries(currentAssignments).forEach(([annotatorId, assignedCameras]) => {
      let totalImages = 0;
      assignedCameras.forEach(cameraId => {
        totalImages += camStats[cameraId] || 0;
      });
      annotatorStats[annotatorId] = totalImages;
    });
    
    const totalImages = images.length;
    const totalAssigned = Object.values(annotatorStats).reduce((sum, count) => sum + count, 0);
    
    setStats({
      annotators: annotatorStats,
      totalImages: totalImages,
      totalAssigned: totalAssigned
    });
  };
  
  const handleAnnotatorChange = (e) => {
    setSelectedAnnotator(e.target.value);
  };
  
  const toggleCameraAssignment = (cameraId) => {
    if (!selectedAnnotator) return;
    
    const updatedAssignments = { ...userAssignments };
    
    // Remove camera from any existing assignments to make it exclusive
    Object.keys(updatedAssignments).forEach(annotatorId => {
      if (updatedAssignments[annotatorId].includes(cameraId)) {
        updatedAssignments[annotatorId] = updatedAssignments[annotatorId].filter(id => id !== cameraId);
      }
    });
    
    // Add to selected annotator if not already assigned
    if (!updatedAssignments[selectedAnnotator].includes(cameraId)) {
      updatedAssignments[selectedAnnotator] = [...updatedAssignments[selectedAnnotator], cameraId];
    }
    
    setUserAssignments(updatedAssignments);
    calculateStats(updatedAssignments, cameraStats);
  };
  
  const handleCameraListDragStart = (e, cameraId) => {
    e.dataTransfer.setData('camera_id', cameraId);
    setIsDragActive(true);
  };
  
  const handleCameraListDragOver = (e, annotatorId) => {
    e.preventDefault();
    setDragTargetCamera(annotatorId);
  };
  
  const handleCameraListDragLeave = () => {
    setDragTargetCamera(null);
  };
  
  const handleCameraListDrop = (e, annotatorId) => {
    e.preventDefault();
    const cameraId = e.dataTransfer.getData('camera_id');
    
    const updatedAssignments = { ...userAssignments };
    
    // Remove camera from any existing assignments
    Object.keys(updatedAssignments).forEach(id => {
      updatedAssignments[id] = updatedAssignments[id].filter(id => id !== cameraId);
    });
    
    // Add to target annotator
    updatedAssignments[annotatorId] = [...updatedAssignments[annotatorId], cameraId];
    
    setUserAssignments(updatedAssignments);
    calculateStats(updatedAssignments, cameraStats);
    setIsDragActive(false);
    setDragTargetCamera(null);
  };
  
  const handleDragEnd = () => {
    setIsDragActive(false);
    setDragTargetCamera(null);
  };
  
  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      
      // Filter out empty assignments
      const assignmentsToSave = {};
      Object.entries(userAssignments).forEach(([annotatorId, cameras]) => {
        if (cameras.length > 0) {
          assignmentsToSave[annotatorId] = cameras;
        }
      });
      
      // Call the new API endpoint to assign tasks by user
      const response = await AnnotationService.assignTasksByUserId(assignmentsToSave);
      
      setSuccessMessage('작업이 성공적으로 할당되었습니다!');
      setTimeout(() => setSuccessMessage(''), 5000);
      setIsLoading(false);
    } catch (error) {
      console.error('Error assigning tasks:', error);
      setErrorMessage('작업 할당 중 오류가 발생했습니다. 다시 시도해주세요.');
      setIsLoading(false);
    }
  };
  
  const handleAutoAssign = () => {
    if (annotators.length === 0) {
      setErrorMessage('자동 할당을 위한 어노테이터가 없습니다.');
      return;
    }
    
    // Sort cameras by number of images (descending)
    const sortedCameras = [...cameraIds].sort((a, b) => 
      cameraStats[b] - cameraStats[a]
    );
    
    // Clear existing assignments
    const newAssignments = {};
    annotators.forEach(annotator => {
      newAssignments[annotator.user_id] = [];
    });
    
    // Assign each camera to the annotator with the least workload
    sortedCameras.forEach(cameraId => {
      // Find annotator with lowest current workload
      const sortedAnnotators = [...annotators].sort((a, b) => {
        const aWorkload = newAssignments[a.user_id].reduce((sum, camId) => sum + (cameraStats[camId] || 0), 0);
        const bWorkload = newAssignments[b.user_id].reduce((sum, camId) => sum + (cameraStats[camId] || 0), 0);
        return aWorkload - bWorkload;
      });
      
      // Assign to annotator with lowest workload
      if (sortedAnnotators.length > 0) {
        const targetAnnotatorId = sortedAnnotators[0].user_id;
        newAssignments[targetAnnotatorId].push(cameraId);
      }
    });
    
    setUserAssignments(newAssignments);
    calculateStats(newAssignments, cameraStats);
  };
  
  const handleClearAssignments = () => {
    const clearedAssignments = {};
    annotators.forEach(annotator => {
      clearedAssignments[annotator.user_id] = [];
    });
    
    setUserAssignments(clearedAssignments);
    calculateStats(clearedAssignments, cameraStats);
  };
  
  const getAnnotatorName = (annotatorId) => {
    const annotator = annotators.find(a => a.user_id === parseInt(annotatorId));
    return annotator ? annotator.name : 'Unknown';
  };
  
  const getAssignmentSummary = () => {
    const assignedCameras = new Set();
    Object.values(userAssignments).forEach(cameras => {
      cameras.forEach(camId => assignedCameras.add(camId));
    });
    return `${assignedCameras.size} / ${cameraIds.length}`;
  };
  
  const getCameraName = (cameraId) => {
    return cameraId; // Camera ID 사용, 실제로는 카메라 이름이나 별명 등을 표시할 수 있음
  };
  
  const getAssignedAnnotatorForCamera = (cameraId) => {
    for (const [annotatorId, cameras] of Object.entries(userAssignments)) {
      if (cameras.includes(cameraId)) {
        return annotatorId;
      }
    }
    return null;
  };
  
  const getCameraCount = (annotatorId) => {
    return userAssignments[annotatorId]?.length || 0;
  };
  
  const getImageCount = (annotatorId) => {
    return userAssignments[annotatorId]?.reduce((sum, cameraId) => sum + (cameraStats[cameraId] || 0), 0) || 0;
  };
  
  return (
    <div className="admin-dashboard-page">
      <AdminSidebar activeMenu="tasks" />
      
      <div className="main-content">
        <DashboardHeader title="Admin" />
        
        <div className="dashboard-content">
          <div className="admin-controls">
            <div>
              <h1>작업 할당</h1>
              <p>어노테이터에게 카메라 기반으로 이미지 작업 할당</p>
            </div>
            
            {!isLoading && (
              <div className="assignment-summary">
                <div className="summary-stat">
                  <span className="stat-label">할당된 카메라:</span>
                  <span className="stat-value">{getAssignmentSummary()}</span>
                </div>
                <div className="summary-stat">
                  <span className="stat-label">할당된 이미지:</span>
                  <span className="stat-value">
                    {stats.totalAssigned} / {stats.totalImages} ({stats.totalImages ? Math.round(stats.totalAssigned / stats.totalImages * 100) : 0}%)
                  </span>
                </div>
              </div>
            )}
          </div>
          
          {isLoading ? (
            <div className="loading-indicator">
              <div className="loader"></div>
              <p>작업 데이터를 불러오는 중...</p>
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
                  자동 작업 할당
                </button>
                <button 
                  className="tertiary-button"
                  onClick={handleClearAssignments}
                  disabled={Object.values(userAssignments).every(cameras => cameras.length === 0)}
                >
                  모든 할당 초기화
                </button>
              </div>
              
              <div className="user-task-assignment-layout">
                {/* 어노테이터 선택 패널 */}
                <div className="user-selection-panel">
                  <h3>어노테이터</h3>
                  <div className="annotator-list">
                    {annotators.map(annotator => (
                      <div 
                        key={annotator.user_id} 
                        className={`annotator-card ${selectedAnnotator === String(annotator.user_id) ? 'selected' : ''}`}
                        onClick={() => setSelectedAnnotator(String(annotator.user_id))}
                        onDragOver={(e) => handleCameraListDragOver(e, annotator.user_id)}
                        onDragLeave={handleCameraListDragLeave}
                        onDrop={(e) => handleCameraListDrop(e, annotator.user_id)}
                      >
                        <div className="annotator-info">
                          <div className="annotator-name">{annotator.name}</div>
                          <div className="annotator-stats">
                            <span>{getCameraCount(annotator.user_id)} 카메라</span>
                            <span>{getImageCount(annotator.user_id)} 이미지</span>
                          </div>
                        </div>
                        {dragTargetCamera === annotator.user_id && (
                          <div className="drop-indicator">여기에 카메라 놓기</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* 카메라 할당 패널 */}
                <div className="camera-assignment-panel">
                  {selectedAnnotator ? (
                    <div className="camera-assignment-content">
                      <h3>선택된 어노테이터: {getAnnotatorName(selectedAnnotator)}</h3>
                      
                      <div className="camera-groups">
                        <div className="camera-group">
                          <h4>할당된 카메라 ({userAssignments[selectedAnnotator]?.length || 0})</h4>
                          <div className="camera-list assigned">
                            {userAssignments[selectedAnnotator]?.map(cameraId => (
                              <div 
                                key={cameraId} 
                                className="camera-item assigned"
                                draggable
                                onDragStart={(e) => handleCameraListDragStart(e, cameraId)}
                                onDragEnd={handleDragEnd}
                                onClick={() => toggleCameraAssignment(cameraId)}
                              >
                                <div className="camera-name">{getCameraName(cameraId)}</div>
                                <div className="camera-image-count">{cameraStats[cameraId] || 0} 이미지</div>
                              </div>
                            ))}
                            {userAssignments[selectedAnnotator]?.length === 0 && (
                              <div className="empty-list-message">할당된 카메라가 없습니다</div>
                            )}
                          </div>
                        </div>
                        
                        <div className="camera-group">
                          <h4>미할당 카메라 ({cameraIds.length - (userAssignments[selectedAnnotator]?.length || 0)})</h4>
                          <div className="camera-list unassigned">
                            {cameraIds
                              .filter(cameraId => !userAssignments[selectedAnnotator]?.includes(cameraId))
                              .map(cameraId => {
                                const assignedTo = getAssignedAnnotatorForCamera(cameraId);
                                return (
                                  <div 
                                    key={cameraId} 
                                    className={`camera-item ${assignedTo ? 'assigned-other' : 'unassigned'}`}
                                    draggable
                                    onDragStart={(e) => handleCameraListDragStart(e, cameraId)}
                                    onDragEnd={handleDragEnd}
                                    onClick={() => toggleCameraAssignment(cameraId)}
                                  >
                                    <div className="camera-name">{getCameraName(cameraId)}</div>
                                    <div className="camera-info">
                                      <span className="camera-image-count">{cameraStats[cameraId] || 0} 이미지</span>
                                      {assignedTo && (
                                        <span className="assigned-to">
                                          {getAnnotatorName(assignedTo)}에게 할당됨
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })
                            }
                            {cameraIds.filter(cameraId => !userAssignments[selectedAnnotator]?.includes(cameraId)).length === 0 && (
                              <div className="empty-list-message">모든 카메라가 할당되었습니다</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="no-annotator-selected">
                      <p>작업을 할당할 어노테이터를 선택해주세요</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="assignment-stats">
                <h3>작업량 분포</h3>
                <div className="workload-bars">
                  {annotators.map(annotator => {
                    const assignedCount = getImageCount(annotator.user_id);
                    const percentage = stats.totalImages ? (assignedCount / stats.totalImages * 100) : 0;
                    
                    return (
                      <div key={annotator.user_id} className="workload-item">
                        <div className="workload-info">
                          <span className="annotator-name">{annotator.name}</span>
                          <span className="workload-count">{assignedCount} 이미지 ({Math.round(percentage)}%)</span>
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
                  disabled={isLoading || Object.values(userAssignments).every(cameras => cameras.length === 0)}
                >
                  작업 할당 저장
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