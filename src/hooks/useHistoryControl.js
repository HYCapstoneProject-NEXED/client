import { useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * A custom hook to control browser history navigation behavior
 * It prevents back navigation on admin pages except when navigating from annotation detail to history
 * 
 * @returns {Object} Navigation control methods
 */
const useHistoryControl = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Determine if current page is an admin page
  const isAdminPage = location.pathname.startsWith('/admin');
  
  // Check if we're on one of the main admin pages
  const isMainAdminPage = 
    location.pathname === '/admin' || 
    location.pathname === '/admin/tasks' || 
    location.pathname === '/admin/history' ||
    location.pathname === '/admin/dashboard';
  
  // Method to handle explicit navigation back to history
  const navigateBackToHistory = useCallback(() => {
    navigate('/admin/history');
  }, [navigate]);
  
  useEffect(() => {
    if (!isMainAdminPage) {
      return; // Only apply history control on main admin pages
    }
    
    // This will be our flag to detect back button presses
    const preventBackNavigation = (event) => {
      // Most browsers now ignore this, but we'll include it for older browsers
      if (event) {
        event.preventDefault();
        window.history.pushState(null, '', window.location.pathname);
      }
    };
    
    // Add state to history when component mounts
    window.history.pushState(null, '', window.location.pathname);
    
    // Add event listener for popstate (triggered by back/forward navigation)
    window.addEventListener('popstate', preventBackNavigation);
    
    // Remove event listener when component unmounts
    return () => {
      window.removeEventListener('popstate', preventBackNavigation);
    };
  }, [isMainAdminPage]);
  
  return {
    isBackBlocked: isMainAdminPage,
    navigateBackToHistory
  };
};

export default useHistoryControl; 