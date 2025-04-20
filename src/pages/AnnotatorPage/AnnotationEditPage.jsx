import React, { useState, useEffect } from 'react';
import Header from '../../components/Annotator/Header';
import Sidebar from '../../components/Annotator/Sidebar';
import ImageCanvas from '../../components/Annotator/ImageCanvas';
import AnnotationTools from '../../components/Annotator/AnnotationTools';
import AnnotationService from '../../services/AnnotationService';
import './AnnotationEditPage.css';

// 도구 유형 상수 정의 (AnnotationTools.jsx와 동일하게 유지)
const TOOL_TYPES = {
  HAND: 'hand',
  RECTANGLE: 'rectangle'
};

// 작업 유형 상수 정의
const ACTION_TYPES = {
  ADD_BOX: 'add_box',
  MOVE_BOX: 'move_box',
  RESIZE_BOX: 'resize_box',
  CHANGE_CLASS: 'change_class',
  DELETE_BOX: 'delete_box',
};

const AnnotationEditPage = () => {
  // 결함 데이터 상태 관리
  const [defects, setDefects] = useState([]);
  // 로딩 상태
  const [isLoading, setIsLoading] = useState(true);
  // 선택된 결함 ID - 기본값은 null로 설정 (선택 없음)
  const [selectedDefect, setSelectedDefect] = useState(null);
  // 현재 선택된 도구 상태
  const [activeTool, setActiveTool] = useState(TOOL_TYPES.HAND);
  // 현재 선택된 결함 유형 (새 박스 생성에 사용)
  const [currentDefectType, setCurrentDefectType] = useState('Defect_A');
  const [dataInfo, setDataInfo] = useState({
    dataId: '',
    fileName: '',
    confidenceScore: 0,
    state: 'pending',
    captureDate: '',
    lastModified: '',
    dimensions: {
      width: 0,
      height: 0
    }
  });

  // 실행 취소/다시 실행을 위한 히스토리 상태
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isUndoRedoAction, setIsUndoRedoAction] = useState(false);
  
  // 이미지 ID (URL 쿼리 파라미터 또는 기본값)
  const [imageId, setImageId] = useState(101); // 기본값 설정

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    const loadAnnotationData = async () => {
      try {
        setIsLoading(true);
        
        // 이미지 관련 어노테이션 데이터 가져오기
        const annotations = await AnnotationService.getAnnotationsByImageId(imageId);
        
        // 백엔드 데이터를 프론트엔드 포맷으로 변환
        const transformedData = annotations.map(anno => 
          AnnotationService.transformToFrontendModel(anno)
        );
        
        setDefects(transformedData);
        
        // 이미지 상세 정보 가져오기
        const imageDetail = await AnnotationService.getImageDetailById(imageId);
        if (imageDetail) {
          setDataInfo(prev => ({
            ...prev,
            ...imageDetail,
            state: imageDetail.status // status를 state로 변환
          }));
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load annotation data:', error);
        setIsLoading(false);
      }
    };
    
    loadAnnotationData();
  }, [imageId]);

  // 작업 기록 추가 함수
  const addToHistory = (action) => {
    // 실행 취소/다시 실행 중인 경우에는 히스토리 추가하지 않음
    if (isUndoRedoAction) {
      setIsUndoRedoAction(false);
      return;
    }

    // 현재 인덱스 이후의 히스토리 자르기
    const newHistory = history.slice(0, historyIndex + 1);
    
    // 새 작업 추가
    newHistory.push(action);
    
    // 디버깅
    console.log('Adding to history:', action, 'New index:', newHistory.length - 1);
    
    // 히스토리 업데이트
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // 실행 취소 함수 (Undo)
  const handleUndo = () => {
    if (historyIndex < 0) {
      console.log('No more history to undo');
      return;
    }
    
    setIsUndoRedoAction(true);
    
    const action = history[historyIndex];
    console.log('Undoing action:', action, 'current index:', historyIndex);
    
    switch(action.type) {
      case ACTION_TYPES.ADD_BOX:
        // 추가한 박스 제거
        setDefects(prev => prev.filter(d => d.id !== action.data.defect.id));
        
        // 해당 박스가 선택되어 있었다면 선택 해제
        if (selectedDefect === action.data.defect.id) {
          setSelectedDefect(null);
        }
        break;
      
      case ACTION_TYPES.MOVE_BOX:
      case ACTION_TYPES.RESIZE_BOX:
        // 좌표 변경 취소 - 이전 좌표로 되돌림
        setDefects(prev => 
          prev.map(d => 
            d.id === action.data.defectId
              ? {
                  ...d, 
                  coordinates: { ...action.data.prevCoordinates }
                }
              : d
          )
        );
        break;
      
      case ACTION_TYPES.CHANGE_CLASS:
        // 클래스 변경 취소
        setDefects(prev => 
          prev.map(d => 
            d.id === action.data.defectId
              ? { ...d, type: action.data.prevType }
              : d
          )
        );
        break;
      
      case ACTION_TYPES.DELETE_BOX:
        // 삭제 취소 - 삭제한 박스 복원
        setDefects(prev => [...prev, action.data.defect]);
        break;
      
      default:
        break;
    }
    
    // 히스토리 인덱스 감소
    setHistoryIndex(prevIndex => prevIndex - 1);
    
    // 디버깅
    console.log('After undo, new index:', historyIndex - 1);
  };

  // 다시 실행 함수 (Redo)
  const handleRedo = () => {
    if (historyIndex >= history.length - 1) {
      console.log('No more actions to redo');
      return;
    }
    
    setIsUndoRedoAction(true);
    
    const action = history[historyIndex + 1];
    console.log('Redoing action:', action, 'current index:', historyIndex);
    
    switch(action.type) {
      case ACTION_TYPES.ADD_BOX:
        // 박스 다시 추가
        setDefects(prev => [...prev, action.data.defect]);
        setSelectedDefect(action.data.defect.id);
        break;
      
      case ACTION_TYPES.MOVE_BOX:
      case ACTION_TYPES.RESIZE_BOX:
        // 좌표 변경 재적용 - 모든 좌표 정보(x, y, width, height)를 완전히 적용
        setDefects(prev => 
          prev.map(d => 
            d.id === action.data.defectId
              ? {
                  ...d, 
                  coordinates: { ...action.data.newCoordinates }
                }
              : d
          )
        );
        break;
      
      case ACTION_TYPES.CHANGE_CLASS:
        // 클래스 변경 재적용
        setDefects(prev => 
          prev.map(d => 
            d.id === action.data.defectId
              ? { ...d, type: action.data.newType }
              : d
          )
        );
        break;
      
      case ACTION_TYPES.DELETE_BOX:
        // 박스 다시 제거
        setDefects(prev => prev.filter(d => d.id !== action.data.defect.id));
        
        // 해당 박스가 선택되어 있었다면 선택 해제
        if (selectedDefect === action.data.defect.id) {
          setSelectedDefect(null);
        }
        break;
      
      default:
        break;
    }
    
    // 히스토리 인덱스 증가
    setHistoryIndex(prevIndex => prevIndex + 1);
    
    // 디버깅
    console.log('After redo, new index:', historyIndex + 1);
  };

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
    
    // 이전 좌표 저장
    const defect = defects.find(d => String(d.id) === defectIdStr);
    if (!defect) return;
    
    const prevCoordinates = {...defect.coordinates};
    
    // newCoordinates에 포함되지 않은 값은 이전 값으로 채우기
    const fullNewCoordinates = {
      ...prevCoordinates,
      ...newCoordinates
    };
    
    // 이전 좌표와 새 좌표가 완전히 같으면 히스토리 추가하지 않음
    if (
      prevCoordinates.x === fullNewCoordinates.x &&
      prevCoordinates.y === fullNewCoordinates.y &&
      prevCoordinates.width === fullNewCoordinates.width &&
      prevCoordinates.height === fullNewCoordinates.height
    ) {
      return;
    }
    
    // defects 업데이트
    setDefects(currentDefects => 
      currentDefects.map(defect => 
        String(defect.id) === defectIdStr 
          ? {
              ...defect,
              coordinates: fullNewCoordinates
            }
          : defect
      )
    );
    
    // 크기 변경인지 이동인지 판단 (새 좌표에 width나 height가 포함되어 있으면 크기 변경)
    const actionType = newCoordinates.width !== undefined || newCoordinates.height !== undefined
      ? ACTION_TYPES.RESIZE_BOX
      : ACTION_TYPES.MOVE_BOX;
    
    // 히스토리에 작업 추가
    addToHistory({
      type: actionType,
      data: {
        defectId: defectIdStr,
        prevCoordinates,
        newCoordinates: fullNewCoordinates
      }
    });
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
      confidence: 0.9, // 사용자가 생성한 바운딩 박스의 confidence 값
      coordinates: coordinates,
      imageId: imageId,
      date: new Date().toISOString(),
      status: 'pending'
    };
    
    console.log('Creating new box with type:', defectType);
    
    // defects 배열에 추가
    setDefects(prev => [...prev, newDefect]);
    
    // 새 박스 선택
    setSelectedDefect(newId);
    
    // 히스토리에 작업 추가
    addToHistory({
      type: ACTION_TYPES.ADD_BOX,
      data: {
        defect: newDefect
      }
    });

    // 서버에 새 어노테이션 추가 요청
    const saveAnnotation = async () => {
      try {
        const backendModel = AnnotationService.transformToBackendModel(newDefect);
        await AnnotationService.createAnnotation(backendModel);
        console.log('New annotation saved to server');
      } catch (error) {
        console.error('Failed to save annotation to server:', error);
      }
    };
    
    saveAnnotation();
  };

  // 결함 저장 핸들러
  const handleSaveAnnotations = async () => {
    try {
      // console.log('Saving annotations:', defects);
      
      // 각 결함(defect)을 백엔드 모델로 변환하고 저장
      const updatePromises = defects.map(defect => {
        const backendModel = AnnotationService.transformToBackendModel(defect);
        // imageId 추가
        backendModel.image_id = imageId;
        
        // 이미 ID가 있으면 업데이트, 없으면 생성
        if (defect.id && !isNaN(parseInt(defect.id))) {
          return AnnotationService.updateAnnotation(parseInt(defect.id), backendModel);
        } else {
          return AnnotationService.createAnnotation(backendModel);
        }
      });
      
      // 모든 업데이트 완료 대기
      await Promise.all(updatePromises);
      
      // 마지막 수정 날짜 업데이트
      const now = new Date();
      const formattedDate = AnnotationService.formatDateTime(now.toISOString());
      
      setDataInfo(prev => ({
        ...prev,
        lastModified: formattedDate
      }));
      
      // 성공 알림
      alert('어노테이션이 성공적으로 저장되었습니다!');
    } catch (error) {
      console.error('Failed to save annotations:', error);
      alert('어노테이션 저장 중 오류가 발생했습니다.');
    }
  };

  // 결함 삭제 핸들러
  const handleDeleteDefect = async (defectId) => {
    if (!defectId) return;
    
    // 삭제할 defect 객체 찾기
    const defect = defects.find(d => d.id === defectId);
    if (!defect) return;
    
    try {
      // defects 업데이트
      setDefects(prev => prev.filter(d => d.id !== defectId));
      
      // 해당 defect가 선택되어 있었다면 선택 해제
      if (selectedDefect === defectId) {
        setSelectedDefect(null);
      }
      
      // 히스토리에 작업 추가
      addToHistory({
        type: ACTION_TYPES.DELETE_BOX,
        data: {
          defect
        }
      });
      
      // 서버에서 어노테이션 삭제
      await AnnotationService.deleteAnnotation(parseInt(defectId));
      console.log(`Annotation ${defectId} deleted from server`);
    } catch (error) {
      console.error(`Failed to delete annotation ${defectId}:`, error);
    }
  };

  // 클래스 선택 핸들러
  const handleClassSelect = (defectType) => {
    console.log('Class selected:', defectType);
    
    // 현재 선택된 결함 유형 업데이트 (새 박스 생성 시 사용)
    setCurrentDefectType(defectType);
    
    // 손 도구 모드에서는 선택된 박스의 클래스 변경
    if (activeTool === TOOL_TYPES.HAND && selectedDefect) {
      // 이전 타입 저장
      const defect = defects.find(d => String(d.id) === selectedDefect);
      const prevType = defect ? defect.type : null;
      
      setDefects(currentDefects => 
        currentDefects.map(defect => 
          String(defect.id) === selectedDefect 
            ? { ...defect, type: defectType }
            : defect
        )
      );
      
      // 히스토리에 작업 추가
      addToHistory({
        type: ACTION_TYPES.CHANGE_CLASS,
        data: {
          defectId: selectedDefect,
          prevType,
          newType: defectType
        }
      });
      
      // 서버에 클래스 변경 저장
      const updateDefectClass = async () => {
        try {
          const defect = defects.find(d => String(d.id) === selectedDefect);
          if (defect) {
            const updatedDefect = { ...defect, type: defectType };
            const backendModel = AnnotationService.transformToBackendModel(updatedDefect);
            await AnnotationService.updateAnnotation(parseInt(selectedDefect), backendModel);
            console.log(`Annotation ${selectedDefect} class updated on server`);
          }
        } catch (error) {
          console.error(`Failed to update annotation ${selectedDefect} class:`, error);
        }
      };
      
      updateDefectClass();
    } 
    // 선택된 바운딩 박스가 없는 경우, 사각형 도구로 자동 전환
    else if (!selectedDefect) {
      setActiveTool(TOOL_TYPES.RECTANGLE);
    }
    // 사각형 도구 모드에서는 다음에 생성될 박스의 클래스만 변경 (별도 처리 필요 없음)
  };

  // 히스토리 및 히스토리 인덱스 변경 감시
  useEffect(() => {
    console.log('History updated:', history);
    console.log('Current history index:', historyIndex);
    console.log('Can undo:', historyIndex >= 0);
    console.log('Can redo:', historyIndex < history.length - 1);
  }, [history, historyIndex]);

  // 로딩 중일 때 표시할 내용
  if (isLoading) {
    return (
      <div className="annotator-annotation-edit-page">
        <Header onSave={handleSaveAnnotations} />
        <div className="annotator-loading">
          <div className="loader"></div>
          <p>어노테이션 데이터 로딩 중...</p>
        </div>
      </div>
    );
  }

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
              activeTool={activeTool}
              onToolChange={handleToolChange}
              selectedDefectType={currentDefectType}
              onClassSelect={handleClassSelect}
              onUndo={handleUndo}
              onRedo={handleRedo}
              canUndo={historyIndex >= 0}
              canRedo={historyIndex < history.length - 1}
              onDelete={selectedDefect ? () => handleDeleteDefect(selectedDefect) : null}
            />
          </div>
          <div className="annotator-canvas-wrapper">
            <ImageCanvas
              defects={defects}
              selectedDefect={selectedDefect}
              onDefectSelect={handleDefectSelect}
              activeTool={activeTool}
              toolTypes={TOOL_TYPES}
              onCoordinateChange={handleCoordinateUpdate}
              onAddBox={handleAddBox}
              onCanvasClick={handleCanvasClick}
              onToolChange={handleToolChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnotationEditPage; 