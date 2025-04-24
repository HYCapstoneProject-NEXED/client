/**
 * Annotation Detail Page
 * 어노테이션 상세 조회 페이지 - 편집 불가능, 확인만 가능
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ImageCanvas from '../../components/Annotator/ImageCanvas';
import Sidebar from '../../components/Annotator/Sidebar';
import { TOOL_TYPES } from '../../constants/annotationConstants';
import useAnnotationData from '../../hooks/useAnnotationData';
import useAnnotationSelection from '../../hooks/useAnnotationSelection';
import './AnnotationDetailPage.css';

/**
 * 어노테이션 상세 페이지 컴포넌트
 * 어노테이션 데이터 조회만 가능 (편집 불가)
 */
const AnnotationDetailPage = () => {
  const navigate = useNavigate();
  const { imageId: imageIdParam } = useParams();
  
  // URL에서 이미지 ID를 가져오거나 기본값 사용 (문자열을 숫자로 변환)
  const [imageId] = useState(parseInt(imageIdParam) || 101);
  
  // 사이드바 접힘/펼침 상태
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // 어노테이션 데이터 로드 (편집 기능 비활성화)
  const annotationData = useAnnotationData(imageId, () => {});
  
  // 어노테이션 선택 관리
  const selection = useAnnotationSelection(annotationData.defects);
  
  // 사이드바 토글 핸들러
  const handleSidebarToggle = (collapsed) => {
    setIsSidebarCollapsed(collapsed);
  };
  
  // 편집 페이지로 이동하는 함수
  const startAnnotating = () => {
    navigate(`/annotator/edit/${imageId}`);
  };
  
  // 데이터 삭제 함수
  const handleDelete = () => {
    // 실제 구현에서는 서버에 삭제 요청을 보내야 함
    if (window.confirm('정말로 이 어노테이션을 삭제하시겠습니까?')) {
      console.log('Deleting annotation with ID:', imageId);
      // 삭제 후 목록 페이지로 이동
      navigate('/annotator/list');
    }
  };
  
  // 로딩 중일 때 표시할 내용
  if (annotationData.isLoading) {
    return (
      <div className="annotator-annotation-edit-page">
        <div className="annotator-detail-header">
          <h1>Annotation Details</h1>
          
          <div className="header-actions">
            <div className="pagination">
              <div className="pagination-arrows">
                <button className="prev-arrow" disabled>◀</button>
                <span>1 / 1</span>
                <button className="next-arrow" disabled>▶</button>
              </div>
            </div>
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
          <div className="pagination">
            <div className="pagination-arrows">
              <button className="prev-arrow" disabled>◀</button>
              <span>1 / 1</span>
              <button className="next-arrow" disabled>▶</button>
            </div>
          </div>
          
          <button 
            className="start-annotating-btn"
            onClick={startAnnotating}
          >
            Start Annotating
          </button>
          
          <button 
            className="delete-btn"
            onClick={handleDelete}
          >
            Delete
          </button>
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
            readOnly={true}
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