import React, { useState, useEffect } from 'react';
import Header from '../../components/Annotator/Header';
import Sidebar from '../../components/Annotator/Sidebar';
import ImageCanvas from '../../components/Annotator/ImageCanvas';
import AnnotationTools from '../../components/Annotator/AnnotationTools';
import './AnnotationEditPage.css';

// 샘플 데이터 - 실제 구현에서는 API 호출로 가져올 것
const sampleDefects = [
  { 
    id: '1', 
    type: 'Defect_A', 
    confidence: 0.96,
    coordinates: { x: 523.86, y: 328.36, width: 193.79, height: 212.49 }
  },
  { 
    id: '2', 
    type: 'Defect_A', 
    confidence: 0.88,
    coordinates: { x: 867.10, y: 472.65, width: 160.86, height: 207.25 }
  },
  { 
    id: '3', 
    type: 'Defect_B', 
    confidence: 0.96,
    coordinates: { x: 606.18, y: 626.12, width: 165.92, height: 106.25 }
  },
  { 
    id: '4', 
    type: 'Defect_B', 
    confidence: 0.97,
    coordinates: { x: 806.30, y: 275.90, width: 73.46, height: 127.23 }
  }
];

const AnnotationEditPage = () => {
  // 결함 데이터 상태 관리
  const [defects, setDefects] = useState(sampleDefects);
  // 선택된 결함 ID
  const [selectedDefect, setSelectedDefect] = useState(null);
  const [dataInfo, setDataInfo] = useState({
    dataId: 'IMG_03',
    confidenceScore: 0,
    state: 'Pending Task'
  });

  // 컴포넌트 마운트 시 첫 번째 결함 선택
  useEffect(() => {
    if (defects.length > 0 && !selectedDefect) {
      setSelectedDefect(defects[0].id);
    }
  }, [defects, selectedDefect]);

  // defects의 confidence 값 중 최소값을 계산하여 dataInfo 업데이트
  useEffect(() => {
    if (defects.length > 0) {
      // 모든 defect의 confidence 값 추출
      const confidenceValues = defects.map(defect => defect.confidence);
      // 최소값 찾기
      const minConfidence = Math.min(...confidenceValues);
      
      setDataInfo(prev => ({
        ...prev,
        confidenceScore: minConfidence
      }));
    }
  }, [defects]);

  // 결함 선택 핸들러
  const handleDefectSelect = (defectId) => {
    setSelectedDefect(defectId);

    // 사이드바에서 선택된 항목으로 스크롤
    const sidebarItem = document.querySelector(`[data-id="${defectId}"]`);
    if (sidebarItem) {
      sidebarItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  // 좌표 업데이트 핸들러
  const handleCoordinateUpdate = (defectId, newCoordinates) => {
    // 문자열 ID를 동일한 형식으로 처리
    const defectIdStr = String(defectId);
    
    setDefects(currentDefects => 
      currentDefects.map(defect => 
        String(defect.id) === defectIdStr 
          ? {
              ...defect,
              coordinates: {
                ...defect.coordinates,
                ...newCoordinates // 전달된 모든 좌표 정보 업데이트 (x, y, width, height)
              }
            }
          : defect
      )
    );
  };

  // 결함 저장 핸들러
  const handleSaveAnnotations = () => {
    console.log('Saving annotations:', defects);
    // 실제 구현에서는 API 호출로 서버에 저장
    alert('Annotations saved successfully!');
  };

  // 클래스 선택 핸들러
  const handleClassSelect = (defectType) => {
    if (selectedDefect) {
      setDefects(currentDefects => 
        currentDefects.map(defect => 
          String(defect.id) === selectedDefect 
            ? { ...defect, type: defectType }
            : defect
        )
      );
    }
  };

  return (
    <div className="annotation-edit-page">
      <Header onSave={handleSaveAnnotations} />
      <div className="body-container">
        <div className="sidebar-wrapper">
          <Sidebar 
            dataInfo={dataInfo} 
            defects={defects} 
            selectedDefect={selectedDefect}
            onDefectSelect={handleDefectSelect}
          />
        </div>
        <div className="main-wrapper">
          <div className="annotation-tools-container">
            <AnnotationTools 
              onClassSelect={handleClassSelect}
              selectedDefectType={defects.find(d => String(d.id) === selectedDefect)?.type}
            />
          </div>
          <main className="edit-area">
            <ImageCanvas 
              defects={defects}
              selectedDefect={selectedDefect}
              onDefectSelect={handleDefectSelect}
              onCoordinateUpdate={handleCoordinateUpdate}
            />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AnnotationEditPage; 