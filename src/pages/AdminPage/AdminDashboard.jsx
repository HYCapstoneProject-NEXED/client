/**
 * Admin Members Page
 * User management and permission controls
 */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../../components/Annotator/Header/DashboardHeader';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import UserCard from '../../components/Admin/UserCard';
import UserService from '../../services/UserService';
import './AdminDashboard.css';
import useHistoryControl from '../../hooks/useHistoryControl';

/**
 * Admin members page component
 * Provides user management features
 */
const Members = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tempSearchTerm, setTempSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  
  // Use history control to manage back navigation
  useHistoryControl();

  // Role options
  const roleOptions = [
    { id: 'all_roles', label: 'All Roles' },
    { id: 'admin', label: 'Admin' },
    { id: 'customer', label: 'Customer' },
    { id: 'ml_engineer', label: 'ML Engineer' },
    { id: 'annotator', label: 'Annotator' }
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // 검색어 상태 동기화
  useEffect(() => {
    setTempSearchTerm(searchTerm);
  }, [searchTerm]);
  
  // Load user list
  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // API에서 사용자 목록 가져오기
        // roleFilter가 'all'이면 'all_roles'로 변환
        const role = roleFilter === 'all' ? 'all_roles' : roleFilter;
        const response = await UserService.getAllUsers(role, searchTerm);
        setUsers(response);
      } catch (err) {
        console.error('Failed to load users:', err);
        setError('Failed to load users. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, [roleFilter, searchTerm]);

  // Filter users based on search term and role filter
  const filteredUsers = users;

  // Handle role change
  const handleRoleChange = async (userId, newRole) => {
    if (window.confirm(`정말 이 사용자의 역할을 ${newRole}로 변경하시겠습니까?`)) {
      try {
        setIsLoading(true);
        
        // API 호출하여 역할 변경
        const response = await UserService.updateUserRole(userId, newRole);
        
        if (response) {
          // 성공적으로 변경된 경우 UI 업데이트
          setUsers(users.map(user => 
            user.user_id === userId ? { ...user, user_type: newRole } : user
          ));
          
          console.log(`사용자 ${userId}의 역할이 ${newRole}로 변경되었습니다.`);
        }
      } catch (err) {
        console.error('Failed to update user role:', err);
        setError('Failed to update user role.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handle status change
  const handleStatusChange = async (userId, isActive) => {
    try {
      setIsLoading(true);
      
      // API 호출하여 상태 변경
      const response = await UserService.updateUserActiveStatus(userId, isActive);
      
      if (response) {
        // 성공적으로 변경된 경우 UI 업데이트
        setUsers(users.map(user => 
          user.user_id === userId ? { ...user, is_active: isActive } : user
        ));
        
        console.log(`사용자 ${userId}의 상태가 ${isActive ? '활성화' : '비활성화'}되었습니다.`);
      }
    } catch (err) {
      console.error('Failed to update user status:', err);
      setError('Failed to update user status.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (userId) => {
    if (window.confirm('정말로 이 사용자를 비활성화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      try {
        setIsLoading(true);
        
        // API 호출하여 사용자 비활성화 (삭제)
        const response = await UserService.deactivateUser(userId);
        
        if (response && response.user_id) {
          // 성공적으로 비활성화된 경우 UI 업데이트
          // 옵션 1: 사용자를 목록에서 제거
          setUsers(users.filter(user => user.user_id !== userId));
          
          // 옵션 2: 사용자의 is_active 상태만 변경
          // setUsers(users.map(user => 
          //   user.user_id === userId ? { ...user, is_active: false } : user
          // ));
          
          console.log(`사용자 ${userId}가 비활성화되었습니다.`);
        }
      } catch (err) {
        console.error('Failed to deactivate user:', err);
        setError('Failed to deactivate user.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Select role from dropdown
  const selectRole = (role) => {
    setRoleFilter(role);
    setIsDropdownOpen(false);
  };

  // Navigate to pending approvals page
  const handlePendingApprovalClick = () => {
    navigate('/admin/pending-approvals');
  };

  // Get selected role label
  const getSelectedRoleLabel = () => {
    const selectedRole = roleOptions.find(option => option.id === roleFilter);
    return selectedRole ? selectedRole.label : 'All Roles';
  };

  // 검색 실행 함수
  const handleSearch = () => {
    setSearchTerm(tempSearchTerm);
  };

  // 엔터 키 처리 함수
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
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
            <p>Loading user data...</p>
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
          <div className="admin-controls">
            <h1>Active Members</h1>
            
            <div className="admin-actions">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search by name or email"
                  value={tempSearchTerm}
                  onChange={(e) => setTempSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  ref={searchInputRef}
                />
              </div>
              
              <div className={`role-filter ${isDropdownOpen ? 'open' : ''}`} ref={dropdownRef}>
                <div className="selected-option" onClick={toggleDropdown}>
                  {getSelectedRoleLabel()}
                </div>
                
                {isDropdownOpen && (
                  <div className="custom-dropdown">
                    {roleOptions.map(option => (
                      <div
                        key={option.id}
                        className="custom-dropdown-item"
                        onClick={() => selectRole(option.id)}
                      >
                        {option.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <button 
                className="pending-approvals-btn"
                onClick={handlePendingApprovalClick}
              >
                Pending Approvals
              </button>
            </div>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="users-grid">
            {filteredUsers.map(user => (
              <UserCard 
                key={user.user_id}
                user={user}
                onRoleChange={handleRoleChange}
                onDelete={handleDeleteUser}
                onStatusChange={handleStatusChange}
              />
            ))}

            {filteredUsers.length === 0 && (
              <div className="no-results">
                <p>No users found matching your search.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Members; 