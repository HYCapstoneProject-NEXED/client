/**
 * Annotator Dashboard Utility Functions
 */

/**
 * Format confidence score for display
 * @param {number} score - The confidence score (0-1)
 * @param {string} fallback - Fallback text when score is missing
 * @returns {string} Formatted score as percentage with 2 decimal places
 */
export const formatConfidenceScore = (score, fallback = '-') => {
  if (score === null || score === undefined || score === 0) {
    return fallback;
  }
  return `${(score * 100).toFixed(2)}%`;
};

/**
 * Get status style object based on status value
 * @param {string} status - Status value ('completed', 'pending', etc.)
 * @returns {Object} Style object with color, backgroundColor and text
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

  // Return default for undefined status
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
 * Format data ID (e.g., 1 -> IMG_001)
 * @param {number|string} id - Data ID
 * @returns {string} Formatted ID
 */
export const formatDataId = (id) => {
  if (typeof id === 'number') {
    return `IMG_${id.toString().padStart(3, '0')}`;
  }
  
  // If already in string format
  if (typeof id === 'string' && id.startsWith('IMG_')) {
    return id;
  }
  
  return `IMG_${id.toString().padStart(3, '0')}`;
};

/**
 * Extract numeric ID from formatted ID (e.g., IMG_001 -> 1)
 * @param {string} formattedId - Formatted ID (IMG_001 format)
 * @returns {number} Numeric ID
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
 * Calculate dashboard statistics from annotation data
 * @param {Array} annotations - The annotation data array
 * @returns {Object} Statistics object with total, completed, and pending counts
 */
export const calculateDashboardStats = (annotations) => {
  if (!annotations || !Array.isArray(annotations)) {
    return { total: 0, completed: 0, pending: 0 };
  }
  
  const total = annotations.length;
  const completed = annotations.filter(item => item.status === 'completed').length;
  
  return {
    total,
    completed,
    pending: total - completed
  };
};

/**
 * Get page data from array based on pagination settings
 * @param {Array} data - The full data array
 * @param {number} currentPage - The current page number (1-based)
 * @param {number} itemsPerPage - The number of items per page
 * @returns {Array} The paginated data for the current page
 */
export const getPaginatedData = (data, currentPage, itemsPerPage) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return data.slice(startIndex, endIndex);
}; 