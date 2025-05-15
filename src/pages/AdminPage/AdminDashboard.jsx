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
  const [roleFilter, setRoleFilter] = useState('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Use history control to manage back navigation
  useHistoryControl();

  // Role options
  const roleOptions = [
    { id: 'all', label: 'All Roles' },
    { id: 'admin', label: 'Admin' },
    { id: 'customer', label: 'Customer' },
    { id: 'mleng', label: 'ML Engineer' },
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
  
  // Load user list
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        // Use dummy data during development
        const users = UserService.getDummyUsers();
        setUsers(users);
        
        // Uncomment for API integration
        // const response = await UserService.getAllUsers();
        // setUsers(response);
        
        setError(null);
      } catch (err) {
        console.error('Failed to fetch users:', err);
        setError('Failed to load user list.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter users based on search and role filter
  const filteredUsers = users.filter((user) => {
    // Search term filtering
    const matchesSearch = 
      (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      user.google_email.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Role filtering
    const matchesRole = 
      roleFilter === 'all' || 
      (user.user_type && user.user_type.toLowerCase() === roleFilter.toLowerCase());
    
    return matchesSearch && matchesRole;
  });

  // Handle role change
  const handleRoleChange = async (userId, newRole) => {
    try {
      // Update dummy data during development
      setUsers(users.map(user => 
        user.user_id === userId ? { ...user, user_type: newRole } : user
      ));
      
      // Uncomment for API integration
      // await UserService.updateUserRole(userId, newRole);
    } catch (err) {
      console.error('Failed to update user role:', err);
      setError('Failed to update user role.');
    }
  };

  // Handle status change
  const handleStatusChange = async (userId, isActive) => {
    try {
      // Update dummy data during development
      setUsers(users.map(user => 
        user.user_id === userId ? { ...user, is_active: isActive } : user
      ));
      
      // Uncomment for API integration
      // await UserService.updateUserActiveStatus(userId, isActive);
    } catch (err) {
      console.error('Failed to update user status:', err);
      setError('Failed to update user status.');
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        // Update dummy data during development
        setUsers(users.filter(user => user.user_id !== userId));
        
        // Uncomment for API integration
        // await UserService.deleteUser(userId);
      } catch (err) {
        console.error('Failed to delete user:', err);
        setError('Failed to delete user.');
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

  // Loading state
  if (isLoading) {
    return (
      <div className="admin-dashboard-page">
        <AdminSidebar activeMenu="members" />
        
        <div className="main-content">
          <DashboardHeader title="Admin" />
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
        <DashboardHeader title="Admin" />
        
        <div className="dashboard-content">
          <div className="admin-controls">
            <h1>Active Members</h1>
            
            <div className="admin-actions">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search by name or email"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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