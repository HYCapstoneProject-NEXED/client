import React, { useState, useEffect, useRef } from 'react';
import { FaUndo, FaRedo, FaRegHandPaper, FaChevronDown } from 'react-icons/fa';
import { FiSquare } from 'react-icons/fi';
import './AnnotationTools.css';

const AnnotationTools = ({ onClassSelect, selectedDefectType }) => {
  const [showClassOptions, setShowClassOptions] = useState(false);
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
        
        <button className="annotator-tool-button annotator-square-button">
          <FiSquare className="annotator-square-icon" />
        </button>
        <div className="annotator-divider"></div>
        
        <button className="annotator-tool-button annotator-hand-button">
          <FaRegHandPaper className="annotator-hand-icon" />
        </button>
        <div className="annotator-divider"></div>
        
        <button className="annotator-tool-button">
          <FaUndo />
        </button>
        <div className="annotator-divider"></div>
        
        <button className="annotator-tool-button">
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