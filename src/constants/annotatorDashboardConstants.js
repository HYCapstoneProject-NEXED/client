/**
 * Annotator Dashboard 관련 상수
 */

// 필터 타입
export const FILTER_TYPES = {
  DEFECT_TYPE: 'defect_type',
  STATUS: 'status',
  CONFIDENCE_SCORE: 'confidence_score'
};

// 결함 유형 필터 옵션
export const DEFECT_TYPE_FILTERS = [
  { id: 'all', label: '모든 유형' },
  { id: 'scratch', label: 'Scratch' },
  { id: 'dent', label: 'Dent' },
  { id: 'discoloration', label: 'Discoloration' },
  { id: 'contamination', label: 'Contamination' }
];

// 상태 필터 옵션
export const STATUS_FILTERS = [
  { id: 'all', label: '모든 상태' },
  { id: 'completed', label: 'Completed' },
  { id: 'pending', label: 'Pending' }
];

// 신뢰도 점수 필터 옵션
export const CONFIDENCE_SCORE_FILTERS = [
  { id: 'all', label: '모든 점수' },
  { id: 'high', label: '높음 (0.8-1.0)', min: 0.8, max: 1.0 },
  { id: 'medium', label: '중간 (0.5-0.8)', min: 0.5, max: 0.8 },
  { id: 'low', label: '낮음 (0.0-0.5)', min: 0, max: 0.5 }
];

// 대시보드 페이지 크기 (페이지네이션 용)
export const DASHBOARD_PAGE_SIZE = 10;

// 대시보드 테이블 컬럼 정의
export const DASHBOARD_COLUMNS = [
  { id: 'checkbox', label: '', width: '40px' },
  { id: 'camera', label: 'Camera', width: '15%' },
  { id: 'dataId', label: 'DATA ID', width: '15%' },
  { id: 'confidenceScore', label: 'CONFIDENCE SCORE(MIN)', width: '20%' },
  { id: 'count', label: 'COUNT', width: '10%' },
  { id: 'status', label: 'STATUS', width: '15%' },
  { id: 'actions', label: 'Actions', width: '15%' }
]; 