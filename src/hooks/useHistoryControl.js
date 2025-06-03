import { useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * A custom hook to control browser history navigation behavior
 * It prevents back navigation on admin pages and annotator dashboard
 * These pages are considered as entry points where users should not go back
 * 
 * @returns {Object} Navigation control methods
 */
const useHistoryControl = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Determine if current page is an admin page
  const isAdminPage = location.pathname.startsWith('/admin');
  
  // Determine if current page is annotator dashboard
  const isAnnotatorDashboard = 
    location.pathname === '/annotator' || 
    location.pathname === '/annotator/dashboard';
  
  // Check if we're on one of the main admin pages
  const isMainAdminPage = 
    location.pathname === '/admin' || 
    location.pathname === '/admin/tasks' || 
    location.pathname === '/admin/history' ||
    location.pathname === '/admin/dashboard';
  
  // Check if we should block back navigation
  const shouldBlockBackNavigation = isMainAdminPage || isAnnotatorDashboard;
  
  // Method to handle explicit navigation back to history
  const navigateBackToHistory = useCallback(() => {
    navigate('/admin/history');
  }, [navigate]);
  
  useEffect(() => {
    if (!shouldBlockBackNavigation) {
      return; // Only apply history control on main admin pages and annotator dashboard
    }
    
    const currentPath = location.pathname;
    
    // Prevent back navigation by immediately redirecting back
    const preventBackNavigation = (event) => {
      // Use React Router's navigate to force stay on current page
      navigate(currentPath, { replace: true });
    };
    
    // Set up initial history state
    window.history.pushState(null, '', currentPath);
    
    // Listen for popstate events (back/forward button)
    window.addEventListener('popstate', preventBackNavigation);
    
    // Additional protection - monitor URL changes
    let lastPath = currentPath;
    const checkPath = () => {
      const actualPath = window.location.pathname;
      if (actualPath !== lastPath && actualPath !== currentPath) {
        // If URL changed away from our protected page, navigate back
        navigate(currentPath, { replace: true });
        lastPath = currentPath;
      }
    };
    
    const intervalId = setInterval(checkPath, 50);
    
    // Cleanup function
    return () => {
      window.removeEventListener('popstate', preventBackNavigation);
      clearInterval(intervalId);
    };
  }, [shouldBlockBackNavigation, location.pathname, navigate]);
  
  return {
    isBackBlocked: shouldBlockBackNavigation,
    navigateBackToHistory
  };
};

export default useHistoryControl; 