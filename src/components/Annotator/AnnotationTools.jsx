/**
 * 어노테이션 도구 모음 컴포넌트
 * 결함 클래스 선택, 도구 변경, 실행 취소/다시 실행 등의 기능 제공
 */
import React, { useState, useEffect, useRef } from 'react';
import { FaUndo, FaRedo, FaRegHandPaper, FaChevronDown } from 'react-icons/fa';
import { FiSquare } from 'react-icons/fi';
import { TOOL_TYPES, DEFECT_TYPES } from '../../constants/annotationConstants';
import './AnnotationTools.css';

/**
 * 어노테이션 도구 모음 컴포넌트
 * @param {Object} props - 컴포넌트 속성
 * @param {function} props.onClassSelect - 클래스 선택 핸들러
 * @param {string} props.selectedDefectType - 현재 선택된 결함 유형
 * @param {function} props.onToolChange - 도구 변경 핸들러
 * @param {string} props.activeTool - 현재 활성화된 도구
 * @param {function} props.onUndo - 실행 취소 핸들러
 * @param {function} props.onRedo - 다시 실행 핸들러
 * @param {boolean} props.canUndo - 실행 취소 가능 여부
 * @param {boolean} props.canRedo - 다시 실행 가능 여부
 * @param {function} props.onDelete - 삭제 핸들러 (선택한 결함 삭제)
 * @param {Array} props.defectClasses - DB에서 가져온 결함 클래스 목록
 */
