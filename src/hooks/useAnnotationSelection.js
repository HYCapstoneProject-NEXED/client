/**
 * 어노테이션 선택 관리 훅
 */
import { useState, useCallback, useEffect } from 'react';
import { TOOL_TYPES } from '../constants/annotationConstants';

/**
 * 어노테이션 선택 관리를 위한 커스텀 훅
 * @param {Array} defects - 결함 목록
 * @returns {Object} 선택 관련 상태 및 함수들
 */
const useAnnotationSelection = (defects) => {
  // 선택된 결함 ID
  const [selectedDefect, setSelectedDefect] = useState(null);
  // 현재 선택된 도구 상태
  const [activeTool, setActiveTool] = useState(TOOL_TYPES.HAND);
  // 현재 선택된 결함 유형 (새 박스 생성에 사용)
  const [currentDefectType, setCurrentDefectType] = useState('Defect_A');
  // 선택된 결함의 상세 정보
  const [selectedDefectDetail, setSelectedDefectDetail] = useState(null);

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
      setSelectedDefect(defectId);

      // 선택된 결함 유형 업데이트
      const selectedDefectObj = defects.find(d => String(d.id) === defectId);
      if (selectedDefectObj) {
        setCurrentDefectType(selectedDefectObj.type);
      }

      // 사이드바에서 선택된 항목으로 스크롤 (DOM 요소가 있다면)
      setTimeout(() => {
        const sidebarItem = document.querySelector(`[data-id="${defectId}"]`);
        if (sidebarItem) {
          sidebarItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 0);
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
      return;
    }
    
    // 도구가 손 도구일 때만 결함 선택 해제
    if (activeTool === TOOL_TYPES.HAND) {
      // 모든 바운딩 박스 선택 해제
      setSelectedDefect(null);
    }
  }, [activeTool]);

  /**
   * 클래스 선택 핸들러
   * @param {string} defectType - 결함 유형
   * @param {function} updateDefectClass - 결함 클래스 업데이트 함수
   */
  const handleClassSelect = useCallback((defectType, updateDefectClass) => {
    // 현재 선택된 결함 유형 업데이트 (새 박스 생성 시 사용)
    setCurrentDefectType(defectType);
    
    // 손 도구 모드에서는 선택된 박스의 클래스 변경
    if (activeTool === TOOL_TYPES.HAND && selectedDefect) {
      updateDefectClass(selectedDefect, defectType);
    } 
    // 선택된 바운딩 박스가 없는 경우, 사각형 도구로 자동 전환
    else if (!selectedDefect) {
      setActiveTool(TOOL_TYPES.RECTANGLE);
    }
    // 사각형 도구 모드에서는 다음에 생성될 박스의 클래스만 변경 (별도 처리 필요 없음)
  }, [activeTool, selectedDefect]);

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