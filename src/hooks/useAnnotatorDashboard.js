/**
 * Custom hook for Annotator Dashboard
 * Handles loading data, filtering, statistics, and pagination
 */
import { useState, useEffect, useCallback } from 'react';
import AnnotationService from '../services/AnnotationService';
import { FILTER_TYPES } from '../constants/annotatorDashboardConstants';
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
  const currentUserId = 1001; // 임시 사용자 ID
  
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
   * Calculate statistics from annotation data
   */
  const calculateStats = useCallback((dashboardData) => {
    // 새로운 API 응답 형식에 맞게 통계 계산
    return {
      total: dashboardData.total_images || 0,
      completed: dashboardData.completed_images || 0,
      pending: dashboardData.pending_images || 0
    };
  }, []);
  
  /**
   * 이미지 목록을 어노테이션 형식으로 변환
   */
  const transformImagesToAnnotations = useCallback((imageList) => {
    return imageList.map(image => {
      return {
        id: `IMG_${image.image_id.toString().padStart(3, '0')}`, // IMG_001 형식으로 포맷팅
        cameraId: `CAM_${image.camera_id}`,
        confidenceScore: image.confidence,
        defectCount: image.count,
        status: image.status,
        defectTypes: [], // API에서 defect type 정보를 제공하지 않음 (필요시 추가 구현)
        boundingBoxes: image.bounding_boxes || []
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
      // 새로운 API 사용하여 어노테이터 대시보드 데이터 가져오기
      const dashboardData = await AnnotationService.getAnnotatorDashboard(currentUserId);
      
      // 데이터 소스 확인 (디버깅용)
      console.log('==== 데이터 소스 디버깅 ====');
      if (dashboardData.image_list && dashboardData.image_list.length > 0) {
        console.log('첫 번째 이미지 ID:', dashboardData.image_list[0].image_id);
        console.log('첫 번째 이미지 경로:', dashboardData.image_list[0].file_path);
        
        // 이미지 ID가 1~4 범위이고, 파일 경로가 img_00x.jpg 형식이면 더미 데이터일 가능성이 높음
        const isDummyData = 
          dashboardData.image_list[0].image_id <= 4 && 
          dashboardData.image_list[0].file_path.includes('img_00');
          
        console.log('더미 데이터 여부:', isDummyData ? '예 (더미 데이터)' : '아니오 (실제 API 데이터)');
      } else {
        console.log('이미지 데이터가 없습니다.');
      }
      console.log('전체 이미지 수:', dashboardData.total_images);
      console.log('=========================');
      
      // 이미지 목록을 어노테이션 형식으로 변환
      const transformedAnnotations = transformImagesToAnnotations(dashboardData.image_list);
      setAnnotations(transformedAnnotations);
      
      // 필터링된 어노테이션 설정
      setFilteredAnnotations(transformedAnnotations);
      
      // 통계 설정
      setStats(calculateStats(dashboardData));
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error loading annotations:', err);
      setError('Error loading data. Please try again.');
      setIsLoading(false);
    }
  }, [calculateStats, transformImagesToAnnotations]);
  
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
  const handleFilterChange = async (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
    
    setIsLoading(true);
    try {
      // 필터 옵션 구성
      const filterOptions = {};
      
      // Defect Type 필터 적용
      if (newFilters[FILTER_TYPES.DEFECT_TYPE] !== 'all') {
        const defectTypeFilter = newFilters[FILTER_TYPES.DEFECT_TYPE];
        if (Array.isArray(defectTypeFilter)) {
          filterOptions.class_names = defectTypeFilter;
        } else {
          filterOptions.class_names = [defectTypeFilter];
        }
      }
      
      // Status 필터 적용
      if (newFilters[FILTER_TYPES.STATUS] !== 'all') {
        const statusFilter = newFilters[FILTER_TYPES.STATUS];
        if (Array.isArray(statusFilter)) {
          // 여러 상태가 선택된 경우 첫 번째 상태만 사용 (API가 단일 상태만 지원)
          filterOptions.status = statusFilter[0];
        } else {
          filterOptions.status = statusFilter;
        }
      }
      
      // Confidence Score 필터 적용
      if (newFilters[FILTER_TYPES.CONFIDENCE_SCORE] !== 'all') {
        const confidenceFilter = newFilters[FILTER_TYPES.CONFIDENCE_SCORE];
        if (confidenceFilter === 'high') {
          filterOptions.min_confidence = 0.7;
        } else if (confidenceFilter === 'medium') {
          filterOptions.min_confidence = 0.4;
          filterOptions.max_confidence = 0.7;
        } else if (confidenceFilter === 'low') {
          filterOptions.max_confidence = 0.4;
        }
      }
      
      // 필터링된 API 호출
      const filteredData = await AnnotationService.getFilteredAnnotatorDashboard(
        currentUserId, 
        filterOptions
      );
      
      // 이미지 목록을 어노테이션 형식으로 변환
      const transformedAnnotations = transformImagesToAnnotations(filteredData.image_list);
      setFilteredAnnotations(transformedAnnotations);
      
      setCurrentPage(1); // Reset to first page when filters change
      setIsLoading(false);
    } catch (err) {
      console.error('Error applying filters:', err);
      setError('Error applying filters. Please try again.');
      setIsLoading(false);
    }
  };
  
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
    if (window.confirm('Are you sure you want to delete this annotation?')) {
      try {
        // Implement actual deletion logic
        await AnnotationService.deleteAnnotation(id);
        
        // Refresh data after deletion
        loadAnnotations();
      } catch (err) {
        console.error('Error deleting annotation:', err);
        setError('Error deleting annotation. Please try again.');
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