/**
 * 어노테이션 편집 페이지
 * 이미지 로딩, 바운딩 박스 편집, 히스토리 관리 등 어노테이션의 핵심 기능을 포함
 */
import React, { useState } from 'react';
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
  // 이미지 ID (URL 쿼리 파라미터 또는 기본값)
  const [imageId] = useState(101); // 실제 구현에서는 URL 파라미터 등에서 가져옴
  
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
   */
  const handleAddBox = (coordinates) => {
    const newId = annotationData.addBox(coordinates, selection.currentDefectType);
    selection.setSelectedDefect(newId);
  };

  // 로딩 중일 때 표시할 내용
  if (annotationData.isLoading) {
    return (
      <div className="annotator-annotation-edit-page">
        <Header onSave={annotationData.saveAnnotations} />
        <div className="annotator-loading">
          <div className="loader"></div>
          <p>어노테이션 데이터 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="annotator-annotation-edit-page">
      <Header onSave={annotationData.saveAnnotations} />
      <div className="annotator-body-container">
        <div className="annotator-sidebar-wrapper">
          <Sidebar
            dataInfo={annotationData.dataInfo}
            defects={annotationData.defects}
            selectedDefect={selection.selectedDefect}
            selectedDefectDetail={selection.selectedDefectDetail}
            onDefectSelect={selection.handleDefectSelect}
            onToolChange={selection.handleToolChange}
            toolTypes={TOOL_TYPES}
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
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnotationEditPage; 