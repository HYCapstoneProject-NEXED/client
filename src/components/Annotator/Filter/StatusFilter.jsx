import React, { useState, useRef } from 'react';
import './FilterPopup.css';

/**
 * Status 필터 팝업 컴포넌트
 * @param {Object} props
 * @param {Array} props.options - 선택 가능한 상태 목록
 * @param {Array} props.selectedOptions - 현재 선택된 상태 목록
 * @param {Function} props.onApply - 적용 버튼 클릭 시 호출될 함수
 * @param {Function} props.onClose - 팝업 외부 클릭 시 호출될 함수
 */
const StatusFilter = ({ 
  options = ['pending', 'completed'], 
  selectedOptions = [], 
  onApply, 
  onClose
}) => {
  const [selected, setSelected] = useState([...selectedOptions]);
  const popupRef = useRef(null);

  // 이벤트 전파 방지
  const handlePopupClick = (e) => {
    e.stopPropagation();
  };

  // 옵션 토글
  const toggleOption = (option, e) => {
    e.stopPropagation();
    if (selected.includes(option)) {
      setSelected(selected.filter(item => item !== option));
    } else {
      setSelected([...selected, option]);
    }
  };

  // 적용 버튼 클릭
  const handleApply = (e) => {
    e.stopPropagation();
    onApply && onApply(selected);
    onClose && onClose();
  };

  return (
    <div className="filter-popup" ref={popupRef} onClick={handlePopupClick}>
      <div className="filter-popup-title">Status</div>
      
      <div className="filter-options">
        {options.map(option => (
          <div
            key={option}
            className={`filter-option ${selected.includes(option) ? 'active' : ''}`}
            onClick={(e) => toggleOption(option, e)}
          >
            {option}
          </div>
        ))}
      </div>
      
      <div className="filter-popup-divider"></div>
      
      <div className="filter-popup-note">*You can select multiple status</div>
      
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

export default StatusFilter; 