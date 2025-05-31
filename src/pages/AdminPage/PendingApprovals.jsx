/**
 * Pending Approvals Page
 * Manage user registration requests
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import DashboardHeader from '../../components/Annotator/Header/DashboardHeader';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import DefaultProfileIcon from '../../components/Customer/DefaultProfileIcon';
import UserService from '../../services/UserService';
import './PendingApprovals.css';

/**
 * Pending approvals page component
 */
const PendingApprovals = () => {
  const navigate = useNavigate();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load pending users
  useEffect(() => {
    const fetchPendingUsers = async () => {
      setIsLoading(true);
      try {
        // API에서 승인 대기 목록 가져오기
        const response = await UserService.getPendingApprovals();
        
        // 가입 승인 요청이 오래된 순으로 정렬 (user_id 기준 오름차순)
        // API에서 이미 정렬된 결과가 오더라도 안전하게 한번 더 정렬
        const sortedUsers = [...response].sort((a, b) => a.user_id - b.user_id);
        
        setPendingUsers(sortedUsers);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch pending users:', err);
        setError('Failed to load pending approval requests.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPendingUsers();
  }, []);

  // Handle user approval
  const handleApproveUser = async (userId) => {
    try {
      setIsLoading(true);
      // 사용자 승인 API 호출
      const response = await UserService.approveUser(userId, true);
      
      if (response) {
        // 승인 성공 시 목록에서 해당 사용자 제거
        setPendingUsers(pendingUsers.filter(user => user.user_id !== userId));
        // 승인 후 Members 페이지로 리다이렉트
        navigate('/admin');
      }
    } catch (err) {
      console.error('Failed to approve user:', err);
      setError('Failed to approve user.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle user rejection
  const handleRejectUser = async (userId) => {
    try {
      setIsLoading(true);
      // 사용자 거절 API 호출
      const response = await UserService.approveUser(userId, false);
      
      if (response) {
        // 거절 성공 시 목록에서 해당 사용자 제거
        setPendingUsers(pendingUsers.filter(user => user.user_id !== userId));
        // 거절 후 Members 페이지로 리다이렉트
        navigate('/admin');
      }
    } catch (err) {
      console.error('Failed to reject user:', err);
      setError('Failed to reject user.');
    } finally {
      setIsLoading(false);
    }
  };

  // Go back handler
  const handleBack = () => {
    navigate('/admin');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="admin-dashboard-page">
        <AdminSidebar activeMenu="members" />
        
        <div className="main-content">
          <DashboardHeader />
          <div className="admin-loading">
            <div className="loader"></div>
            <p>Loading approval requests...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-page">
      <AdminSidebar activeMenu="members" />
      
      <div className="main-content">
        <DashboardHeader />
        
        <div className="dashboard-content">
          <div className="pending-header">
            <button className="back-button" onClick={handleBack}>
              <FaArrowLeft className="back-icon" />
              <span>Back</span>
            </button>
            <h1>Pending Approval Requests</h1>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          {pendingUsers.length === 0 ? (
            <div className="no-pending">
              <div className="no-pending-icon">✅</div>
              <h3>No Pending Requests</h3>
              <p>All user registration requests have been processed.</p>
            </div>
          ) : (
            <div className="pending-cards">
              {pendingUsers.map(user => {
                // 프로필 이미지가 있는지 확인
                const hasProfileImage = user.profile_image && user.profile_image.trim() !== '';
                
                return (
                  <div key={user.user_id} className="approval-card">
                    <div className="profile-section">
                      {hasProfileImage ? (
                        <img 
                          src={user.profile_image} 
                          alt={user.name || 'User'} 
                          className="profile-image" 
                        />
                      ) : (
                        <div className="default-profile-container">
                          <DefaultProfileIcon size={60} />
                        </div>
                      )}
                    </div>
                    
                    <div className="user-info-section">
                      <div className="info-group">
                        <div className="info-label">Name</div>
                        <div className="info-value">{user.name || 'Unnamed'}</div>
                      </div>
                      
                      <div className="info-group">
                        <div className="info-label">Email</div>
                        <div className="info-value">{user.google_email}</div>
                      </div>
                      
                      <div className="info-group">
                        <div className="info-label">Role</div>
                        <div className="info-value">{user.user_type}</div>
                      </div>
                      
                      <div className="info-group">
                        <div className="info-label">Date of birth</div>
                        <div className="info-value">{user.birthdate || user.date_of_birth || 'Not specified'}</div>
                      </div>
                      
                      <div className="info-group">
                        <div className="info-label">Gender</div>
                        <div className="info-value">{user.gender || 'Not specified'}</div>
                      </div>
                    </div>
                    
                    <div className="action-section">
                      <button 
                        className="approve-button"
                        onClick={() => handleApproveUser(user.user_id)}
                        disabled={isLoading}
                      >
                        Approve
                      </button>
                      <button 
                        className="reject-button"
                        onClick={() => handleRejectUser(user.user_id)}
                        disabled={isLoading}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PendingApprovals; 