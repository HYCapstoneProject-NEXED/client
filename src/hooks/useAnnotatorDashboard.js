/**
 * Custom hook for Annotator Dashboard
 * Handles loading data, filtering, statistics, and pagination
 */
import { useState, useEffect, useCallback } from 'react';
import AnnotationService from '../services/AnnotationService';
import { FILTER_TYPES, CONFIDENCE_SCORE_FILTERS } from '../constants/annotatorDashboardConstants';
import { calculateDashboardStats } from '../utils/annotatorDashboardUtils';

const useAnnotatorDashboard = () => {
  // State for annotations
  const [annotations, setAnnotations] = useState([]);
  const [filteredAnnotations, setFilteredAnnotations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 결함 클래스 상태 추가
  const [defectClasses, setDefectClasses] = useState([]);
  
  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0
  });
  
  // Filters
  const [filters, setFilters] = useState({
    [FILTER_TYPES.DEFECT_TYPE]: 'all',
    [FILTER_TYPES.STATUS]: 'all',
    [FILTER_TYPES.CONFIDENCE_SCORE]: 'all'
  });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // 현재 사용자 ID (실제로는 로그인 상태에서 가져와야 함)
  const currentUserId = 2; // 임시 사용자 ID
  
  // 결함 클래스 데이터 로드 함수
  const loadDefectClasses = useCallback(async () => {
    try {
      const classes = await AnnotationService.getDefectClasses();
      console.log('결함 클래스 데이터 로드됨:', classes);
      setDefectClasses(classes);
    } catch (err) {
      console.error('결함 클래스 로드 오류:', err);
    }
  }, []);
  
  /**
   * Applies filters to the annotation data
   */
  const applyFilters = useCallback((data, currentFilters) => {
    return data.filter(annotation => {
      // Filter by defect type
      if (currentFilters[FILTER_TYPES.DEFECT_TYPE] !== 'all') {
        const defectTypeFilter = currentFilters[FILTER_TYPES.DEFECT_TYPE];
        
        // 배열인 경우 (여러 선택)
        if (Array.isArray(defectTypeFilter)) {
          // defectTypes 배열이 없거나, 선택된 필터 중 하나라도 포함하지 않으면 필터링
          if (!annotation.defectTypes || 
              !defectTypeFilter.some(type => annotation.defectTypes.includes(type.toLowerCase()))) {
            return false;
          }
        } 
        // 문자열인 경우 (단일 선택 - 이전 버전 호환)
        else {
          const defectType = defectTypeFilter.toLowerCase();
          if (!annotation.defectTypes || !annotation.defectTypes.includes(defectType)) {
            return false;
          }
        }
      }
      
      // Filter by status
      if (currentFilters[FILTER_TYPES.STATUS] !== 'all') {
        const statusFilter = currentFilters[FILTER_TYPES.STATUS];
        
        // 배열인 경우 (여러 선택)
        if (Array.isArray(statusFilter)) {
          // 선택된 상태 중 하나도 맞지 않으면 필터링
          if (!statusFilter.includes(annotation.status)) {
            return false;
          }
        } 
        // 문자열인 경우 (단일 선택 - 이전 버전 호환)
        else {
          if (annotation.status !== statusFilter) {
            return false;
          }
        }
      }
      
      // Filter by confidence score
      if (currentFilters[FILTER_TYPES.CONFIDENCE_SCORE] !== 'all') {
        const score = annotation.confidenceScore;
        const confidenceFilter = currentFilters[FILTER_TYPES.CONFIDENCE_SCORE];
        
        // null이나 undefined인 경우 필터링 제외
        if (score === null || score === undefined) {
          return false;
        }
        
        if (confidenceFilter === 'high' && score < 0.7) return false;
        if (confidenceFilter === 'medium' && (score < 0.4 || score >= 0.7)) return false;
        if (confidenceFilter === 'low' && score >= 0.4) return false;
      }
      
      return true;
    });
  }, []);
  
  /**
   * Load task summary from the API
   */
  const loadTaskSummary = useCallback(async () => {
    try {
      // 사용자 ID 2로 고정하여 task 요약 정보 가져오기
      const userId = 2; // 항상 사용자 ID 2 사용
      const taskSummary = await AnnotationService.getTaskSummary(userId);
      
      console.log('Task Summary 로드됨:', taskSummary);
      
      // API 응답에서 직접 통계 값을 설정
      setStats({
        total: taskSummary.total_images || 0,
        completed: taskSummary.completed_images || 0,
        pending: taskSummary.pending_images || 0
      });
      
      return taskSummary;
    } catch (err) {
      console.error('Task Summary 로드 오류:', err);
      // 기본값 설정
      setStats({
        total: 0,
        completed: 0,
        pending: 0
      });
      return null;
    }
  }, []);
  
  /**
   * 이미지 목록을 어노테이션 형식으로 변환
   */
  const transformImagesToAnnotations = useCallback((imageList) => {
    if (!imageList || !Array.isArray(imageList)) {
      console.warn('변환할 이미지 목록이 없거나 배열이 아닙니다:', imageList);
      return [];
    }
    
    return imageList.map(image => {
      // 바운딩 박스 데이터 정제
      let boundingBoxes = [];
      if (image.bounding_boxes && Array.isArray(image.bounding_boxes)) {
        // API 응답 형식에 맞게 바운딩 박스 데이터 변환
        boundingBoxes = image.bounding_boxes.map(box => {
          // API 응답에서는 bounding_box 필드 안에 실제 바운딩 박스 정보가 있음
          if (box.bounding_box) {
            return {
              ...box.bounding_box,  // 바운딩 박스 좌표 정보 (h, w, cx, cy 또는 width, height, x_center, y_center)
              class_name: box.class_name,
              class_color: box.class_color,
              is_active: box.is_active
            };
          }
          
          // 직접 바운딩 박스 데이터가 있는 경우 (새로운 형태와 기존 형태 모두 지원)
          if (box.width !== undefined && box.height !== undefined && 
              box.x_center !== undefined && box.y_center !== undefined) {
            // 새로운 형태: { width, height, x_center, y_center }
            return {
              width: box.width,
              height: box.height,
              x_center: box.x_center,
              y_center: box.y_center,
              class_name: box.class_name,
              class_color: box.class_color,
              is_active: box.is_active
            };
          }
          
          if (box.h !== undefined && box.w !== undefined && 
              box.cx !== undefined && box.cy !== undefined) {
            // 기존 형태: { h, w, cx, cy }
            return {
              h: box.h,
              w: box.w,
              cx: box.cx,
              cy: box.cy,
              class_name: box.class_name,
              class_color: box.class_color,
              is_active: box.is_active
            };
          }
          
          // additionalProp1 형식이거나 기타 형식인 경우 그대로 반환
          return box;
        }).filter(box => box !== null && box !== undefined);
      }
      
      console.log('변환된 바운딩 박스:', boundingBoxes);
      
      // 이미지 크기 정보
      const width = image.width || 640;
      const height = image.height || 640;
      
      // 결과 객체 반환
      return {
        id: `IMG_${image.image_id.toString().padStart(3, '0')}`, // IMG_001 형식으로 포맷팅
        cameraId: image.camera_id ? `CAM_${image.camera_id}` : 'Unknown',
        confidenceScore: image.confidence,
        defectCount: image.count || (boundingBoxes ? boundingBoxes.length : 0),
        status: image.status || 'pending',
        defectTypes: [], // API에서 defect type 정보를 제공하지 않음 (필요시 추가 구현)
        boundingBoxes: boundingBoxes,
        dimensions: {
          width: width,
          height: height
        },
        filePath: image.file_path // 이미지 경로 추가
      };
    });
  }, []);
  
  /**
   * Load annotations from the API
   */
  const loadAnnotations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 먼저 Task Summary를 로드 (Current Task 영역용)
      await loadTaskSummary();
      
      // 어노테이션 목록 데이터 가져오기 (테이블 표시용)
      const annotationListData = await AnnotationService.getAnnotationList(currentUserId);
      
      console.log('==== 데이터 소스 디버깅 ====');
      if (annotationListData && annotationListData.length > 0) {
        console.log('첫 번째 이미지 ID:', annotationListData[0].image_id);
        console.log('첫 번째 이미지 경로:', annotationListData[0].file_path);
        
        // 더미 데이터 여부 확인
        const isDummyData = 
          annotationListData[0].image_id <= 4 && 
          annotationListData[0].file_path.includes('img_00');
          
        console.log('더미 데이터 여부:', isDummyData ? '예 (더미 데이터)' : '아니오 (실제 API 데이터)');
      } else {
        console.log('이미지 데이터가 없습니다.');
      }
      console.log('전체 이미지 수:', annotationListData?.length || 0);
      console.log('=========================');
      
      // 이미지 목록을 어노테이션 형식으로 변환
      const transformedAnnotations = transformImagesToAnnotations(annotationListData);
      setAnnotations(transformedAnnotations);
      
      // 필터링된 어노테이션 설정
      setFilteredAnnotations(transformedAnnotations);
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error loading annotations:', err);
      setError('Error loading data. Please try again.');
      setIsLoading(false);
    }
  }, [loadTaskSummary, transformImagesToAnnotations]);
  
  /**
   * Initial data loading
   */
  useEffect(() => {
    loadAnnotations();
    loadDefectClasses(); // 결함 클래스 데이터 로드
  }, [loadAnnotations, loadDefectClasses]);
  
  /**
   * Handle filter change
   */
  const handleFilterChange = useCallback(async (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
    
    setIsLoading(true);
    try {
      // 필터 옵션 구성
      const filterOptions = {};
      
      // Defect Type 필터 적용
      if (newFilters[FILTER_TYPES.DEFECT_TYPE] !== 'all') {
        const defectTypeFilter = newFilters[FILTER_TYPES.DEFECT_TYPE];
        
        if (Array.isArray(defectTypeFilter) && defectTypeFilter.length > 0) {
          // 백엔드 API에 맞게 class_names로 변환하여 전송
          // 필터 ID를 기반으로 defectClasses에서 실제 class_name을 찾아서 사용
          const classNames = [];
          
          for (const typeId of defectTypeFilter) {
            // defectClasses에서 해당 ID의 class_name 찾기
            const defectClass = defectClasses.find(dc => dc.class_id.toString() === typeId.toString());
            if (defectClass && defectClass.class_name) {
              classNames.push(defectClass.class_name);
            }
          }
          
          if (classNames.length > 0) {
            filterOptions.class_names = classNames;
          }
        } else if (!Array.isArray(defectTypeFilter) && defectTypeFilter !== 'all') {
          // 단일 값인 경우
          const defectClass = defectClasses.find(dc => dc.class_id.toString() === defectTypeFilter.toString());
          if (defectClass && defectClass.class_name) {
            filterOptions.class_names = [defectClass.class_name];
          }
        }
      }
      
      // Status 필터 적용
      if (newFilters[FILTER_TYPES.STATUS] !== 'all') {
        const statusFilter = newFilters[FILTER_TYPES.STATUS];
        
        if (Array.isArray(statusFilter) && statusFilter.length > 0) {
          // 백엔드 API는 여러 상태를 지원하지 않을 수 있으므로 첫 번째 값만 사용
          filterOptions.status = statusFilter[0];
        } else if (!Array.isArray(statusFilter)) {
          filterOptions.status = statusFilter;
        }
      }
      
      // Confidence Score 필터 적용
      if (newFilters[FILTER_TYPES.CONFIDENCE_SCORE] !== 'all') {
        const confidenceFilter = newFilters[FILTER_TYPES.CONFIDENCE_SCORE];
        
        // 객체인 경우 (사용자가 직접 입력한 min/max 값)
        if (typeof confidenceFilter === 'object') {
          // min 값이 있으면 필터 옵션에 추가
          if (confidenceFilter.min !== undefined) {
            filterOptions.min_confidence = confidenceFilter.min;
          }
          
          // max 값이 있으면 필터 옵션에 추가
          if (confidenceFilter.max !== undefined) {
            filterOptions.max_confidence = confidenceFilter.max;
          }
          
          // min=0이고 max=1인 경우 (전체 범위) 필터 옵션에서 제외
          // 이 경우는 필터를 적용하지 않는 것과 동일
          if (filterOptions.min_confidence === 0 && filterOptions.max_confidence === 1) {
            delete filterOptions.min_confidence;
            delete filterOptions.max_confidence;
          }
        } 
        // 문자열인 경우 (미리 정의된 범위 - high, medium, low)
        else {
          // CONFIDENCE_SCORE_FILTERS에서 범위 값 가져오기
          const filterConfig = CONFIDENCE_SCORE_FILTERS.find(f => f.id === confidenceFilter);
          
          if (filterConfig) {
            if (filterConfig.min !== undefined) {
              filterOptions.min_confidence = filterConfig.min;
            }
            
            if (filterConfig.max !== undefined) {
              filterOptions.max_confidence = filterConfig.max;
            }
            
            // min=0이고 max=1인 경우 (전체 범위) 필터 옵션에서 제외
            if (filterOptions.min_confidence === 0 && filterOptions.max_confidence === 1) {
              delete filterOptions.min_confidence;
              delete filterOptions.max_confidence;
            }
          }
        }
      }
      
      console.log('필터링 옵션:', filterOptions);
      
      // 필터링된 API 호출
      const filteredData = await AnnotationService.getFilteredAnnotations(
        currentUserId, 
        filterOptions
      );
      
      // 이미지 목록을 어노테이션 형식으로 변환
      const transformedAnnotations = transformImagesToAnnotations(filteredData);
      setFilteredAnnotations(transformedAnnotations);
      
      setCurrentPage(1); // Reset to first page when filters change
      setIsLoading(false);
    } catch (err) {
      console.error('Error applying filters:', err);
      setError('Error applying filters. Please try again.');
      setIsLoading(false);
    }
  }, [filters, defectClasses, transformImagesToAnnotations, currentUserId]);
  
  /**
   * Handle page change
   */
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  
  /**
   * Handle deleting an annotation
   */
  const handleDelete = async (id) => {
    if (window.confirm('이 이미지를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      try {
        // id에서 이미지 ID 추출 (IMG_001 형식에서 숫자만 추출)
        const imageIdMatch = id.match(/IMG_(\d+)/);
        if (!imageIdMatch) {
          console.error('유효하지 않은 이미지 ID 형식:', id);
          setError('유효하지 않은 이미지 ID 형식입니다.');
          return;
        }
        
        // 숫자 형식의 이미지 ID로 변환
        const imageId = parseInt(imageIdMatch[1], 10);
        
        // 이미지 삭제 API 호출
        const response = await AnnotationService.deleteImages([imageId]);
        
        if (response.success) {
          console.log('이미지 삭제 성공:', response);
          // 삭제 후 데이터 새로고침
          loadAnnotations();
        } else {
          console.error('이미지 삭제 실패:', response.message);
          setError(`이미지 삭제에 실패했습니다: ${response.message}`);
        }
      } catch (err) {
        console.error('이미지 삭제 중 오류 발생:', err);
        setError('이미지 삭제 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    }
  };
  
  /**
   * Refresh data
   */
  const refreshData = () => {
    loadAnnotations();
  };
  
  return {
    annotations: filteredAnnotations,
    isLoading,
    error,
    stats,
    filters,
    defectClasses, // 결함 클래스 정보 추가
    currentPage,
    itemsPerPage,
    handleFilterChange,
    handlePageChange,
    handleDelete,
    refreshData
  };
};

export default useAnnotatorDashboard; 