const AnnotationTools = ({ 
  onClassSelect, 
  selectedDefectType, 
  onToolChange, 
  activeTool: externalActiveTool,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  onDelete,
  defectClasses = []
}) => {
  // 클래스 선택 드롭다운 표시 여부
  const [showClassOptions, setShowClassOptions] = useState(false);
  
  // 활성화된 도구 상태 (기본값: 손바닥)
  const [activeTool, setActiveTool] = useState(TOOL_TYPES.HAND);
  
  // 드롭다운 외부 클릭 감지를 위한 ref
  const classOptionsRef = useRef(null);
  const colorButtonRef = useRef(null);

  /**
   * 결함 클래스 선택 핸들러
   * @param {string} className - 선택한 결함 클래스명
   */
  const handleClassSelect = (className) => {
    console.log('Class selected in AnnotationTools:', className);
    onClassSelect(className);
    setShowClassOptions(false);
  };

  /**
   * 색상 버튼 클릭 핸들러
   * 클래스 선택 드롭다운 토글
   */
  const handleColorButtonClick = (e) => {
    e.stopPropagation(); // 이벤트 버블링 방지
    setShowClassOptions(!showClassOptions);
  };

  /**
   * 선택된 결함 유형에 따른 색상 코드 반환
   * @param {string} defectType - 결함 유형
   * @returns {string} 색상 코드 (HEX)
   */
  const getColorStyle = (defectType) => {
    // DB에서 가져온 클래스 목록에서 현재 선택된 유형 찾기
    const selectedClass = defectClasses.find(dc => dc.class_name === defectType);
    
    // DB에서 찾은 색상이 있으면 사용
    if (selectedClass && selectedClass.class_color) {
      return selectedClass.class_color;
    }
    
    // 기본 색상 (fallback)
    switch(defectType) {
      case 'Scratch':
        return '#00B69B';
      case 'Dent':
        return '#5A8CFF';
      case 'Discoloration':
        return '#EF3826';
      case 'Contamination':
        return '#FCAA0B';
      default:
        return '#00B69B';
    }
  };

  /**
   * 도구 변경 핸들러
   * @param {string} toolType - 선택한 도구 유형
   */
  const handleToolChange = (toolType) => {
    setActiveTool(toolType);
    // 부모 컴포넌트에 도구 변경 알림
    if (onToolChange) {
      onToolChange(toolType);
    }
  };

  // 외부 클릭 감지하여 클래스 선택 패널 닫기
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        showClassOptions &&
        classOptionsRef.current && 
        !classOptionsRef.current.contains(event.target) &&
        colorButtonRef.current && 
        !colorButtonRef.current.contains(event.target)
      ) {
        setShowClassOptions(false);
      }
    }

    // 전체 문서에 클릭 이벤트 리스너 추가
    document.addEventListener('mousedown', handleClickOutside);
    
    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showClassOptions]);

  // 외부 활성 도구 변경 감지
  useEffect(() => {
    if (externalActiveTool && externalActiveTool !== activeTool) {
      setActiveTool(externalActiveTool);
    }
  }, [externalActiveTool]);

  // 컴포넌트 마운트 시, 부모 컴포넌트에 초기 도구 알림
  useEffect(() => {
    if (onToolChange) {
      onToolChange(activeTool);
    }
  }, []);

  // DB에서 가져온 클래스 목록이 비어있을 경우 기본 클래스 목록 사용
  const displayDefectClasses = defectClasses.length > 0 
    ? defectClasses 
    : [
        { class_id: 1, class_name: 'Scratch', class_color: '#00B69B' },
        { class_id: 2, class_name: 'Dent', class_color: '#5A8CFF' },
        { class_id: 3, class_name: 'Discoloration', class_color: '#EF3826' },
        { class_id: 4, class_name: 'Contamination', class_color: '#FCAA0B' }
      ];

  // 현재 선택된 클래스 정보 디버그 출력
  useEffect(() => {
    console.log('Current selected defect type in AnnotationTools:', selectedDefectType);
  }, [selectedDefectType]);

  return (
    <div className="annotator-annotation-tools">
      {/* 도구 모음 */}
      <div className="annotator-toolbar">
        {/* 결함 클래스 선택기 */}
        <div className="annotator-color-selector" ref={colorButtonRef} onClick={handleColorButtonClick}>
          <div 
            className="annotator-color-circle" 
            style={{ background: getColorStyle(selectedDefectType) }}
          ></div>
          <FaChevronDown className="annotator-dropdown-icon" />
        </div>
        <div className="annotator-divider"></div>
        
        {/* 사각형 도구 버튼 */}
        <button 
          className={`annotator-tool-button annotator-square-button ${activeTool === TOOL_TYPES.RECTANGLE ? 'active' : ''}`}
          onClick={() => handleToolChange(TOOL_TYPES.RECTANGLE)}
          title="Draw Rectangle"
        >
          <FiSquare className="annotator-square-icon" />
        </button>
        <div className="annotator-divider"></div>
        
        {/* 손 도구 버튼 */}
        <button 
          className={`annotator-tool-button annotator-hand-button ${activeTool === TOOL_TYPES.HAND ? 'active' : ''}`}
          onClick={() => handleToolChange(TOOL_TYPES.HAND)}
          title="Move and Select"
        >
          <FaRegHandPaper className="annotator-hand-icon" />
        </button>
        <div className="annotator-divider"></div>
        
        {/* 실행 취소 버튼 */}
        <button 
          className={`annotator-tool-button ${!canUndo ? 'disabled' : ''}`} 
          title="Undo"
          onClick={onUndo}
          disabled={!canUndo}
        >
          <FaUndo />
        </button>
        <div className="annotator-divider"></div>
        
        {/* 다시 실행 버튼 */}
        <button 
          className={`annotator-tool-button ${!canRedo ? 'disabled' : ''}`} 
          title="Redo"
          onClick={onRedo}
          disabled={!canRedo}
        >
          <FaRedo />
        </button>
        
        {/* 삭제 버튼 (항상 표시) */}
        <div className="annotator-divider"></div>
        <button 
          className={`annotator-tool-button annotator-delete-button ${!onDelete ? 'disabled' : ''}`} 
          onClick={onDelete}
          disabled={!onDelete}
          title="Delete Selected Defect"
        >
          Delete
        </button>
      </div>
      
      {/* 클래스 선택 드롭다운 패널 */}
      {showClassOptions && (
        <div className="annotator-class-options-panel" ref={classOptionsRef}>
          <div className="annotator-panel-header">
            <span>Defect Class</span>
          </div>
          <div className="annotator-class-list">
            {displayDefectClasses.map(defectClass => (
              <div 
                key={defectClass.class_id} 
                className={`annotator-class-option ${selectedDefectType === defectClass.class_name ? 'selected' : ''}`}
                onClick={() => handleClassSelect(defectClass.class_name)}
              >
                <div 
                  className="annotator-class-color" 
                  style={{ backgroundColor: defectClass.class_color }}
                ></div>
                <span>{defectClass.class_name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnotationTools; 