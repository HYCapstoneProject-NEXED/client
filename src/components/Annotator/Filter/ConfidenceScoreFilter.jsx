import React, { useState, useRef } from 'react';
import './FilterPopup.css';

/**
 * Confidence Score 필터 팝업 컴포넌트
 * @param {Object} props
 * @param {Object} props.range - 신뢰도 점수 범위 {min, max}
 * @param {Function} props.onApply - 적용 버튼 클릭 시 호출될 함수
 * @param {Function} props.onClose - 팝업 외부 클릭 시 호출될 함수
 */
const ConfidenceScoreFilter = ({ 
  range = { min: '', max: '' }, 
  onApply, 
  onClose
}) => {
  // 소수점 값을 퍼센트로 변환하여 초기값 설정
  const [minValue, setMinValue] = useState(range.min !== '' ? Math.round(range.min * 100) : '');
  const [maxValue, setMaxValue] = useState(range.max !== '' ? Math.round(range.max * 100) : '');
  const popupRef = useRef(null);

  // 이벤트 전파 방지
  const handlePopupClick = (e) => {
    e.stopPropagation();
  };

  // 최소값 변경
  const handleMinChange = (e) => {
    e.stopPropagation();
    const value = e.target.value;
    const numValue = parseInt(value, 10);
    
    if (value === '' || (!isNaN(numValue) && numValue >= 0 && numValue <= 100)) {
      setMinValue(value);
    }
  };

  // 최대값 변경
  const handleMaxChange = (e) => {
    e.stopPropagation();
    const value = e.target.value;
    const numValue = parseInt(value, 10);
    
    if (value === '' || (!isNaN(numValue) && numValue >= 0 && numValue <= 100)) {
      setMaxValue(value);
    }
  };

  // 적용 버튼 클릭
  const handleApply = (e) => {
    e.stopPropagation();
    
    // 퍼센트 값을 소수점 값으로 변환하여 전달
    onApply && onApply({
      min: minValue === '' ? '' : parseFloat(minValue) / 100,
      max: maxValue === '' ? '' : parseFloat(maxValue) / 100
    });
    
    onClose && onClose();
  };

  return (
    <div className="filter-popup" ref={popupRef} onClick={handlePopupClick}>
      <div className="filter-popup-title">Confidence Score (%)</div>
      
      <div className="range-filter-container">
        <input
          type="number"
          min="0"
          max="100"
          step="1"
          value={minValue}
          onChange={handleMinChange}
          className="range-input"
          placeholder="Min %"
        />
        <span className="range-separator">~</span>
        <input
          type="number"
          min="0"
          max="100"
          step="1"
          value={maxValue}
          onChange={handleMaxChange}
          className="range-input"
          placeholder="Max %"
        />
      </div>
      
      <div className="filter-popup-divider"></div>
      
      <div className="filter-popup-note">*Enter values between 0% and 100%</div>
      
      <div className="filter-actions">
        <button className="filter-cancel-btn" onClick={onClose}>
          Cancel
        </button>
        <button className="filter-apply-btn" onClick={handleApply}>
          Apply
        </button>
      </div>
    </div>
  );
};

export default ConfidenceScoreFilter; 