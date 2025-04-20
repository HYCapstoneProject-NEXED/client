/**
 * 결함 클래스 선택기 컴포넌트
 */
import React from 'react';
import { DEFECT_TYPES } from '../../constants/annotationConstants';
import './ClassSelector.css';

/**
 * 결함 유형 선택 컴포넌트
 * @param {Object} props - 컴포넌트 속성
 * @param {function} props.onClassSelect - 클래스 선택 핸들러
 */
const ClassSelector = ({ onClassSelect }) => {
  return (
    <div className="annotator-class-selection">
      <h3>Class</h3>
      <div className="annotator-class-options">
        <div className="annotator-class-option" onClick={() => onClassSelect(DEFECT_TYPES.DEFECT_A)}>
          <div className="annotator-class-color annotator-defect-a-color"></div>
          <span>{DEFECT_TYPES.DEFECT_A}</span>
        </div>
        <div className="annotator-class-option" onClick={() => onClassSelect(DEFECT_TYPES.DEFECT_B)}>
          <div className="annotator-class-color annotator-defect-b-color"></div>
          <span>{DEFECT_TYPES.DEFECT_B}</span>
        </div>
        <div className="annotator-class-option" onClick={() => onClassSelect(DEFECT_TYPES.DEFECT_C)}>
          <div className="annotator-class-color annotator-defect-c-color"></div>
          <span>{DEFECT_TYPES.DEFECT_C}</span>
        </div>
        <div className="annotator-class-option" onClick={() => onClassSelect(DEFECT_TYPES.DEFECT_D)}>
          <div className="annotator-class-color annotator-defect-d-color"></div>
          <span>{DEFECT_TYPES.DEFECT_D}</span>
        </div>
      </div>
    </div>
  );
};

export default ClassSelector; 