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
  
  /**
   * Applies filters to the annotation data
   */
  const applyFilters = useCallback((data, currentFilters) => {
    return data.filter(annotation => {
      // Filter by defect type
      if (currentFilters[FILTER_TYPES.DEFECT_TYPE] !== 'all') {
        const defectType = currentFilters[FILTER_TYPES.DEFECT_TYPE];
        if (!annotation.defects.some(defect => defect.type === defectType)) {
          return false;
        }
      }
      
      // Filter by status
      if (currentFilters[FILTER_TYPES.STATUS] !== 'all') {
        if (annotation.status !== currentFilters[FILTER_TYPES.STATUS]) {
          return false;
        }
      }
      
      // Filter by confidence score
      if (currentFilters[FILTER_TYPES.CONFIDENCE_SCORE] !== 'all') {
        const score = annotation.confidenceScore;
        const confidenceFilter = currentFilters[FILTER_TYPES.CONFIDENCE_SCORE];
        
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
  const calculateStats = useCallback((data) => {
    return calculateDashboardStats(data);
  }, []);
  
  /**
   * Load annotations from the API
   */
  const loadAnnotations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch annotations from service
      const data = await AnnotationService.getAllAnnotationSummaries();
      setAnnotations(data);
      
      // Apply filters
      const filtered = applyFilters(data, filters);
      setFilteredAnnotations(filtered);
      
      // Calculate statistics
      const newStats = calculateStats(data);
      setStats(newStats);
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error loading annotations:', err);
      setError('Error loading data. Please try again.');
      setIsLoading(false);
    }
  }, [filters, applyFilters, calculateStats]);
  
  /**
   * Initial data loading
   */
  useEffect(() => {
    loadAnnotations();
  }, [loadAnnotations]);
  
  /**
   * Handle filter change
   */
  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
    
    // Apply new filters to annotations
    const filtered = applyFilters(annotations, newFilters);
    setFilteredAnnotations(filtered);
    setCurrentPage(1); // Reset to first page when filters change
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
    currentPage,
    itemsPerPage,
    handleFilterChange,
    handlePageChange,
    handleDelete,
    refreshData
  };
};

export default useAnnotatorDashboard; 