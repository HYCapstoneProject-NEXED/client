/**
 * 어노테이션 관련 유틸리티 함수
 */

import { DEFECT_TYPES } from '../constants/annotationConstants';

/**
 * 결함 유형에 해당하는 CSS 색상 클래스 반환
 * @param {string} defectType - 결함 유형
 * @returns {string} CSS 클래스명
 */
export const getDefectColorClass = (defectType) => {
  // 결함 유형에 따른 클래스 매핑 (DB와 일치하는 값으로 수정)
  switch(defectType) {
    case DEFECT_TYPES.SCRATCH:
      return 'annotator-defect-1';
    case DEFECT_TYPES.DENT:
      return 'annotator-defect-2';
    case DEFECT_TYPES.DISCOLORATION:
      return 'annotator-defect-3';
    case DEFECT_TYPES.CONTAMINATION:
      return 'annotator-defect-4';
    default:
      return 'annotator-defect-1'; // 기본값은 Scratch
  }
};

/**
 * 두 좌표(x, y, width, height)가 동일한지 비교
 * @param {Object} coords1 - 첫 번째 좌표
 * @param {Object} coords2 - 두 번째 좌표
 * @returns {boolean} 동일 여부
 */
export const areCoordinatesEqual = (coords1, coords2) => {
  return (
    coords1.x === coords2.x &&
    coords1.y === coords2.y &&
    coords1.width === coords2.width &&
    coords1.height === coords2.height
  );
};

/**
 * 날짜를 yyyy.MM.dd HH:mm:ss 형식으로 포맷팅
 * @param {string} isoDateString - ISO 형식 날짜 문자열
 * @returns {string} 포맷팅된 날짜 문자열
 */
export const formatDateTime = (isoDateString) => {
  const date = new Date(isoDateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}.${month}.${day} ${hours}:${minutes}:${seconds}`;
}; 