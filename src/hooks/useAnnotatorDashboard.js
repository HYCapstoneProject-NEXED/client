import { useState, useEffect, useCallback } from 'react';
import AnnotationService from '../services/AnnotationService';
import { FILTER_TYPES } from '../constants/annotatorDashboardConstants';

/**
 * 어노테이터 대시보드 데이터 및 필터링 관리 커스텀 훅
 * - 어노테이션 데이터 로딩
 * - 필터링 기능
 * - 통계 계산
 * - 페이지네이션
 */
const useAnnotatorDashboard = () => {
  // 데이터 상태
  const [annotations, setAnnotations] = useState([]);
  const [filteredAnnotations, setFilteredAnnotations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 통계 상태
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0
  });
  
  // 필터 상태
  const [filters, setFilters] = useState({
    [FILTER_TYPES.DEFECT_TYPE]: 'all',
    [FILTER_TYPES.STATUS]: 'all',
    [FILTER_TYPES.CONFIDENCE_SCORE]: 'all'
  });
  
  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // 데이터 로딩 함수
  const loadAnnotations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await AnnotationService.getAllAnnotationSummaries();
      setAnnotations(data);
      
      // 필터링 적용
      applyFilters(data);
      
      // 통계 계산
      calculateStats(data);
      
      setIsLoading(false);
    } catch (err) {
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
      console.error('Error loading annotations:', err);
      setIsLoading(false);
    }
  }, []);
  
  // 초기 데이터 로드
  useEffect(() => {
    loadAnnotations();
  }, [loadAnnotations]);
  
  // 필터 변경 시 필터링 적용
  useEffect(() => {
    applyFilters(annotations);
  }, [filters, annotations]);
  
  // 필터링 적용 함수
  const applyFilters = (data) => {
    let filtered = [...data];
    
    // 결함 유형 필터링 (추후 구현)
    // if (filters[FILTER_TYPES.DEFECT_TYPE] !== 'all') {
    //   filtered = filtered.filter(...);
    // }
    
    // 상태 필터링
    if (filters[FILTER_TYPES.STATUS] !== 'all') {
      filtered = filtered.filter(item => item.status === filters[FILTER_TYPES.STATUS]);
    }
    
    // 신뢰도 점수 필터링
    if (filters[FILTER_TYPES.CONFIDENCE_SCORE] !== 'all') {
      const scoreFilter = filters[FILTER_TYPES.CONFIDENCE_SCORE];
      
      switch (scoreFilter) {
        case 'high':
          filtered = filtered.filter(item => item.confidenceScore >= 0.8);
          break;
        case 'medium':
          filtered = filtered.filter(item => item.confidenceScore >= 0.5 && item.confidenceScore < 0.8);
          break;
        case 'low':
          filtered = filtered.filter(item => item.confidenceScore !== null && item.confidenceScore < 0.5);
          break;
        default:
          break;
      }
    }
    
    setFilteredAnnotations(filtered);
    setCurrentPage(1); // 필터 변경 시 첫 페이지로 이동
  };
  
  // 통계 계산 함수
  const calculateStats = (data) => {
    const completed = data.filter(item => item.status === 'completed').length;
    
    setStats({
      total: data.length,
      completed,
      pending: data.length - completed
    });
  };
  
  // 필터 변경 핸들러
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };
  
  // 페이지 변경 핸들러
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  
  // 현재 페이지의 데이터 계산
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAnnotations.slice(startIndex, endIndex);
  };
  
  // 어노테이션 삭제 핸들러
  const handleDelete = async (id) => {
    if (window.confirm(`정말로 ${id} 어노테이션을 삭제하시겠습니까?`)) {
      try {
        // 실제 구현 시에는 서비스를 통한 삭제 요청 필요
        // await AnnotationService.deleteAnnotation(id);
        
        // 임시로 로컬 상태에서만 삭제
        const updatedAnnotations = annotations.filter(anno => anno.id !== id);
        setAnnotations(updatedAnnotations);
        
        // 상태 업데이트
        calculateStats(updatedAnnotations);
        
        return true;
      } catch (err) {
        console.error('Failed to delete annotation:', err);
        return false;
      }
    }
    return false;
  };
  
  // 데이터 리로드 함수
  const refreshData = () => {
    loadAnnotations();
  };
  
  return {
    annotations: getCurrentPageItems(),
    allAnnotations: filteredAnnotations,
    isLoading,
    error,
    stats,
    filters,
    currentPage,
    itemsPerPage,
    totalPages: Math.ceil(filteredAnnotations.length / itemsPerPage),
    handleFilterChange,
    handlePageChange,
    handleDelete,
    refreshData
  };
};

export default useAnnotatorDashboard; 