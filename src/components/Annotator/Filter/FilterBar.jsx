import React, { useState } from 'react';
import FilterButton from './FilterButton';
import './FilterPopup.css';

/**
 * 필터 바 컴포넌트 - 여러 필터 버튼을 포함
 */
const FilterBar = () => {
  // 결함 유형 필터 상태
  const [defectFilters, setDefectFilters] = useState([]);
  // 상태 필터 상태
  const [statusFilters, setStatusFilters] = useState([]);
  // 신뢰도 점수 필터 상태
  const [confidenceFilter, setConfidenceFilter] = useState({ min: '', max: '' });

  // 사용 가능한 결함 유형 목록
  const defectOptions = ['Defect_A', 'Defect_B', 'Defect_C'];
  // 사용 가능한 상태 목록
  const statusOptions = ['Pending', 'Completed'];

  return (
    <div className="filter-bar">
      <FilterButton
        type="defect"
        label="Defect Type"
        value={defectFilters}
        onChange={setDefectFilters}
        options={defectOptions}
      />
      
      <FilterButton
        type="status"
        label="Status"
        value={statusFilters}
        onChange={setStatusFilters}
        options={statusOptions}
      />
      
      <FilterButton
        type="confidence"
        label="Confidence"
        value={confidenceFilter}
        onChange={setConfidenceFilter}
      />
    </div>
  );
};

export default FilterBar; 