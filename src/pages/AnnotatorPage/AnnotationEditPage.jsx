/**
 * 어노테이션 편집 페이지
 * 이미지 로딩, 바운딩 박스 편집, 히스토리 관리 등 어노테이션의 핵심 기능을 포함
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Header from '../../components/Annotator/Header';
import Sidebar from '../../components/Annotator/Sidebar';
import ImageCanvas from '../../components/Annotator/ImageCanvas';
import AnnotationTools from '../../components/Annotator/AnnotationTools';
import { TOOL_TYPES } from '../../constants/annotationConstants';
import useAnnotationHistory from '../../hooks/useAnnotationHistory';
import useAnnotationData from '../../hooks/useAnnotationData';
import useAnnotationSelection from '../../hooks/useAnnotationSelection';
import './AnnotationEditPage.css';

/**
 * 어노테이션 편집 페이지 컴포넌트
 * 어노테이션 생성, 편집, 저장 기능 제공
 */
const AnnotationEditPage = () => {
  const navigate = useNavigate();
  const { imageId: imageIdParam } = useParams();
  const location = useLocation();
  
  // URL에서 이미지 ID를 가져오거나 기본값 사용 (문자열을 숫자로 변환)
  const [imageId] = useState(parseInt(imageIdParam) || 101);
  
  // URL에서 selectedIds 쿼리 파라미터 추출
  const [selectedIds, setSelectedIds] = useState([]);
  
  // URL 쿼리 파라미터에서 selectedIds 파싱
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const selectedIdsParam = queryParams.get('selectedIds');
    
    if (selectedIdsParam) {
      const ids = selectedIdsParam
        .split(',')
        .map(id => parseInt(id))
        .filter(id => !isNaN(id));
      
      if (ids.length > 0) {
        setSelectedIds(ids);
      } else {
        setSelectedIds([parseInt(imageIdParam)]);
      }
    } else {
      setSelectedIds([parseInt(imageIdParam)]);
    }
  }, [location.search, imageIdParam]);
  
  // 사이드바 접힘/펼침 상태
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // 사이드바 토글 이벤트 핸들러
  const handleSidebarToggle = (collapsed) => {
    setIsSidebarCollapsed(collapsed);
  };
  
  // 어노테이션 히스토리 관리 훅 사용
  const {
    addToHistory,
    handleUndo,
    handleRedo,
    canUndo,
    canRedo
  } = useAnnotationHistory(
    (defects) => annotationData.setDefects(defects),
    (selectedDefect) => selection.setSelectedDefect(selectedDefect)
  );

  // 어노테이션 데이터 관리 훅 사용
  const annotationData = useAnnotationData(imageId, addToHistory);

  // 어노테이션 선택 관리 훅 사용
  const selection = useAnnotationSelection(annotationData.defects);

  // 페이지를 떠날 때 저장되지 않은 변경 사항 확인
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (annotationData.hasUnsavedChanges) {
        // 변경 사항이 있는 경우 경고 메시지 표시
        const message = '변경 사항이 저장되지 않았습니다. 정말 페이지를 떠나시겠습니까?';
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [annotationData.hasUnsavedChanges]);
  
  /**
   * 어노테이션 저장 후 상세 페이지로 이동
   */
  const handleSaveAndNavigate = async () => {
    try {
      // 저장 함수 호출
      await annotationData.saveAnnotations();
      
      // 저장 성공 후 상세 페이지로 이동 (selectedIds 유지)
      navigate(`/annotator/detail/${imageId}?selectedIds=${selectedIds.join(',')}&fromEdit=true`);
    } catch (error) {
      console.error('Failed to save annotation:', error);
      // 오류 처리 (실제 구현에서는 사용자에게 알림 표시)
      alert('저장에 실패했습니다. 다시 시도해 주세요.');
    }
  };
  
  /**
   * 뒤로가기 함수 - 무조건 디테일 페이지로 이동
   */
  const handleGoBack = () => {
    if (annotationData.hasUnsavedChanges) {
      const confirmed = window.confirm('변경 사항이 저장되지 않을 수 있습니다. 계속 진행하시겠습니까?');
      if (confirmed) {
        navigate(`/annotator/detail/${imageId}?selectedIds=${selectedIds.join(',')}&fromEdit=true`);
      }
    } else {
      navigate(`/annotator/detail/${imageId}?selectedIds=${selectedIds.join(',')}&fromEdit=true`);
    }
  };
  
  // Handle browser back button press with improved implementation
  useEffect(() => {
    // This function will be called when the back button is pressed
    const handleBackNavigation = (e) => {
      // If there are unsaved changes, show confirmation dialog
      if (annotationData.hasUnsavedChanges) {
        // Need to prevent default first to show dialog
        e.preventDefault();
        
        const confirmed = window.confirm('변경 사항이 저장되지 않을 수 있습니다. 저장하시겠습니까?');
        if (confirmed) {
          // If confirmed, save and navigate to detail page
          handleSaveAndNavigate();
        } else {
          // If not confirmed, navigate to detail page without saving
          navigate(`/annotator/detail/${imageId}?selectedIds=${selectedIds.join(',')}`);
        }
      }
      // If no unsaved changes, let the browser handle the back navigation normally
    };
    
    // For beforeunload (page refresh, closing tab)
    const handleBeforeUnload = (e) => {
      if (annotationData.hasUnsavedChanges) {
        const message = '변경 사항이 저장되지 않았습니다. 정말 페이지를 떠나시겠습니까?';
        e.returnValue = message;
        return message;
      }
    };
    
    // Add event listeners
    window.addEventListener('popstate', handleBackNavigation);
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Cleanup
    return () => {
      window.removeEventListener('popstate', handleBackNavigation);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [annotationData.hasUnsavedChanges, imageId, selectedIds, navigate, handleSaveAndNavigate]);

  /**
   * 클래스 선택 핸들러
   * @param {string} defectType - 결함 유형
   */
  const handleClassSelect = (defectType) => {
    selection.handleClassSelect(defectType, annotationData.updateDefectClass);
  };

  /**
   * 바운딩 박스 추가 핸들러
   * @param {Object} coordinates - 좌표 정보
   * @param {string} defectType - 결함 유형 (선택 사항)
   */
  const handleAddBox = (coordinates, defectType = null) => {
    // 명시적으로 전달된 결함 유형 또는 현재 선택된 결함 유형 사용
    const typeToUse = defectType || selection.currentDefectType || 'Scratch';
    const newId = annotationData.addBox(coordinates, typeToUse);
    selection.setSelectedDefect(newId);
  };

  // 로딩 중일 때 표시할 내용
  if (annotationData.isLoading) {
    return (
      <div className="annotator-annotation-edit-page">
        <Header
          onSave={handleSaveAndNavigate}
        />
        <div className="annotator-loading">
          <div className="loader"></div>
          <p>어노테이션 데이터 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="annotator-annotation-edit-page">
      <Header
        onSave={handleSaveAndNavigate}
      />
      <div className={`annotator-body-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="annotator-sidebar-wrapper">
          <Sidebar 
            dataInfo={annotationData.dataInfo}
            defects={annotationData.defects}
            selectedDefect={selection.selectedDefect}
            selectedDefectDetail={selection.selectedDefectDetail}
            onDefectSelect={selection.handleDefectSelect}
            onToolChange={selection.handleToolChange}
            toolTypes={TOOL_TYPES}
            isCollapsed={isSidebarCollapsed}
            onToggle={handleSidebarToggle}
            defectClasses={annotationData.defectClasses}
          />
        </div>
        <div className="annotator-main-wrapper">
          <div className="annotator-tools-container">
            <AnnotationTools 
              activeTool={selection.activeTool}
              onToolChange={selection.handleToolChange}
              selectedDefectType={selection.currentDefectType}
              onClassSelect={handleClassSelect}
              onUndo={handleUndo}
              onRedo={handleRedo}
              canUndo={canUndo}
              canRedo={canRedo}
              onDelete={selection.selectedDefect ? 
                () => annotationData.deleteDefect(selection.selectedDefect) : null}
              defectClasses={annotationData.defectClasses}
            />
          </div>
          <div className="annotator-canvas-wrapper">
            <ImageCanvas 
              defects={annotationData.defects}
              selectedDefect={selection.selectedDefect}
              onDefectSelect={selection.handleDefectSelect}
              activeTool={selection.activeTool}
              toolTypes={TOOL_TYPES}
              onCoordinateChange={annotationData.updateCoordinates}
              onAddBox={handleAddBox}
              onCanvasClick={selection.handleCanvasClick}
              onToolChange={selection.handleToolChange}
              currentDefectType={selection.currentDefectType}
              defectClasses={annotationData.defectClasses}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnotationEditPage; 