import React, { useState, useEffect, useRef } from 'react';
import { FaFilter, FaChevronDown } from 'react-icons/fa';
import DefectTypeFilter from './DefectTypeFilter';
import StatusFilter from './StatusFilter';
import ConfidenceScoreFilter from './ConfidenceScoreFilter';
import './FilterPopup.css';

/**
 * 필터 버튼 컴포넌트
 * @param {Object} props
 * @param {string} props.type - 필터 유형 ('defect', 'status', 'confidence')
 * @param {string} props.label - 버튼에 표시될 텍스트
 * @param {Array|Object} props.value - 현재 선택된 필터 값
 * @param {Function} props.onChange - 필터 변경 시 호출될 함수
 * @param {Array} props.options - 선택 가능한 옵션 목록 (defect, status 필터용)
 */
const FilterButton = ({ type, label, value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const popupRef = useRef(null);

  // 필터 팝업 토글
  const togglePopup = () => {
    setIsOpen(!isOpen);
  };

  // 필터 적용
  const applyFilter = (newValue) => {
    onChange && onChange(newValue);
    setIsOpen(false);
  };

  // 외부 클릭 감지 - 컨테이너 외부 클릭 시 팝업 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current && 
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    // 팝업이 열려있을 때만 이벤트 리스너 추가
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // 선택된 값 표시
  const getDisplayValue = () => {
    if (type === 'defect' || type === 'status') {
      if (Array.isArray(value) && value.length > 0) {
        return value.length === 1 ? value[0] : `${value.length} selected`;
      }
      return 'All';
    } else if (type === 'confidence') {
      if (value.min && value.max) {
        return `${value.min} ~ ${value.max}`;
      } else if (value.min) {
        return `≥ ${value.min}`;
      } else if (value.max) {
        return `≤ ${value.max}`;
      }
      return 'Any';
    }
    return 'All';
  };

  // 외부 클릭 감지를 위해 전체 컨테이너를 참조
  return (
    <div className="filter-button-container" ref={containerRef}>
      <button 
        className="filter-button" 
        onClick={togglePopup}
        ref={buttonRef}
      >
        <FaFilter size={12} style={{ marginRight: '5px' }} />
        <span>{label}: {getDisplayValue()}</span>
        <FaChevronDown size={10} style={{ marginLeft: '5px' }} />
      </button>

      {isOpen && (
        <div ref={popupRef}>
          {type === 'defect' && (
            <DefectTypeFilter
              options={options}
              selectedOptions={value}
              onApply={applyFilter}
              onClose={() => setIsOpen(false)}
            />
          )}
          
          {type === 'status' && (
            <StatusFilter
              options={options}
              selectedOptions={value}
              onApply={applyFilter}
              onClose={() => setIsOpen(false)}
            />
          )}
          
          {type === 'confidence' && (
            <ConfidenceScoreFilter
              range={value}
              onApply={applyFilter}
              onClose={() => setIsOpen(false)}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default FilterButton; 