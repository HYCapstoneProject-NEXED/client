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
import './AnnotationDetailPage.css';

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
    try {
      const queryParams = new URLSearchParams(location.search);
      const selectedIdsParam = queryParams.get('selectedIds');
      
      // Check if we're in admin mode
      const adminParam = queryParams.get('isAdmin');
      setIsAdminMode(adminParam === 'true');
      
      if (selectedIdsParam) {
        // 쉼표로 구분된 ID 문자열을 정수 배열로 변환
        const ids = selectedIdsParam
          .split(',')
          .map(id => parseInt(id))
          .filter(id => !isNaN(id));
        
        if (ids.length > 0) {
          setSelectedIds(ids);
          
          // 현재 URL의 이미지 ID가 선택된 이미지 목록에 있는지 확인
          const currentId = parseInt(imageIdParam);
          const index = ids.findIndex(id => id === currentId);
          
          // 현재 이미지의 인덱스 설정 (없으면 첫 번째 이미지로)
          if (index !== -1) {
            setCurrentIndex(index);
          } else {
            // 현재 이미지가 목록에 없는 경우, 목록에 추가
            const newIds = [...ids, currentId];
            setSelectedIds(newIds);
            setCurrentIndex(newIds.length - 1);
          }
        } else {
          // 유효한 ID가 없으면 현재 이미지만 사용
          setSelectedIds([parseInt(imageIdParam)]);
          setCurrentIndex(0);
        }
      } else {
        // 쿼리 파라미터가 없는 경우 현재 이미지만 포함
        setSelectedIds([parseInt(imageIdParam)]);
        setCurrentIndex(0);
      }
    } catch (error) {
      console.error("Error parsing query parameters:", error);
      // 오류 발생 시 기본값 사용
      setSelectedIds([parseInt(imageIdParam)]);
      setCurrentIndex(0);
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
      await AnnotationService.updateImageStatus(imageId, newStatus);
      
      // 상태 업데이트 성공 시 UI 업데이트
      annotationData.setDataInfo(prev => ({
        ...prev,
        state: newStatus
      }));
      
      // 드롭다운 닫기
      setShowStatusDropdown(false);
      
      console.log(`Status updated to: ${newStatus}`);
    } catch (error) {
      console.error('Failed to update status:', error);
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
                onClick={handleDelete}
                title="Delete Annotation"
                style={{ width: 'auto', padding: '0 15px' }}
              >
                <span style={{ fontSize: '14px', display: 'flex', alignItems: 'center' }}>
                  <FaTrash size={16} style={{ marginRight: '5px' }} /> Delete
                </span>
              </button>
            </>
          )}
          
          {/* Show Back to History button in admin mode */}
          {isAdminMode && (
            <button 
              className="back-btn"
              onClick={() => navigate('/admin/history')}
              title="Back to History"
              style={{ width: 'auto', padding: '0 15px' }}
            >
              <span style={{ fontSize: '14px', display: 'flex', alignItems: 'center' }}>
                <FaArrowLeft size={16} style={{ marginRight: '5px' }} /> Back to History
              </span>
            </button>
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
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnotationDetailPage; 