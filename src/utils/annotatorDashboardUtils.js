/**
 * 어노테이터 대시보드 관련 유틸리티 함수
 */

/**
 * 신뢰도 점수를 포맷팅하는 함수
 * @param {number|null} score - 신뢰도 점수
 * @param {string} fallback - 값이 없을 때 표시할 문자열
 * @returns {string} 포맷팅된 신뢰도 점수
 */
export const formatConfidenceScore = (score, fallback = '-') => {
  if (score === null || score === undefined) {
    return fallback;
  }
  return score.toFixed(2);
};

/**
 * 상태값에 따른 스타일 객체를 반환하는 함수
 * @param {string} status - 상태값 ('completed', 'pending' 등)
 * @returns {Object} 스타일 객체
 */
export const getStatusStyles = (status) => {
  const statusMap = {
    completed: {
      color: '#16DBCC',
      backgroundColor: '#E0F2F1',
      text: 'Completed'
    },
    pending: {
      color: '#718EBF',
      backgroundColor: '#FFF8E1',
      text: 'Pending'
    },
    'in progress': {
      color: '#4880FF',
      backgroundColor: '#E3F2FD',
      text: 'In Progress'
    },
    rejected: {
      color: '#EF3826',
      backgroundColor: '#FFEBEE',
      text: 'Rejected'
    }
  };

  // 상태값이 정의되지 않은 경우 기본값 반환
  if (!statusMap[status]) {
    return {
      color: '#555555',
      backgroundColor: '#E0E0E0',
      text: status.charAt(0).toUpperCase() + status.slice(1)
    };
  }

  return statusMap[status];
};

/**
 * 데이터 ID를 포맷팅하는 함수 (예: 1 -> IMG_001)
 * @param {number|string} id - 데이터 ID
 * @returns {string} 포맷팅된 ID
 */
export const formatDataId = (id) => {
  if (typeof id === 'number') {
    return `IMG_${id.toString().padStart(3, '0')}`;
  }
  
  // 이미 문자열 형태인 경우
  if (typeof id === 'string' && id.startsWith('IMG_')) {
    return id;
  }
  
  return `IMG_${id.toString().padStart(3, '0')}`;
};

/**
 * 문자열 형태의 데이터 ID에서 숫자 ID를 추출하는 함수 (예: IMG_001 -> 1)
 * @param {string} formattedId - 포맷팅된 ID (IMG_001 형식)
 * @returns {number} 숫자 ID
 */
export const extractNumericId = (formattedId) => {
  if (typeof formattedId !== 'string') {
    return null;
  }
  
  const match = formattedId.match(/IMG_(\d+)/);
  if (match && match[1]) {
    return parseInt(match[1]);
  }
  
  return null;
};

/**
 * 데이터 목록에서 통계 정보를 계산하는 함수
 * @param {Array} data - 어노테이션 데이터 배열
 * @returns {Object} 통계 정보
 */
export const calculateDashboardStats = (data) => {
  if (!data || !Array.isArray(data)) {
    return {
      total: 0,
      completed: 0,
      pending: 0
    };
  }
  
  const total = data.length;
  const completed = data.filter(item => item.status === 'completed').length;
  
  return {
    total,
    completed,
    pending: total - completed
  };
}; 