/**
 * Admin Task Assignments Page
 * Manage and assign tasks to annotators by user
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import DashboardHeader from '../../components/Annotator/Header/DashboardHeader';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import './AdminDashboard.css';
import AnnotationService from '../../services/AnnotationService';
import UserService from '../../services/UserService';
import { FaCaretDown, FaCaretRight, FaCheck, FaGripHorizontal } from 'react-icons/fa';
import useHistoryControl from '../../hooks/useHistoryControl';

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
  const [imagesPerCamera, setImagesPerCamera] = useState({});
  
  // Use history control to manage back navigation
  useHistoryControl();
  
  // Refs for scrolling
  const assignedCamerasRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');
        
        // Fetch task assignment stats from the new API
        const taskStats = await AnnotationService.getAdminTaskAssignmentStats();
        
        // Set the stats from the API response
        setStats({
          totalCameras: taskStats.total_cameras || 0,
          assignedCameras: taskStats.assigned_cameras || 0,
          totalImages: taskStats.total_images || 0,
          totalAssigned: taskStats.assigned_images || 0,
          annotators: taskStats.annotators.reduce((acc, annotator) => {
            acc[annotator.user_id] = annotator.assigned_images_count;
            return acc;
          }, {})
        });
        
        // Set camera IDs and stats
        const unassignedCameras = taskStats.unassigned_cameras || [];
        const allCameraIds = unassignedCameras.map(camera => camera.camera_id);
        setCameraIds(allCameraIds);
        
        const camerasWithStats = {};
        unassignedCameras.forEach(camera => {
          camerasWithStats[camera.camera_id] = camera.image_count;
        });
        setCameraStats(camerasWithStats);
        
        // Set annotators
        setAnnotators(taskStats.annotators.map(annotator => ({
          user_id: annotator.user_id,
          name: annotator.username,
          assigned_cameras_count: annotator.assigned_cameras_count,
          assigned_images_count: annotator.assigned_images_count,
          user_type: 'Annotator',
          is_active: true
        })));
        
        // Initialize empty user assignments
        const initialUserAssignments = {};
        taskStats.annotators.forEach(annotator => {
          initialUserAssignments[annotator.user_id] = [];
        });
        setUserAssignments(initialUserAssignments);
        
        setIsLoading(false);
      } catch (error) {
        setErrorMessage(`Failed to load data: ${error.message || 'Unknown error'}`);
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);
  
  // 카메라마다 있는 이미지 수를 계산
  const countImagesInCameras = useCallback(() => {
    // 각 카메라에 있는 이미지 수 계산
    const counts = {};
    Object.keys(imagesPerCamera).forEach(cameraId => {
      counts[cameraId] = imagesPerCamera[cameraId]?.length || 0;
    });
    return counts;
  }, [imagesPerCamera]);

  // 작업량 분포 상태 강제 업데이트를 위한 함수
  const updateWorkloadDistribution = useCallback(() => {
    console.log("작업량 분포 강제 업데이트");
    
    // 카메라 할당 기반으로 계산
    const newAnnotatorStats = {};
    annotators.forEach(annotator => {
      newAnnotatorStats[annotator.user_id] = 0;
    });
    
    // 할당된 카메라 이미지 카운트
    Object.entries(userAssignments).forEach(([annotatorId, cameras]) => {
      if (cameras && newAnnotatorStats[annotatorId] !== undefined) {
        cameras.forEach(cameraId => {
          newAnnotatorStats[annotatorId] += cameraStats[cameraId] || 0;
        });
      }
    });
    
    const totalAssigned = Object.values(newAnnotatorStats).reduce((sum, count) => sum + count, 0);
    
    console.log("어노테이터별 할당량:", newAnnotatorStats);
    console.log("총 할당 이미지:", totalAssigned, "/", stats.totalImages);
    
    // 상태 업데이트 - preserve API values for totalCameras and totalImages
    setStats(prevStats => ({
      totalCameras: prevStats.totalCameras || 0,
      assignedCameras: prevStats.assignedCameras || 0,
      totalImages: prevStats.totalImages || 0,
      totalAssigned: totalAssigned,
      annotators: newAnnotatorStats
    }));
  }, [annotators, userAssignments, cameraStats, stats.totalImages]);

  // 상태 변경 시 작업량 분포 업데이트 - 의존성 배열 수정
  useEffect(() => {
    if (!isLoading) {
      updateWorkloadDistribution();
    }
  }, [userAssignments, isLoading, updateWorkloadDistribution]);

  // Update getImageCount with the API data
  const getImageCount = (annotatorId) => {
    const annotator = annotators.find(a => a.user_id === Number(annotatorId));
    return annotator ? annotator.assigned_images_count || 0 : 0;
  };
    
  // Update getCameraCount with the API data
  const getCameraCount = (annotatorId) => {
    const annotator = annotators.find(a => a.user_id === Number(annotatorId));
    return annotator ? annotator.assigned_cameras_count || 0 : 0;
  };
  
  const handleAnnotatorChange = async (userId) => {
    if (!userId) {
      setSelectedAnnotator('');
      return;
    }
    
    setSelectedAnnotator(userId);
    
    try {
      setIsLoading(true);
      
      // Fetch the selected user's camera stats
      const userCameraStats = await AnnotationService.getUserCameraStats(userId);
      
      // Update user assignments based on the camera stats
      const updatedAssignments = { ...userAssignments };
      updatedAssignments[userId] = userCameraStats.cameras.map(camera => camera.camera_id);
      setUserAssignments(updatedAssignments);
      
      // Update cameraStats to include image counts for assigned cameras
      const updatedCameraStats = { ...cameraStats };
      userCameraStats.cameras.forEach(camera => {
        // Add the assigned camera's image count to cameraStats
        updatedCameraStats[camera.camera_id] = camera.image_count || 0;
      });
      setCameraStats(updatedCameraStats);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching user camera stats:', error);
      setErrorMessage('Error fetching user camera information.');
      setIsLoading(false);
    }
  };
  
  const handleCameraListDragStart = (e, cameraId, currentOwner = null) => {
    e.dataTransfer.setData('camera_id', cameraId);
    if (currentOwner) {
      e.dataTransfer.setData('current_owner', currentOwner);
    }
    setIsDragActive(true);
  };
  
  const handleCameraListDragOver = (e, target) => {
    e.preventDefault();
    setDragTargetCamera(target);
  };
  
  const handleCameraListDragLeave = () => {
    setDragTargetCamera(null);
  };
  
  const handleCameraListDrop = (e, target) => {
    e.preventDefault();
    const cameraId = Number(e.dataTransfer.getData('camera_id'));
    const currentOwner = e.dataTransfer.getData('current_owner') || null;
    
    // 드롭 타겟이 'assigned-section'이면 현재 선택된 어노테이터에게 할당
    // 'unassigned-section'이면 미할당 상태로 변경
    const targetAnnotatorId = target === 'assigned-section' ? selectedAnnotator : target;
    
    console.log('Drop 이벤트 발생:', cameraId, currentOwner, '→', targetAnnotatorId);
    
    // 동일한 어노테이터에게 드롭한 경우 무시
    if (currentOwner === targetAnnotatorId) {
      setIsDragActive(false);
      setDragTargetCamera(null);
      return;
    }
    
    // 어노테이터가 선택되지 않은 경우 처리
    if (!selectedAnnotator && target === 'assigned-section') {
      setErrorMessage('Please select an annotator first');
      setIsDragActive(false);
      setDragTargetCamera(null);
      return;
    }
    
    // 업데이트할 할당 정보 객체
    const updatedAssignments = { ...userAssignments };
    
    // 1. 기존 할당이 있으면 제거 (어느 경우든 적용)
    if (currentOwner) {
      console.log('기존 소유자에게서 제거:', currentOwner);
      // 기존 소유자에게서 제거
      if (updatedAssignments[currentOwner]) {
        updatedAssignments[currentOwner] = updatedAssignments[currentOwner].filter(id => id !== cameraId);
      }
    }
    
    // 2. 타겟이 'unassigned-section'이 아닌 경우에만 새 소유자에게 추가
    if (target !== 'unassigned-section') {
      console.log('새 소유자에게 추가:', targetAnnotatorId);
      if (!updatedAssignments[targetAnnotatorId]) {
        updatedAssignments[targetAnnotatorId] = [];
      }
      if (!updatedAssignments[targetAnnotatorId].includes(cameraId)) {
        updatedAssignments[targetAnnotatorId].push(cameraId);
      }
    } else {
      console.log('카메라를 미할당 상태로 변경:', cameraId);
      // 미할당 카메라 목록에 추가 (이미 기존 할당에서 제거되었음)
      // cameraIds에 이미 있는지 확인하고 없으면 추가
      if (!cameraIds.includes(cameraId)) {
        setCameraIds(prev => [...prev, cameraId]);
      }
    }
    
    // 상태 업데이트
    setUserAssignments(updatedAssignments);
    
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
      
      if (!selectedAnnotator) {
        setErrorMessage('Please select an annotator first');
        setIsLoading(false);
        return;
      }
      
      // Prepare data for API - camera IDs assigned to the selected user
      const assignmentData = {
        user_id: parseInt(selectedAnnotator),
        camera_ids: userAssignments[selectedAnnotator] || []
      };
      
      // Call the API endpoint to assign tasks
      const response = await AnnotationService.assignTasksByUserId(assignmentData);
      
      setSuccessMessage('Tasks have been successfully assigned!');
      setTimeout(() => setSuccessMessage(''), 5000);
      
      // Refresh data after assignment
      const taskStats = await AnnotationService.getAdminTaskAssignmentStats();
      
      // Update the annotators state with fresh data from API
      const updatedAnnotators = taskStats.annotators.map(annotator => ({
        user_id: annotator.user_id,
        name: annotator.username,
        assigned_cameras_count: annotator.assigned_cameras_count,
        assigned_images_count: annotator.assigned_images_count,
        user_type: 'Annotator',
        is_active: true
      }));
      setAnnotators(updatedAnnotators);
      
      // Update stats from the refreshed data
      setStats({
        totalCameras: taskStats.total_cameras || 0,
        assignedCameras: taskStats.assigned_cameras || 0,
        totalImages: taskStats.total_images || 0,
        totalAssigned: taskStats.assigned_images || 0,
        annotators: taskStats.annotators.reduce((acc, annotator) => {
          acc[annotator.user_id] = annotator.assigned_images_count;
          return acc;
        }, {})
      });
      
      // Update unassigned cameras list
      const unassignedCameras = taskStats.unassigned_cameras || [];
      
      // Get all camera IDs from API
      const updatedCameraIds = unassignedCameras.map(camera => camera.camera_id);
      setCameraIds(updatedCameraIds);
      
      // Update camera stats
      const updatedCameraStats = {};
      unassignedCameras.forEach(camera => {
        updatedCameraStats[camera.camera_id] = camera.image_count;
      });
      setCameraStats(updatedCameraStats);
      
      // Update camera assignments for the selected annotator
      if (selectedAnnotator) {
        try {
          // Get the updated camera assignments for this user
          const userCameraStats = await AnnotationService.getUserCameraStats(selectedAnnotator);
          
          // Update user assignments with latest data
          setUserAssignments(prev => ({
            ...prev,
            [selectedAnnotator]: userCameraStats.cameras.map(camera => camera.camera_id)
          }));
          
          // Update cameraStats to include image counts for assigned cameras
          const assignedCameraStats = {};
          userCameraStats.cameras.forEach(camera => {
            assignedCameraStats[camera.camera_id] = camera.image_count || 0;
          });
          setCameraStats(prev => ({
            ...prev,
            ...assignedCameraStats
          }));
        } catch (error) {
          console.error('Error refreshing user camera assignments:', error);
        }
      }
      
      setIsLoading(false);
      
      // Scroll to assigned cameras section
      if (assignedCamerasRef.current) {
        setTimeout(() => {
          assignedCamerasRef.current.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }, 100);
      }
    } catch (error) {
      console.error('Error assigning tasks:', error);
      setErrorMessage('Error assigning tasks. Please try again.');
      setIsLoading(false);
    }
  };
  
  const handleAutoAssign = () => {
    if (annotators.length === 0) {
      setErrorMessage('No annotators available for auto-assignment');
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
    
    // Assign entire cameras to annotators with least workload
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
  };
  
  const handleClearAssignments = () => {
    // 할당된 카메라 목록을 모두 수집
    const allAssignedCameras = [];
    
    // 각 어노테이터별로 할당된 카메라 수집
    Object.entries(userAssignments).forEach(([annotatorId, cameras]) => {
      if (cameras && cameras.length > 0) {
        allAssignedCameras.push(...cameras);
      }
    });
    
    // 상태만 초기화하고 서버에는 반영하지 않음
    // 저장 버튼을 눌러야 서버에 반영됨
    // 카메라 할당 초기화
    const clearedAssignments = {};
    annotators.forEach(annotator => {
      clearedAssignments[annotator.user_id] = [];
    });
    setUserAssignments(clearedAssignments);
    
    // 현재 미할당 카메라 목록에 할당 해제된 카메라 추가
    // 중복 제거를 위해 Set 사용 후 배열로 변환
    const updatedCameraIds = [...new Set([...cameraIds, ...allAssignedCameras])];
    setCameraIds(updatedCameraIds);
    
    // 작업량 분포 업데이트 - Keep totalCameras and totalImages unchanged
    const clearedStats = {
      totalCameras: stats.totalCameras || 0,
      assignedCameras: 0,
      totalImages: stats.totalImages || 0,
      totalAssigned: 0,
      annotators: {}
    };
    
    annotators.forEach(annotator => {
      clearedStats.annotators[annotator.user_id] = 0;
    });
    
    setStats(clearedStats);
    
    // 성공 메시지 표시
    setSuccessMessage('All assignments have been cleared. Click Save to persist changes.');
    setTimeout(() => setSuccessMessage(''), 5000);
  };
  
  const getAnnotatorName = (annotatorId) => {
    const annotator = annotators.find(a => a.user_id === Number(annotatorId));
    return annotator ? annotator.name : '알 수 없음';
  };
  
  const getAssignmentSummary = () => {
    // Use the stats directly from the API
    const assignedCameras = stats.assignedCameras || 0;
    const totalCameras = stats.totalCameras || 0;
    const percentage = totalCameras ? Math.round((assignedCameras / totalCameras) * 100) : 0;
    
    return `${assignedCameras} / ${totalCameras} (${percentage}%)`;
  };
  
  const getCameraName = (cameraId) => {
    return `Camera ${cameraId}`;
  };
  
  const getAssignedAnnotatorForCamera = (cameraId) => {
    for (const [annotatorId, cameras] of Object.entries(userAssignments)) {
      if (cameras.includes(cameraId)) {
        return annotatorId;
      }
    }
    return null;
  };
  
  return (
    <div className="admin-dashboard-page">
      <AdminSidebar activeMenu="tasks" />
      
      <div className="main-content">
        <DashboardHeader />
        
        <div className="dashboard-content">
          <div className="admin-controls">
            <div>
              <h1>Task Assignment</h1>
            </div>
            
            {!isLoading && (
              <div className="assignment-summary">
                <div className="summary-stat">
                  <span className="stat-label">Assigned Cameras:</span>
                  <span className="stat-value">{getAssignmentSummary()}</span>
                </div>
                <div className="summary-stat">
                  <span className="stat-label">Assigned Images:</span>
                  <span className="stat-value">
                    {stats.totalAssigned || 0} / {stats.totalImages || 0} {stats.totalImages ? `(${Math.round((stats.totalAssigned / stats.totalImages) * 100)}%)` : '(-)'}
                  </span>
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
                  Auto Assign
                </button>
                <button 
                  className="tertiary-button"
                  onClick={handleClearAssignments}
                  disabled={Object.values(userAssignments).every(cameras => cameras.length === 0)}
                >
                  Clear All Assignments
                </button>
                <button 
                  className="primary-button" 
                  onClick={handleSubmit}
                  disabled={isLoading || !selectedAnnotator}
                >
                  Save Assignments
                </button>
              </div>
              
              <div className="user-task-assignment-layout">
                {/* Annotator Selection Panel */}
                <div className="user-selection-panel">
                  <h3>Annotators</h3>
                  <div className="annotator-list">
                    {annotators.map(annotator => (
                      <div 
                        key={annotator.user_id} 
                        className={`annotator-card ${selectedAnnotator === String(annotator.user_id) ? 'selected' : ''}`}
                        onClick={() => handleAnnotatorChange(String(annotator.user_id))}
                      >
                        {selectedAnnotator === String(annotator.user_id) && (
                          <div className="selected-indicator">
                            <FaCheck />
                          </div>
                        )}
                        <div className="annotator-info">
                          <div className="annotator-name">{annotator.name}</div>
                          <div className="annotator-stats">
                            <span>{annotator.assigned_cameras_count || 0} cameras</span>
                            <span>{annotator.assigned_images_count || 0} images</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Camera Assignment Panel */}
                <div className="camera-assignment-panel">
                  <div className="camera-assignment-content">
                    <h3 className="selected-annotator-header">
                      {selectedAnnotator ? `Selected Annotator: ${getAnnotatorName(selectedAnnotator)}` : 'No Annotator Selected'}
                    </h3>
                    
                    <div className="camera-groups camera-groups-two-columns">
                      <div className="camera-group" ref={assignedCamerasRef}>
                        <h4>Assigned Cameras {selectedAnnotator ? `(${userAssignments[selectedAnnotator]?.length || 0})` : ''}</h4>
                        {selectedAnnotator ? (
                          <div 
                            className={`camera-list assigned fixed-height-container ${dragTargetCamera === 'assigned-section' ? 'drag-over' : ''}`}
                            onDragOver={(e) => handleCameraListDragOver(e, 'assigned-section')}
                            onDragLeave={handleCameraListDragLeave}
                            onDrop={(e) => handleCameraListDrop(e, 'assigned-section')}
                          >
                            {dragTargetCamera === 'assigned-section' && (
                              <div className="drop-indicator-container">
                                <div className="drop-indicator">Drop camera here</div>
                              </div>
                            )}
                            {userAssignments[selectedAnnotator]?.map(cameraId => (
                              <div key={cameraId} className="camera-container">
                                <div 
                                  className="camera-item assigned"
                                  draggable
                                  onDragStart={(e) => handleCameraListDragStart(e, cameraId, selectedAnnotator)}
                                  onDragEnd={handleDragEnd}
                                >
                                  <div className="drag-handle">
                                    <FaGripHorizontal />
                                  </div>
                                  <div className="camera-name">{getCameraName(cameraId)}</div>
                                  <div className="camera-image-count">
                                    <span className="total-count">{cameraStats[cameraId] || 0} images</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                            {userAssignments[selectedAnnotator]?.length === 0 && !dragTargetCamera && (
                              <div className="empty-list-message">No cameras assigned</div>
                            )}
                          </div>
                        ) : (
                          <div className="camera-list assigned fixed-height-container">
                            <div className="selection-required-message">
                              Please select an annotator from the left panel to view and manage camera assignments
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="camera-group">
                        <h4>Unassigned Cameras ({cameraIds.filter(cameraId => !Object.values(userAssignments).some(cameras => cameras.includes(cameraId))).length})</h4>
                        <div 
                          className={`camera-list unassigned fixed-height-container ${dragTargetCamera === 'unassigned-section' ? 'drag-over' : ''}`}
                          onDragOver={(e) => handleCameraListDragOver(e, 'unassigned-section')}
                          onDragLeave={handleCameraListDragLeave}
                          onDrop={(e) => handleCameraListDrop(e, 'unassigned-section')}
                        >
                          {dragTargetCamera === 'unassigned-section' && (
                            <div className="drop-indicator-container">
                              <div className="drop-indicator">Drop here to unassign camera</div>
                            </div>
                          )}
                          {cameraIds
                            .filter(cameraId => !Object.values(userAssignments).some(cameras => cameras.includes(cameraId)))
                            .map(cameraId => {
                              return (
                                <div key={cameraId} className="camera-container">
                                  <div 
                                    className="camera-item unassigned"
                                    draggable={!!selectedAnnotator}
                                    onDragStart={(e) => selectedAnnotator && handleCameraListDragStart(e, cameraId)}
                                    onDragEnd={handleDragEnd}
                                    style={{ cursor: selectedAnnotator ? 'grab' : 'not-allowed' }}
                                  >
                                    <div className="drag-handle">
                                      <FaGripHorizontal />
                                    </div>
                                    <div className="camera-name">{getCameraName(cameraId)}</div>
                                    <div className="camera-image-count">
                                      <span className="total-count">{cameraStats[cameraId] || 0} images</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          {cameraIds.filter(cameraId => 
                            !Object.values(userAssignments).some(cameras => cameras.includes(cameraId))
                          ).length === 0 && !dragTargetCamera && (
                            <div className="empty-list-message">No unassigned cameras</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="assignment-stats">
                <h3>Workload Distribution</h3>
                <div className="workload-bars">
                  {annotators.map(annotator => {
                    const assignedCount = annotator.assigned_images_count || 0;
                    const percentage = stats.totalImages ? (assignedCount / stats.totalImages * 100) : 0;
                    
                    return (
                      <div key={`${annotator.user_id}-${assignedCount}`} className="workload-item">
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskAssignments; 