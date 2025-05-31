/**
 * 어노테이션 선택 관리 훅
 */
import { useState, useCallback, useEffect } from 'react';
import { TOOL_TYPES } from '../constants/annotationConstants';

/**
 * 어노테이션 선택 관리를 위한 커스텀 훅
 * @param {Array} defects - 결함 목록
 * @param {Array} defectClasses - 결함 클래스 목록 (옵션)
 * @returns {Object} 선택 관련 상태 및 함수들
 */
const useAnnotationSelection = (defects, defectClasses = []) => {
  // 선택된 결함 ID
  const [selectedDefect, setSelectedDefect] = useState(null);
  // 현재 선택된 도구 상태
  const [activeTool, setActiveTool] = useState(TOOL_TYPES.HAND);
  // 현재 선택된 결함 유형 (새 박스 생성에 사용) - 기본값은 나중에 설정
  const [currentDefectType, setCurrentDefectType] = useState('Scratch');
  // 선택된 결함의 상세 정보
  const [selectedDefectDetail, setSelectedDefectDetail] = useState(null);

  // defectClasses가 로드되면 가장 위에 있는 클래스를 기본값으로 설정
  useEffect(() => {
    if (defectClasses && defectClasses.length > 0) {
      // DB에서 가져온 첫 번째 클래스를 기본값으로 설정
      console.log('DB에서 첫 번째 클래스를 기본값으로 설정:', defectClasses[0].class_name);
      setCurrentDefectType(defectClasses[0].class_name);
    }
  }, [defectClasses]);

  /**
   * 도구 변경 핸들러
   * @param {string} toolType - 도구 유형
   */
  const handleToolChange = useCallback((toolType) => {
    setActiveTool(toolType);
  }, []);

  /**
   * 결함 선택 핸들러
   * @param {string} defectId - 결함 ID
   */
  const handleDefectSelect = useCallback((defectId) => {
    // 도구가 손 도구일 때만 결함 선택 허용
    if (activeTool === TOOL_TYPES.HAND) {
      console.log('Selecting defect:', defectId);
      setSelectedDefect(defectId);

      // 선택된 결함 유형 업데이트
      if (defectId) {
        const selectedDefectObj = defects.find(d => String(d.id) === String(defectId));
        if (selectedDefectObj) {
          console.log('Selected defect found:', selectedDefectObj);
          console.log('Updating current defect type to:', selectedDefectObj.type);
          setCurrentDefectType(selectedDefectObj.type);
        } else {
          console.log('Selected defect not found in defects array:', defectId);
        }
      } else {
        console.log('Defect selection cleared');
      }

      // 사이드바에서 선택된 항목으로 스크롤 (DOM 요소가 있다면)
      setTimeout(() => {
        const sidebarItem = document.querySelector(`[data-id="${defectId}"]`);
        if (sidebarItem) {
          sidebarItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 0);
    } else {
      console.log('Not selecting defect because activeTool is not HAND:', activeTool);
    }
  }, [activeTool, defects]);

  /**
   * 빈 영역 클릭 시 선택 해제
   * @param {Event} e - 이벤트 객체
   */
  const handleCanvasClick = useCallback((e) => {
    // 이벤트가 있으면, 이벤트 타겟이 바운딩 박스가 아닌지 확인
    if (e && e.target && e.target.closest('.annotator-bounding-box')) {
      // 바운딩 박스 내부 또는 테두리 클릭은 무시
      console.log('Click on bounding box, ignoring canvas click');
      return;
    }
    
    // 도구가 손 도구일 때만 결함 선택 해제
    if (activeTool === TOOL_TYPES.HAND) {
      console.log('Canvas clicked, clearing selection');
      // 모든 바운딩 박스 선택 해제
      setSelectedDefect(null);
    } else {
      console.log('Canvas clicked but not clearing selection, activeTool:', activeTool);
    }
  }, [activeTool]);

  /**
   * 클래스 선택 핸들러
   * @param {string} defectType - 결함 유형
   * @param {function} updateDefectClass - 결함 클래스 업데이트 함수
   */
  const handleClassSelect = useCallback((defectType, updateDefectClass) => {
    console.log('handleClassSelect called with defectType:', defectType);
    console.log('Current state:', { 
      activeTool, 
      selectedDefect, 
      currentDefectType 
    });
    
    if (!defectType) {
      console.error('handleClassSelect called with empty defectType');
      return;
    }
    
    // 현재 선택된 결함 유형 업데이트 (새 박스 생성 시 사용)
    setCurrentDefectType(defectType);
    console.log('Updated currentDefectType to:', defectType);
    
    // HAND 도구 & 선택된 defect가 있는 경우: 선택된 박스의 클래스 변경
    if (activeTool === TOOL_TYPES.HAND && selectedDefect) {
      console.log('HAND tool active with selected defect, updating class for defect ID:', selectedDefect);
      
      // 문자열 ID로 통일
      const defectIdStr = String(selectedDefect); 
      
      // 선택된 결함 객체 찾기
      const selectedDefectObj = defects.find(d => String(d.id) === defectIdStr);
      
      if (selectedDefectObj) {
        // 이미 같은 클래스인지 확인
        if (selectedDefectObj.type === defectType) {
          console.log('Defect already has this class:', defectType, '- No update needed');
          return;
        }
        
        // 이전 상태 저장
        const prevClass = selectedDefectObj.type;
        const prevTypeId = selectedDefectObj.typeId;
        
        console.log('Changing defect class:', {
          defectId: defectIdStr,
          from: prevClass,
          to: defectType,
          prevTypeId
        });
        
        // 클래스 업데이트 호출
        updateDefectClass(defectIdStr, defectType);
      } else {
        console.warn('Selected defect object not found in defects array:', defectIdStr);
        console.log('Available defect IDs:', defects.map(d => d.id));
        console.log('Attempting to update class anyway for defect ID:', defectIdStr);
        updateDefectClass(defectIdStr, defectType);
      }
    } 
    // 선택된 바운딩 박스가 없는 경우, 사각형 도구로 자동 전환
    else if (!selectedDefect) {
      console.log('No selected defect, switching to RECTANGLE tool for next box creation with class:', defectType);
      setActiveTool(TOOL_TYPES.RECTANGLE);
    }
    // RECTANGLE 도구 모드: 다음에 생성될 박스의 클래스만 변경
    else if (activeTool === TOOL_TYPES.RECTANGLE) {
      console.log('RECTANGLE tool active - class', defectType, 'will be used for next box creation');
      // 별도 처리 필요 없음 - currentDefectType 설정으로 충분
    }
    // 기타 상황
    else {
      console.log('Unhandled case in handleClassSelect:', { activeTool, selectedDefect, defectType });
    }
  }, [activeTool, selectedDefect, defects, currentDefectType]);

  // 선택된 결함이 변경될 때 상세 정보 업데이트
  useEffect(() => {
    if (selectedDefect) {
      const detail = defects.find(d => d.id === selectedDefect);
      setSelectedDefectDetail(detail);
    } else {
      setSelectedDefectDetail(null);
    }
  }, [selectedDefect, defects]);

  return {
    selectedDefect,
    setSelectedDefect,
    activeTool,
    setActiveTool,
    currentDefectType,
    setCurrentDefectType,
    selectedDefectDetail,
    handleToolChange,
    handleDefectSelect,
    handleCanvasClick,
    handleClassSelect
  };
};

export default useAnnotationSelection; 