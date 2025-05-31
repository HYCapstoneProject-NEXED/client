/**
 * Annotation Detail Page
 * 어노테이션 상세 조회 페이지 - 편집 불가능, 확인만 가능
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight, FaTrash, FaPen, FaCheck, FaClock, FaArrowLeft } from 'react-icons/fa';
import ImageCanvas from '../../components/Annotator/ImageCanvas';
import Sidebar from '../../components/Annotator/Sidebar';
import { TOOL_TYPES } from '../../constants/annotationConstants';
import useAnnotationData from '../../hooks/useAnnotationData';
import useAnnotationSelection from '../../hooks/useAnnotationSelection';
import AnnotationService from '../../services/AnnotationService';
import useHistoryControl from '../../hooks/useHistoryControl';
import './AnnotationDetailPage.css';

// API URL 가져오기
const API_URL = process.env.REACT_APP_API_URL || 'http://166.104.246.64:8000';

/**
 * 어노테이션 상세 페이지 컴포넌트
 * 어노테이션 데이터 조회만 가능 (편집 불가)
 */
const AnnotationDetailPage = () => {
  const navigate = useNavigate();
  const { imageId: imageIdParam } = useParams();
  const location = useLocation();
  
  // URL에서 이미지 ID를 가져오거나 기본값 사용 (문자열을 숫자로 변환)
  const [imageId, setImageId] = useState(parseInt(imageIdParam) || 101);
  
  // URL의 쿼리 파라미터에서 선택된 이미지 ID 목록 추출
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Check if we're in admin mode based on URL parameter
  const [isAdminMode, setIsAdminMode] = useState(false);
  
  // History navigation control
  const { navigateBackToHistory } = useHistoryControl();
  
  // 사이드바 접힘/펼침 상태
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // 어노테이션 데이터 로드 (편집 기능 비활성화)
  const annotationData = useAnnotationData(imageId, () => {});
  
  // 어노테이션 선택 관리
  const selection = useAnnotationSelection(annotationData.defects);
  
  // 상태 변경 드롭다운 표시 여부
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  
  // URL에서 selectedIds 쿼리 파라미터 파싱
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const selectedIdsParam = queryParams.get('selectedIds');
    const isAdmin = queryParams.get('isAdmin') === 'true';
    
    setIsAdminMode(isAdmin);
    
    if (selectedIdsParam) {
      const ids = selectedIdsParam
        .split(',')
        .map(id => parseInt(id))
        .filter(id => !isNaN(id));
      
      console.log('URL에서 이미지 ID 목록 추출:', ids);
      
      if (ids.length > 0) {
        setSelectedIds(ids);
        const currentIdIndex = ids.indexOf(parseInt(imageIdParam));
        setCurrentIndex(currentIdIndex >= 0 ? currentIdIndex : 0);
        
        // 실제 현재 이미지 ID 확인
        console.log('현재 이미지 ID:', parseInt(imageIdParam));
        console.log('현재 인덱스:', currentIdIndex >= 0 ? currentIdIndex : 0);
        
        // 선택된 이미지가 2개 이상인 경우 미리 모든 이미지 데이터 로드
        if (ids.length > 1) {
          console.log('여러 이미지 선택됨. 모든 이미지 데이터 미리 로드 시도:', ids);
          
          // 상세 페이지에서는 기존 API를 사용하여 각 이미지 데이터를 개별적으로 로드
          ids.forEach(id => {
            // 현재 이미지는 이미 로드 중이므로 제외
            if (id !== parseInt(imageIdParam)) {
              try {
                // 이미지 상세 정보 미리 로드
                AnnotationService.getImageDetailById(id)
                  .then(imageDetail => {
                    console.log(`이미지 ID ${id} 상세 정보 미리 로드 완료`);
                  })
                  .catch(err => {
                    console.error(`이미지 ID ${id} 상세 정보 미리 로드 실패:`, err);
                  });
                
                // 어노테이션 데이터 미리 로드
                AnnotationService.getAnnotationsByImageId(id)
                  .then(annotations => {
                    console.log(`이미지 ID ${id} 어노테이션 데이터 미리 로드 완료: ${annotations.length}개`);
                  })
                  .catch(err => {
                    console.error(`이미지 ID ${id} 어노테이션 데이터 미리 로드 실패:`, err);
                  });
              } catch (e) {
                console.error(`이미지 ID ${id} 미리 로드 중 오류:`, e);
              }
            }
          });
        }
      } else {
        const singleId = parseInt(imageIdParam);
        console.log('유효한 ID가 없음, 현재 이미지 ID만 사용:', singleId);
        setSelectedIds([singleId]);
      }
    } else {
      const singleId = parseInt(imageIdParam);
      console.log('선택된 이미지 목록 없음, 현재 이미지 ID만 사용:', singleId);
      setSelectedIds([singleId]);
    }
  }, [location.search, imageIdParam]);
  
  // 이전 이미지로 이동
  const handlePrevImage = useCallback(() => {
    if (selectedIds.length <= 1 || currentIndex <= 0) {
      console.log("Cannot go to previous image");
      return;
    }
    
    const prevIndex = currentIndex - 1;
    const prevImageId = selectedIds[prevIndex];
    
    // URL 변경 없이 상태 업데이트
    setImageId(prevImageId);
    setCurrentIndex(prevIndex);
    
    // 이전 이미지의 상세 페이지로 이동하면서 기존 선택 이미지 목록 유지
    navigate(`/annotator/detail/${prevImageId}?selectedIds=${selectedIds.join(',')}`, { replace: true });
  }, [selectedIds, currentIndex, navigate]);
  
  // 다음 이미지로 이동
  const handleNextImage = useCallback(() => {
    if (selectedIds.length <= 1 || currentIndex >= selectedIds.length - 1) {
      console.log("Cannot go to next image");
      return;
    }
    
    const nextIndex = currentIndex + 1;
    const nextImageId = selectedIds[nextIndex];
    
    // URL 변경 없이 상태 업데이트
    setImageId(nextImageId);
    setCurrentIndex(nextIndex);
    
    // 다음 이미지의 상세 페이지로 이동하면서 기존 선택 이미지 목록 유지
    navigate(`/annotator/detail/${nextImageId}?selectedIds=${selectedIds.join(',')}`, { replace: true });
  }, [selectedIds, currentIndex, navigate]);
  
  // 키보드 단축키 이벤트 핸들러 설정
  useEffect(() => {
    const handleKeyDown = (e) => {
      // 포커스가 input, textarea 등에 있을 경우 키보드 단축키 무시
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }
      
      // 왼쪽 화살표 키: 이전 이미지
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevImage();
      }
      // 오른쪽 화살표 키: 다음 이미지
      else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextImage();
      }
    };
    
    // 키보드 이벤트 리스너 등록
    window.addEventListener('keydown', handleKeyDown);
    
    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handlePrevImage, handleNextImage]); // 이제 의존성으로 함수만 전달
  
  // 사이드바 토글 핸들러
  const handleSidebarToggle = (collapsed) => {
    setIsSidebarCollapsed(collapsed);
  };
  
  // 편집 페이지로 이동하는 함수
  const startAnnotating = () => {
    // 편집 페이지로 이동할 때도 선택된 이미지 목록 유지
    // 쿼리 파라미터로 selectedIds 전달
    navigate(`/annotator/edit/${imageId}?selectedIds=${selectedIds.join(',')}`);
  };
  
  // 데이터 삭제 함수
  const handleDelete = () => {
    // 실제 구현에서는 서버에 삭제 요청을 보내야 함
    if (window.confirm('정말로 이 어노테이션을 삭제하시겠습니까?')) {
      console.log('Deleting annotation with ID:', imageId);
      // 삭제 후 항상 대시보드 페이지로 이동
      navigate('/annotator/dashboard');
    }
  };
  
  // 뒤로가기 함수 추가
  const handleGoBack = () => {
    // 항상 대시보드 페이지로 이동
    navigate('/annotator/dashboard');
  };
  
  // 상태 변경 함수
  const updateStatus = async (newStatus) => {
    try {
      // 서버에 상태 업데이트 요청
      const response = await AnnotationService.updateImageStatus(imageId, newStatus);
      
      if (response.success) {
        // 상태 업데이트 성공 시 UI 업데이트
        annotationData.setDataInfo(prev => ({
          ...prev,
          state: newStatus
        }));
        
        // 드롭다운 닫기
        setShowStatusDropdown(false);
        
        console.log(`상태가 ${newStatus}(으)로 업데이트되었습니다.`);
      } else {
        console.error('상태 업데이트 실패:', response.message);
        alert(`상태 업데이트에 실패했습니다: ${response.message}`);
      }
    } catch (error) {
      console.error('상태 업데이트 중 오류 발생:', error);
      alert('상태 업데이트에 실패했습니다.');
    }
  };
  
  // 상태에 따라 아이콘과 색상 반환
  const getStatusInfo = () => {
    const state = annotationData.dataInfo.state;
    let backgroundColor, textColor, icon, label;
    
    switch(state.toLowerCase()) {
      case 'completed':
        backgroundColor = "#E0F2F1";
        textColor = "#00B69B";
        icon = <FaCheck />;
        label = 'Completed';
        break;
      case 'in progress':
        backgroundColor = "#E3F2FD";
        textColor = "#4880FF";
        icon = <FaClock />;
        label = 'In Progress';
        break;
      case 'rejected':
        backgroundColor = "#FFEBEE";
        textColor = "#EF3826";
        icon = <FaTrash />;
        label = 'Rejected';
        break;
      case 'pending':
      default:
        backgroundColor = "#FFF8E1";
        textColor = "#FCAA0B";
        icon = <FaClock />;
        label = state.charAt(0).toUpperCase() + state.slice(1);
        break;
    }
    
    return {
      icon,
      label,
      backgroundColor,
      textColor
    };
  };
  
  const statusInfo = getStatusInfo();

  // 이미지 삭제 처리
  const handleDeleteImage = async () => {
    if (window.confirm('정말로 이 이미지를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      try {
        // 서버에 삭제 요청 보내기
        const response = await AnnotationService.deleteImages([imageId]);
        
        if (response.success) {
          console.log('이미지 삭제 성공:', response);
          alert('이미지가 성공적으로 삭제되었습니다.');
          
          // 대시보드로 이동
          navigate('/annotator/dashboard');
        } else {
          console.error('이미지 삭제 실패:', response.message);
          alert(`이미지 삭제에 실패했습니다: ${response.message}`);
        }
      } catch (error) {
        console.error('이미지 삭제 중 오류 발생:', error);
        alert('이미지 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  // Add new effect to handle browser back button
  useEffect(() => {
    // Push a new state first to ensure we can capture back button
    window.history.pushState({ page: 'detail' }, '', window.location.href);
    
    // This history listener will be called on popstate events (browser back/forward buttons)
    const handlePopState = () => {
      // Always navigate to dashboard when back button is pressed
      navigate('/annotator/dashboard');
    };
    
    // Add event listener for popstate (back button)
    window.addEventListener('popstate', handlePopState);
    
    // Cleanup on unmount
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate]);

  /**
   * Handle back button click to return to admin history page
   */
  const handleBackToHistory = () => {
    navigateBackToHistory();
  };

  // Add effect to log image path
  useEffect(() => {
    if (annotationData.dataInfo?.filePath) {
      console.log('Using image path:', annotationData.dataInfo.filePath);
    }
  }, [annotationData.dataInfo?.filePath]);

  // 이미지 URL 구성
  const getImageUrl = () => {
    // 이미지 파일 경로가 있는 경우 (API 응답에서 가져온 경우)
    if (annotationData.dataInfo?.filePath) {
      // 이미 전체 URL인 경우 그대로 사용
      if (annotationData.dataInfo.filePath.startsWith('http')) {
        return annotationData.dataInfo.filePath;
      }
      // API URL과 결합하여 완전한 URL 생성
      return `${API_URL}/${annotationData.dataInfo.filePath}`;
    }
    
    // 이미지 ID만 있는 경우 이미지 ID 기반 URL 구성
    return `${API_URL}/images/${imageId}`;
  };

  /**
   * 바운딩 박스 좌표 변환 (정규화된 YOLO 형식 → 픽셀 좌표)
   * @param {Object} box - 바운딩 박스 좌표 (x_center, y_center, w, h)
   * @returns {Object} 변환된 좌표 (x, y, width, height)
   */
  const transformBoundingBox = (box) => {
    // 이미지 크기 (API 응답에서 가져온 값 또는 기본값 사용)
    const imageWidth = annotationData.dataInfo?.dimensions?.width || 640;
    const imageHeight = annotationData.dataInfo?.dimensions?.height || 640;
    
    // 이미 x, y, width, height 형식인 경우 그대로 반환
    if (box.x !== undefined && box.width !== undefined) {
      return box;
    }
    
    // YOLO 형식 (중심점 + 너비/높이) → 좌상단 좌표 + 너비/높이
    if (box.x_center !== undefined || box.cx !== undefined) {
      const centerX = box.x_center !== undefined ? box.x_center : box.cx;
      const centerY = box.y_center !== undefined ? box.y_center : box.cy;
      const width = box.w;
      const height = box.h;
      
      // 정규화된 좌표를 픽셀 단위로 변환
      const pixelWidth = width * imageWidth;
      const pixelHeight = height * imageHeight;
      const pixelX = (centerX * imageWidth) - (pixelWidth / 2);
      const pixelY = (centerY * imageHeight) - (pixelHeight / 2);
      
      return {
        x: pixelX,
        y: pixelY,
        width: pixelWidth,
        height: pixelHeight
      };
    }
    
    // 지원되지 않는 형식인 경우 원래 값 반환
    return box;
  };

  // 로딩 중일 때 표시할 내용
  if (annotationData.isLoading) {
    return (
      <div className="annotator-annotation-edit-page">
        <div className="annotator-detail-header">
          <h1>Annotation Details</h1>
          
          <div className="header-actions">
            {/* 로딩 중에는 버튼 표시하지 않음 */}
          </div>
        </div>
        <div className="annotator-loading">
          <div className="loader"></div>
          <p>Loading annotation data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="annotator-annotation-edit-page">
      {/* 헤더 */}
      <div className="annotator-detail-header">
        {isAdminMode && (
          <button 
            className="back-to-history-btn"
            onClick={handleBackToHistory}
            title="Back to History"
          >
            <FaArrowLeft /> Back to History
          </button>
        )}
        <h1>Annotation Details</h1>
        
        <div className="header-actions">
          {/* 네비게이션 컨트롤 추가 */}
          {selectedIds.length > 1 && (
            <div className="detail-navigation">
              <button 
                className="nav-btn prev-btn"
                onClick={handlePrevImage}
                disabled={currentIndex <= 0}
                title="Previous Image"
              >
                <FaChevronLeft size={16} />
              </button>
              
              <span className="nav-position">
                {currentIndex + 1} / {selectedIds.length}
              </span>
              
              <button 
                className="nav-btn next-btn"
                onClick={handleNextImage}
                disabled={currentIndex >= selectedIds.length - 1}
                title="Next Image"
              >
                <FaChevronRight size={16} />
              </button>
            </div>
          )}
          
          {/* Only show edit and delete buttons when not in admin mode */}
          {!isAdminMode && (
            <>
              <button 
                className="start-annotating-btn"
                onClick={startAnnotating}
                title="Edit Annotation"
                style={{ width: 'auto', padding: '0 15px' }}
              >
                <FaPen size={16} style={{ marginRight: '5px' }} /> Annotate
              </button>
              
              <button 
                className="delete-btn"
                onClick={handleDeleteImage}
                title="Delete Annotation"
                style={{ width: 'auto', padding: '0 15px' }}
              >
                <span style={{ fontSize: '14px', display: 'flex', alignItems: 'center' }}>
                  <FaTrash size={16} style={{ marginRight: '5px' }} /> Delete
                </span>
              </button>
            </>
          )}
        </div>
      </div>
      
      {/* 메인 컨텐츠 영역 - EditPage와 완전히 동일한 구조 */}
      <div className={`annotator-body-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="annotator-sidebar-wrapper">
          <Sidebar 
            dataInfo={annotationData.dataInfo}
            defects={annotationData.defects}
            selectedDefect={selection.selectedDefect}
            selectedDefectDetail={selection.selectedDefectDetail}
            onDefectSelect={selection.handleDefectSelect}
            toolTypes={TOOL_TYPES}
            isCollapsed={isSidebarCollapsed}
            onToggle={handleSidebarToggle}
            readOnly={false} // 상태 변경을 위해 readOnly를 false로 설정
            onStatusChange={updateStatus} // 상태 변경 핸들러 전달
          />
        </div>
        <div className="annotator-main-wrapper">
          <div className="annotator-canvas-wrapper">
            <ImageCanvas 
              defects={annotationData.defects}
              selectedDefect={selection.selectedDefect}
              onDefectSelect={selection.handleDefectSelect}
              activeTool={TOOL_TYPES.HAND} // 항상 핸드 툴 사용 (편집 불가)
              toolTypes={TOOL_TYPES}
              onCanvasClick={selection.handleCanvasClick}
              readOnly={true} // 읽기 전용 모드 활성화
              imageSrc={getImageUrl()}
              imageDimensions={annotationData.dataInfo.dimensions} // API 응답에서 가져온 이미지 크기 전달
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnotationDetailPage; 