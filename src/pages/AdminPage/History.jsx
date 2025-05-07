/**
 * Admin History Page
 * View action history and logs
 */
import React from 'react';
import DashboardHeader from '../../components/Annotator/Header/DashboardHeader';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import './AdminDashboard.css'; // Reuse styles

/**
 * Admin history page component
 * Provides history and logs view
 */
const History = () => {
  return (
    <div className="admin-dashboard-page">
      <AdminSidebar activeMenu="history" />
      
      <div className="main-content">
        <DashboardHeader title="Admin" />
        
        <div className="dashboard-content">
          <div className="admin-controls">
            <h1>Action History</h1>
          </div>
          
          <div className="placeholder-content">
            <div className="placeholder-message">
              <h3>History Page</h3>
              <p>Action history and logs will be displayed here.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default History; 