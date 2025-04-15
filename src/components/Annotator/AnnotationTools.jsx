import React, { useState, useEffect, useRef } from 'react';
import { FaUndo, FaRedo, FaRegHandPaper, FaChevronDown } from 'react-icons/fa';
import { FiSquare } from 'react-icons/fi';
import './AnnotationTools.css';

// 도구 유형 상수 정의
const TOOL_TYPES = {
  HAND: 'hand',
  RECTANGLE: 'rectangle'
};

const AnnotationTools = ({ onClassSelect, selectedDefectType, onToolChange, activeTool: externalActiveTool }) => {
  const [showClassOptions, setShowClassOptions] = useState(false);
  // 활성화된 도구 상태 추가 (기본값: 손바닥)
  const [activeTool, setActiveTool] = useState(TOOL_TYPES.HAND);
  const classOptionsRef = useRef(null);
  const colorButtonRef = useRef(null);

  const handleClassSelect = (className) => {
    onClassSelect(className);
    setShowClassOptions(false);
  };

  const handleColorButtonClick = (e) => {
    e.stopPropagation(); // 이벤트 버블링 방지
    setShowClassOptions(!showClassOptions);
  };

  // 선택된 타입에 따른 색상 스타일 가져오기
  const getColorStyle = (defectType) => {
    switch(defectType) {
      case 'Defect_A':
        return '#00B69B';
      case 'Defect_B':
        return '#5A8CFF';
      case 'Defect_C':
        return '#EF3826';
      case 'Defect_D':
        return '#FCAA0B';
      default:
        return '#00B69B'; // 기본 색상도 Defect_A 색상으로 통일
    }
  };

  // 도구 변경 핸들러
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

  // 컴포넌트 마운트 시 부모 컴포넌트에 초기 도구 알림
  useEffect(() => {
    if (onToolChange) {
      onToolChange(activeTool);
    }
  }, []);

  return (
    <div className="annotator-annotation-tools">
      <div className="annotator-toolbar">
        <div className="annotator-color-selector" ref={colorButtonRef} onClick={handleColorButtonClick}>
          <div 
            className="annotator-color-circle" 
            style={{ background: getColorStyle(selectedDefectType) }}
          ></div>
          <FaChevronDown className="annotator-dropdown-icon" />
        </div>
        <div className="annotator-divider"></div>
        
        <button 
          className={`annotator-tool-button annotator-square-button ${activeTool === TOOL_TYPES.RECTANGLE ? 'active' : ''}`}
          onClick={() => handleToolChange(TOOL_TYPES.RECTANGLE)}
          title="사각형 그리기"
        >
          <FiSquare className="annotator-square-icon" />
        </button>
        <div className="annotator-divider"></div>
        
        <button 
          className={`annotator-tool-button annotator-hand-button ${activeTool === TOOL_TYPES.HAND ? 'active' : ''}`}
          onClick={() => handleToolChange(TOOL_TYPES.HAND)}
          title="이동 및 선택"
        >
          <FaRegHandPaper className="annotator-hand-icon" />
        </button>
        <div className="annotator-divider"></div>
        
        <button className="annotator-tool-button" title="실행 취소">
          <FaUndo />
        </button>
        <div className="annotator-divider"></div>
        
        <button className="annotator-tool-button" title="다시 실행">
          <FaRedo />
        </button>
      </div>
      
      {showClassOptions && (
        <div className="annotator-class-options-panel" ref={classOptionsRef}>
          <div className="annotator-panel-header">
            <span>Class</span>
          </div>
          <div className="annotator-class-list">
            <div className="annotator-class-option" onClick={() => handleClassSelect('Defect_A')}>
              <div className="annotator-class-color annotator-defect-a-color"></div>
              <span>Defect_A</span>
            </div>
            <div className="annotator-class-option" onClick={() => handleClassSelect('Defect_B')}>
              <div className="annotator-class-color annotator-defect-b-color"></div>
              <span>Defect_B</span>
            </div>
            <div className="annotator-class-option" onClick={() => handleClassSelect('Defect_C')}>
              <div className="annotator-class-color annotator-defect-c-color"></div>
              <span>Defect_C</span>
            </div>
            <div className="annotator-class-option" onClick={() => handleClassSelect('Defect_D')}>
              <div className="annotator-class-color annotator-defect-d-color"></div>
              <span>Defect_D</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnotationTools; 