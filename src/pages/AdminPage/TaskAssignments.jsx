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
        // 1. 이미지 정보 fetch
        const allImages = await AnnotationService.getAllImages();
        setImages(allImages);
        const uniqueCameraIds = [...new Set(allImages.map(img => img.camera_id))];
        setCameraIds(uniqueCameraIds);
        const imagesByCameraId = {};
        uniqueCameraIds.forEach(cameraId => {
          imagesByCameraId[cameraId] = allImages.filter(img => img.camera_id === cameraId);
        });
        setImagesPerCamera(imagesByCameraId);
        // 2. 유저 정보 fetch
        const allUsers = await UserService.getAllUsers();
        const annotatorUsers = allUsers.filter(user => 
          (user.user_type === 'Annotator' || user.user_type === 'annotator') && user.is_active
        );
        setAnnotators(annotatorUsers);
        // 3. 카메라별 이미지 수 계산
        const camStats = {};
        uniqueCameraIds.forEach(cameraId => {
          camStats[cameraId] = allImages.filter(img => img.camera_id === cameraId).length;
        });
        setCameraStats(camStats);
        // 4. 서버에서 할당 정보 fetch
        const initialUserAssignments = {};
        annotatorUsers.forEach(annotator => {
          initialUserAssignments[annotator.user_id] = [];
        });
        try {
          const savedAssignments = await AnnotationService.getSavedAssignments();
          if (savedAssignments.success && savedAssignments.assignments && savedAssignments.assignments.cameraAssignments) {
            setUserAssignments(savedAssignments.assignments.cameraAssignments);
          } else {
            setUserAssignments(initialUserAssignments);
          }
        } catch (error) {
          setUserAssignments(initialUserAssignments);
        }
        // 5. 어노테이터 선택
        if (annotatorUsers.length > 0) {
          setSelectedAnnotator(String(annotatorUsers[0].user_id));
        }
        setIsLoading(false);
        // 6. 모든 상태가 세팅된 후에만 작업량 분포 계산
        setTimeout(() => {
          updateWorkloadDistribution();
        }, 0);
      } catch (error) {
        setErrorMessage(`Failed to load data: ${error.message || 'Unknown error'}`);
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);
  
  // forceUpdate 이벤트 리스너 추가
  useEffect(() => {
    const handleForceUpdate = () => {
      // 상태를 업데이트하여 강제로 리렌더링 발생
      setStats(prevStats => ({...prevStats}));
    };
    
    window.addEventListener('forceUpdate', handleForceUpdate);
    
    return () => {
      window.removeEventListener('forceUpdate', handleForceUpdate);
    };
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
    
    const totalImages = images.length;
    const totalAssigned = Object.values(newAnnotatorStats).reduce((sum, count) => sum + count, 0);
    
    console.log("어노테이터별 할당량:", newAnnotatorStats);
    console.log("총 할당 이미지:", totalAssigned, "/", totalImages);
    
    // 상태 업데이트
    setStats({
      annotators: newAnnotatorStats,
      totalImages: totalImages,
      totalAssigned: totalAssigned
    });
  }, [annotators, userAssignments, cameraStats, images.length]);

  // 상태 변경 시 작업량 분포 업데이트 - 의존성 배열 수정
  useEffect(() => {
    if (!isLoading) {
      updateWorkloadDistribution();
    }
  }, [userAssignments, isLoading, updateWorkloadDistribution]);

  // 이미지 개수 가져오기 함수 (실시간 계산)
  const getImageCount = (annotatorId) => {
    let count = 0;
    userAssignments[annotatorId]?.forEach(cameraId => {
      count += cameraStats[cameraId] || 0;
    });
    return count;
  };
    
  // 카메라 개수 가져오기 함수 (실시간 계산)
  const getCameraCount = (annotatorId) => {
    return userAssignments[annotatorId]?.length || 0;
  };
  
  const handleAnnotatorChange = (e) => {
    setSelectedAnnotator(e.target.value);
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
    const cameraId = e.dataTransfer.getData('camera_id');
    const currentOwner = e.dataTransfer.getData('current_owner') || null;
    
    // 드롭 타겟이 'assigned-section'이면 현재 선택된 어노테이터에게 할당
    const targetAnnotatorId = target === 'assigned-section' ? selectedAnnotator : target;
    
    console.log('Drop 이벤트 발생:', cameraId, currentOwner, '→', targetAnnotatorId);
    
    // 동일한 어노테이터에게 드롭한 경우 무시
    if (currentOwner === targetAnnotatorId) {
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
    
    // 2. 새 소유자에게 추가 (어느 경우든 적용)
    console.log('새 소유자에게 추가:', targetAnnotatorId);
    if (!updatedAssignments[targetAnnotatorId]) {
      updatedAssignments[targetAnnotatorId] = [];
    }
    if (!updatedAssignments[targetAnnotatorId].includes(cameraId)) {
      updatedAssignments[targetAnnotatorId].push(cameraId);
    }
    
    // 상태 업데이트
    setUserAssignments(updatedAssignments);
    
    console.log('할당 정보 업데이트 완료');
    
    setIsDragActive(false);
    setDragTargetCamera(null);
    
    // 작업량 분포 즉시 업데이트
    setTimeout(() => {
      updateWorkloadDistribution();
    }, 100);
  };
  
  const handleDragEnd = () => {
    setIsDragActive(false);
    setDragTargetCamera(null);
  };
  
  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      
      // Prepare data for API - camera level assignments only
      const assignmentsToSave = {
        cameraAssignments: userAssignments
      };
      
      // Call the API endpoint to assign tasks
      const response = await AnnotationService.assignTasksByUserId(assignmentsToSave);
      
      // 작업량 분포 업데이트
      const annotatorStats = {};
      annotators.forEach(annotator => {
        annotatorStats[annotator.user_id] = 0;
      });

      // 카메라 할당 기반으로 계산
      Object.entries(userAssignments).forEach(([annotatorId, cameras]) => {
        if (cameras && annotatorStats[annotatorId] !== undefined) {
          cameras.forEach(cameraId => {
            annotatorStats[annotatorId] += cameraStats[cameraId] || 0;
          });
        }
      });
      
      const totalImages = images.length;
      const totalAssigned = Object.values(annotatorStats).reduce((sum, count) => sum + count, 0);
      
      setStats({
        annotators: annotatorStats,
        totalImages: totalImages,
        totalAssigned: totalAssigned
      });
      
      console.log('작업 할당 저장 완료 - 작업량 분포:', annotatorStats);
      
      setSuccessMessage('작업이 성공적으로 할당되었습니다!');
      setTimeout(() => setSuccessMessage(''), 5000);
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
      
      // 작업량 분포 강제 업데이트
      setTimeout(() => {
        const event = new Event('forceUpdate');
        window.dispatchEvent(event);
      }, 300);
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
    updateWorkloadDistribution();
  };
  
  const handleClearAssignments = () => {
    // 상태만 초기화하고 서버에는 반영하지 않음
    // 저장 버튼을 눌러야 서버에 반영됨
    // 카메라 할당 초기화
    const clearedAssignments = {};
    annotators.forEach(annotator => {
      clearedAssignments[annotator.user_id] = [];
    });
    setUserAssignments(clearedAssignments);
    // 작업량 분포 업데이트
    const clearedStats = {
      annotators: {},
      totalImages: images.length,
      totalAssigned: 0
    };
    annotators.forEach(annotator => {
      clearedStats.annotators[annotator.user_id] = 0;
    });
    setStats(clearedStats);
  };
  
  const getAnnotatorName = (annotatorId) => {
    const annotator = annotators.find(a => a.user_id === Number(annotatorId));
    return annotator ? annotator.name : '알 수 없음';
  };
  
  const getAssignmentSummary = () => {
    const assignedCount = cameraIds.filter(cameraId => 
      Object.values(userAssignments).some(userCameras => userCameras.includes(cameraId))
    ).length;
    return `${assignedCount} / ${cameraIds.length} (${cameraIds.length ? Math.round(assignedCount / cameraIds.length * 100) : 0}%)`;
  };
  
  const getCameraName = (cameraId) => {
    return `카메라 ${cameraId}`;
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
        <DashboardHeader title="Admin" />
        
        <div className="dashboard-content">
          <div className="admin-controls">
            <div>
              <h1>작업 할당</h1>
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
                    {stats.totalAssigned} / {stats.totalImages} {stats.totalImages ? `(${Math.round(stats.totalAssigned / stats.totalImages * 100)}%)` : '(-)'}
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
                <button 
                  className="primary-button" 
                  onClick={handleSubmit}
                  disabled={isLoading}
                >
                  작업 할당 저장
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
                      >
                        {selectedAnnotator === String(annotator.user_id) && (
                          <div className="selected-indicator">
                            <FaCheck />
                          </div>
                        )}
                        <div className="annotator-info">
                          <div className="annotator-name">{annotator.name}</div>
                          <div className="annotator-stats">
                            <span>{getCameraCount(annotator.user_id)} 카메라</span>
                            <span>{getImageCount(annotator.user_id)} 이미지</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* 카메라 할당 패널 */}
                <div className="camera-assignment-panel">
                  {selectedAnnotator ? (
                    <div className="camera-assignment-content">
                      <h3 className="selected-annotator-header">
                        선택된 어노테이터: {getAnnotatorName(selectedAnnotator)}
                      </h3>
                      
                      <div className="camera-groups camera-groups-two-columns">
                        <div className="camera-group" ref={assignedCamerasRef}>
                          <h4>할당된 카메라 ({userAssignments[selectedAnnotator]?.length || 0})</h4>
                          <div 
                            className={`camera-list assigned fixed-height-container ${dragTargetCamera === 'assigned-section' ? 'drag-over' : ''}`}
                            onDragOver={(e) => handleCameraListDragOver(e, 'assigned-section')}
                            onDragLeave={handleCameraListDragLeave}
                            onDrop={(e) => handleCameraListDrop(e, 'assigned-section')}
                          >
                            {dragTargetCamera === 'assigned-section' && (
                              <div className="drop-indicator-container">
                                <div className="drop-indicator">여기에 카메라 놓기</div>
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
                                    <span className="total-count">{cameraStats[cameraId] || 0} 이미지</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                            {userAssignments[selectedAnnotator]?.length === 0 && !dragTargetCamera && (
                              <div className="empty-list-message">할당된 카메라가 없습니다</div>
                            )}
                          </div>
                        </div>
                        
                        <div className="camera-group">
                          <h4>미할당 카메라</h4>
                          <div className="camera-list unassigned fixed-height-container">
                            {cameraIds
                              .filter(cameraId => !Object.values(userAssignments).some(cameras => cameras.includes(cameraId)))
                              .map(cameraId => {
                                return (
                                  <div key={cameraId} className="camera-container">
                                    <div 
                                      className="camera-item unassigned"
                                      draggable
                                      onDragStart={(e) => handleCameraListDragStart(e, cameraId)}
                                      onDragEnd={handleDragEnd}
                                    >
                                      <div className="drag-handle">
                                        <FaGripHorizontal />
                                      </div>
                                      <div className="camera-name">{getCameraName(cameraId)}</div>
                                      <div className="camera-image-count">
                                        <span className="total-count">{cameraStats[cameraId] || 0} 이미지</span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            {cameraIds.filter(cameraId => 
                              !Object.values(userAssignments).some(cameras => cameras.includes(cameraId))
                            ).length === 0 && (
                              <div className="empty-list-message">미할당 카메라가 없습니다</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="no-selection-message">
                      왼쪽 패널에서 어노테이터를 선택하세요
                    </div>
                  )}
                </div>
              </div>
              
              <div className="assignment-stats">
                <h3>작업량 분포</h3>
                <div className="workload-bars" key={`workload-${JSON.stringify(stats)}`}>
                  {annotators.map(annotator => {
                    const assignedCount = getImageCount(annotator.user_id);
                    const percentage = stats.totalImages ? (assignedCount / stats.totalImages * 100) : 0;
                    
                    return (
                      <div key={`${annotator.user_id}-${assignedCount}`} className="workload-item">
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskAssignments; 