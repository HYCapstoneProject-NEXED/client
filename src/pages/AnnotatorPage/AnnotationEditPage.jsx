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
  
  // 저장 중 상태
  const [isSaving, setIsSaving] = useState(false);
  
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
    // defects 업데이트 콜백
    (newDefects) => {
      console.log('History update callback triggered - updating defects');
      console.log('New defects from history:', newDefects);
      annotationData.setDefects(newDefects);
      // 변경 사항 있음으로 표시
      annotationData.setHasUnsavedChanges(true);
    },
    // 선택된 defect 업데이트 콜백
    (newSelectedDefect) => {
      console.log('History update callback triggered - updating selected defect');
      console.log('New selected defect from history:', newSelectedDefect);
      selection.setSelectedDefect(newSelectedDefect);
    }
  );

  // 어노테이션 데이터 관리 훅 사용
  const annotationData = useAnnotationData(imageId, addToHistory);

  // 어노테이션 선택 관리 훅 사용
  const selection = useAnnotationSelection(annotationData.defects, annotationData.defectClasses);
  
  /**
   * Detail View 페이지로 이동하는 함수
   */
  const navigateToDetailView = () => {
    // Detail View 페이지 URL 생성
    const detailPageUrl = `/annotator/detail/${imageId}?selectedIds=${selectedIds.join(',')}&fromEdit=true`;
    
    // 페이지 이동 (히스토리에 새 항목 추가하지 않고 현재 URL로 이동)
    window.location.replace(detailPageUrl);
  };
  
  /**
   * 어노테이션 저장 후 상세 페이지로 이동
   */
  const handleSaveAndNavigate = async () => {
    try {
      // 변경 사항이 없는 경우 바로 detail view 페이지로 이동
      if (!annotationData.hasUnsavedChanges) {
        alert('변경 사항이 없습니다.');
        navigateToDetailView();
        return false;
      }
      
      console.log('저장 시작: 어노테이션 데이터 저장 중...');
      
      // 저장 중 상태로 설정
      setIsSaving(true);
      
      // 저장 함수 호출
      const success = await annotationData.saveAnnotations();
      
      // 저장 완료 후 저장 중 상태 해제
      setIsSaving(false);
      
      if (success) {
        console.log('저장 성공: 어노테이션 저장 완료, 상세 페이지로 이동 준비');
        
        // 저장 성공 알림 후 바로 페이지 이동
        alert('저장이 완료되었습니다.');
        navigateToDetailView();
        return true;
      } else {
        console.error('저장 실패: saveAnnotations 함수가 false 반환');
        alert('저장에 실패했습니다. 다시 시도해 주세요.');
        return false;
      }
    } catch (error) {
      console.error('저장 오류:', error);
      setIsSaving(false);
      alert('저장에 실패했습니다. 다시 시도해 주세요.');
      return false;
    }
  };

  /**
   * 뒤로가기 버튼 클릭 핸들러 (UI의 뒤로가기 버튼용)
   */
  const handleGoBack = () => {
    if (annotationData.hasUnsavedChanges) {
      const confirmed = window.confirm('변경 사항이 있습니다. 저장하시겠습니까?');
      if (confirmed) {
        handleSaveAndNavigate();
      } else {
        // 저장하지 않고 디테일 페이지로 이동 (히스토리 항목 대체)
        navigateToDetailView();
      }
    } else {
      // 변경 사항 없으면 바로 디테일 페이지로 이동
      navigateToDetailView();
    }
  };

  // 브라우저 뒤로가기 버튼 처리
  useEffect(() => {
    // 페이지 로드 시 한 번만 실행되는 초기화 함수
    const setupBackButton = () => {
      // 브라우저 뒤로가기 버튼을 활성화하기 위해 현재 상태를 history에 추가
      window.history.pushState({ page: 'edit-page' }, '', window.location.href);
      console.log('History state initialized for back button');
    };
    
    // 뒤로가기 감지 및 처리 함수
    const handlePopState = (event) => {
      console.log('Back button pressed, handling navigation');
      
      // 저장 여부 확인 및 페이지 이동 처리
      if (annotationData.hasUnsavedChanges) {
        // 저장 여부 확인
        if (window.confirm('변경 사항이 있습니다. 저장하시겠습니까?')) {
          // 저장 후 디테일 페이지로 이동
          (async () => {
            try {
              console.log('저장 시작: 뒤로가기 처리');
              setIsSaving(true);
              const success = await annotationData.saveAnnotations();
              setIsSaving(false);
              
              if (success) {
                console.log('저장 성공: 뒤로가기 처리 완료, 상세 페이지로 이동 준비');
                alert('저장이 완료되었습니다.');
                navigateToDetailView();
              } else {
                console.error('저장 실패: 뒤로가기 처리');
                alert('저장에 실패했습니다.');
                navigateToDetailView();
              }
            } catch (error) {
              console.error('저장 오류:', error);
              setIsSaving(false);
              alert('저장에 실패했습니다.');
              navigateToDetailView();
            }
          })();
        } else {
          // 저장하지 않고 디테일 페이지로 이동
          console.log('저장 취소: 변경사항 저장하지 않고 이동');
          navigateToDetailView();
        }
      } else {
        // 변경 사항 없으면 바로 디테일 페이지로 이동
        console.log('변경사항 없음: 바로 상세 페이지로 이동');
        navigateToDetailView();
      }
    };
    
    // 초기화 실행
    setupBackButton();
    
    // 뒤로가기 이벤트 리스너 등록
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      // 컴포넌트 언마운트 시 리스너 제거
      window.removeEventListener('popstate', handlePopState);
    };
  }, [imageId, selectedIds, annotationData]);
  
  // 컴포넌트 마운트 시 history state 설정
  useEffect(() => {
    // 뒤로가기 버튼이 항상 활성화되도록 현재 URL을 히스토리에 추가
    // 페이지 로드 시 한 번만 실행
    setTimeout(() => {
      window.history.pushState({ page: 'edit' }, '', window.location.href);
      console.log('History entry added to enable back button');
    }, 100);
  }, []);
  
  /**
   * 클래스 선택 핸들러
   * @param {string} defectType - 결함 유형
   */
  const handleClassSelect = async (defectType) => {
    try {
      await selection.handleClassSelect(defectType, annotationData.updateDefectClass);
    } catch (error) {
      console.error('결함 클래스 선택 오류:', error);
    }
  };

  /**
   * 바운딩 박스 추가 핸들러
   * @param {Object} coordinates - 좌표 정보
   * @param {string} defectType - 결함 유형 (선택 사항)
   */
  const handleAddBox = async (coordinates, defectType = null) => {
    try {
      // 명시적으로 전달된 결함 유형 또는 현재 선택된 결함 유형 사용
      const typeToUse = defectType || selection.currentDefectType || 'Scratch';
      const newId = await annotationData.addBox(coordinates, typeToUse);
      
      if (newId) {
        selection.setSelectedDefect(newId);
      } else {
        console.warn('바운딩 박스 추가에 실패했습니다');
      }
    } catch (error) {
      console.error('바운딩 박스 추가 오류:', error);
    }
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

  // 이미지 URL 구성
  const getImageUrl = () => {
    // 이미지 파일 경로가 있는 경우 (API 응답에서 가져온 경우)
    if (annotationData.dataInfo?.filePath) {
      // 이미 전체 URL인 경우 그대로 사용
      if (annotationData.dataInfo.filePath.startsWith('http')) {
        return annotationData.dataInfo.filePath;
      }
      // API URL과 결합하여 완전한 URL 생성
      const API_URL = process.env.REACT_APP_API_URL || 'http://166.104.246.64:8000';
      return `${API_URL}/${annotationData.dataInfo.filePath}`;
    }
    
    // 이미지 ID만 있는 경우 이미지 ID 기반 URL 구성
    const API_URL = process.env.REACT_APP_API_URL || 'http://166.104.246.64:8000';
    return `${API_URL}/images/${imageId}`;
  };

  return (
    <div className="annotator-annotation-edit-page">
      {/* 저장 중 오버레이 */}
      {isSaving && (
        <div className="annotator-loading-overlay">
          <div className="annotator-loading">
            <div className="loader"></div>
            <p>저장 중...</p>
          </div>
        </div>
      )}
      
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
              imageSrc={getImageUrl()}
              imageDimensions={annotationData.dataInfo.dimensions}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnotationEditPage; 