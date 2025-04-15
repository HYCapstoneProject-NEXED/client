import React, { useState, useEffect } from 'react';
import Header from '../../components/Annotator/Header';
import Sidebar from '../../components/Annotator/Sidebar';
import ImageCanvas from '../../components/Annotator/ImageCanvas';
import AnnotationTools from '../../components/Annotator/AnnotationTools';
import './AnnotationEditPage.css';

// 도구 유형 상수 정의 (AnnotationTools.jsx와 동일하게 유지)
const TOOL_TYPES = {
  HAND: 'hand',
  RECTANGLE: 'rectangle'
};

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
  // 선택된 결함 ID - 기본값은 null로 설정 (선택 없음)
  const [selectedDefect, setSelectedDefect] = useState(null);
  // 현재 선택된 도구 상태
  const [activeTool, setActiveTool] = useState(TOOL_TYPES.HAND);
  // 현재 선택된 결함 유형 (새 박스 생성에 사용)
  const [currentDefectType, setCurrentDefectType] = useState('Defect_A');
  const [dataInfo, setDataInfo] = useState({
    dataId: 'IMG_03',
    confidenceScore: 0,
    state: 'Pending Task'
  });

  // 기본 선택 관련 effect 제거 (더 이상 첫 번째 결함이 자동 선택되지 않음)
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

  // 도구 변경 핸들러
  const handleToolChange = (toolType) => {
    setActiveTool(toolType);
  };

  // 결함 선택 핸들러
  const handleDefectSelect = (defectId) => {
    // 도구가 손 도구일 때만 결함 선택 허용
    if (activeTool === TOOL_TYPES.HAND) {
      setSelectedDefect(defectId);

      // 선택된 결함 유형 업데이트
      const selectedDefectObj = defects.find(d => String(d.id) === defectId);
      if (selectedDefectObj) {
        setCurrentDefectType(selectedDefectObj.type);
      }

      // 사이드바에서 선택된 항목으로 스크롤
      const sidebarItem = document.querySelector(`[data-id="${defectId}"]`);
      if (sidebarItem) {
        sidebarItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  };

  // 빈 영역 클릭 시 선택 해제
  const handleCanvasClick = (e) => {
    // 이벤트가 있으면, 이벤트 타겟이 바운딩 박스가 아닌지 확인
    if (e && e.target && e.target.closest('.annotator-bounding-box')) {
      // 바운딩 박스 내부 또는 테두리 클릭은 무시
      return;
    }
    
    // 도구가 손 도구일 때만 결함 선택 해제
    if (activeTool === TOOL_TYPES.HAND) {
      // 모든 바운딩 박스 선택 해제
      setSelectedDefect(null);
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

  // 새 바운딩 박스 추가 핸들러
  const handleAddBox = (coordinates) => {
    // 현재 선택된 결함 유형 사용
    let defectType = currentDefectType;
    
    // 새 ID 생성 (현재 최대 ID + 1)
    const maxId = Math.max(...defects.map(d => parseInt(d.id)), 0);
    const newId = String(maxId + 1);
    
    // 새 defect 객체 생성
    const newDefect = {
      id: newId,
      type: defectType,
      confidence: 0.9, // 기본 신뢰도
      coordinates: coordinates
    };
    
    console.log('Creating new box with type:', defectType);
    
    // defects 배열에 추가
    setDefects(prev => [...prev, newDefect]);
    
    // 새 박스 선택
    setSelectedDefect(newId);
  };

  // 결함 저장 핸들러
  const handleSaveAnnotations = () => {
    console.log('Saving annotations:', defects);
    // 실제 구현에서는 API 호출로 서버에 저장
    alert('Annotations saved successfully!');
  };

  // 클래스 선택 핸들러
  const handleClassSelect = (defectType) => {
    console.log('Class selected:', defectType);
    
    // 현재 선택된 결함 유형 업데이트 (새 박스 생성 시 사용)
    setCurrentDefectType(defectType);
    
    // 손 도구 모드에서는 선택된 박스의 클래스 변경
    if (activeTool === TOOL_TYPES.HAND && selectedDefect) {
      setDefects(currentDefects => 
        currentDefects.map(defect => 
          String(defect.id) === selectedDefect 
            ? { ...defect, type: defectType }
            : defect
        )
      );
    }
    // 사각형 도구 모드에서는 다음에 생성될 박스의 클래스만 변경 (별도 처리 필요 없음)
  };

  return (
    <div className="annotator-annotation-edit-page">
      <Header onSave={handleSaveAnnotations} />
      <div className="annotator-body-container">
        <div className="annotator-sidebar-wrapper">
          <Sidebar 
            dataInfo={dataInfo} 
            defects={defects} 
            selectedDefect={selectedDefect}
            onDefectSelect={handleDefectSelect}
            onToolChange={handleToolChange}
            toolTypes={TOOL_TYPES}
          />
        </div>
        <div className="annotator-main-wrapper">
          <div className="annotator-tools-container">
            <AnnotationTools 
              onClassSelect={handleClassSelect}
              selectedDefectType={activeTool === TOOL_TYPES.RECTANGLE ? currentDefectType : defects.find(d => String(d.id) === selectedDefect)?.type}
              onToolChange={handleToolChange}
              activeTool={activeTool}
            />
          </div>
          <main className="annotator-edit-area">
            <ImageCanvas 
              defects={defects}
              selectedDefect={selectedDefect}
              onDefectSelect={handleDefectSelect}
              onCoordinateUpdate={handleCoordinateUpdate}
              onCanvasClick={handleCanvasClick}
              onAddBox={handleAddBox}
              activeTool={activeTool}
              toolTypes={TOOL_TYPES}
              onToolChange={handleToolChange}
              currentDefectType={currentDefectType}
            />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AnnotationEditPage; 