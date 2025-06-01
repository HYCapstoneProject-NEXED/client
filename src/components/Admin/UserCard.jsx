import React, { useState, useRef } from 'react';
import { FaEllipsisV, FaUserEdit, FaTrash, FaUserShield, FaUser, FaUserTie, FaPencilAlt } from 'react-icons/fa';
import DefaultProfileIcon from '../../components/Customer/DefaultProfileIcon';
import './UserCard.css';

/**
 * User information card component
 * @param {Object} props - Component properties
 * @param {Object} props.user - User information object
 * @param {Function} props.onRoleChange - Role change handler
 * @param {Function} props.onDelete - User delete handler
 * @param {Function} props.onStatusChange - Active status change handler
 */
const UserCard = ({ user, onRoleChange, onDelete, onStatusChange }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRoleSelectOpen, setIsRoleSelectOpen] = useState(false);
  const menuRef = useRef(null);

  // Role list - All Roles 옵션 제거
  const roles = [
    { id: 'admin', label: 'Admin', icon: <FaUserShield className="role-icon" /> },
    { id: 'customer', label: 'Customer', icon: <FaUser className="role-icon" /> },
    { id: 'ml_engineer', label: 'ML Engineer', icon: <FaUserTie className="role-icon" /> },
    { id: 'annotator', label: 'Annotator', icon: <FaPencilAlt className="role-icon" /> }
  ];

  // 프로필 이미지가 없을 경우 DefaultProfileIcon을 표시합니다.
  const hasProfileImage = user.profile_image && user.profile_image.trim() !== '';

  // Display role name
  const getRoleDisplayName = (role) => {
    if (!role) return 'No Role';
    
    const roleObj = roles.find(r => r.id === role.toLowerCase());
    if (roleObj) return roleObj.label;
    
    // 이전 코드와의 호환성
    if (role === 'MLEng') return 'ML Engineer';
    
    return role;
  };

  // Toggle menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    setIsRoleSelectOpen(false);
  };

  // Toggle role selection
  const toggleRoleSelect = (e) => {
    e.stopPropagation();
    setIsRoleSelectOpen(!isRoleSelectOpen);
  };

  // Handle role change
  const handleRoleChange = (role) => {
    onRoleChange(user.user_id, role);
    setIsRoleSelectOpen(false);
    setIsMenuOpen(false);
  };

  // Handle user deletion
  const handleDelete = () => {
    onDelete(user.user_id);
    setIsMenuOpen(false);
  };

  // Detect outside click
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
        setIsRoleSelectOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Find the current role icon
  const getCurrentRoleIcon = () => {
    // 현재 사용자 역할 (대소문자 구분 없이 비교)
    const userType = user.user_type ? user.user_type.toLowerCase() : '';
    
    // role 객체들 중에서 현재 사용자의 역할과 일치하는 것을 찾음
    const currentRole = roles.find(role => role.id === userType);
    
    // 일치하는 역할이 있으면 해당 아이콘 반환, 없으면 기본 아이콘 반환
    return currentRole ? currentRole.icon : <FaUser className="role-icon" />;
  };

  return (
    <div className="user-card">
      <div className="user-card-image">
        {hasProfileImage ? (
          <img src={user.profile_image} alt={user.name || 'User'} />
        ) : (
          <div className="default-profile-container">
            <DefaultProfileIcon size={80} />
          </div>
        )}
      </div>
      <div className="user-card-content">
        <h3 className="user-name">{user.name || 'Unnamed'}</h3>
        <div className="user-role">
          {getCurrentRoleIcon()}
          {getRoleDisplayName(user.user_type)}
        </div>
        <div className="user-email">{user.google_email}</div>
      </div>
      <div className="user-card-menu" ref={menuRef}>
        <button className="menu-toggle" onClick={toggleMenu}>
          <FaEllipsisV />
        </button>
        
        {isMenuOpen && (
          <div className="menu-dropdown">
            <button className="menu-item" onClick={toggleRoleSelect}>
              <FaUserEdit className="menu-icon" />
              <span>Change Role</span>
            </button>
            <button className="menu-item delete" onClick={handleDelete}>
              <FaTrash className="menu-icon" />
              <span>Deactivate User</span>
            </button>
          </div>
        )}
        
        {isRoleSelectOpen && (
          <div className="role-dropdown">
            {roles.map(role => (
              <button
                key={role.id}
                className={`role-item ${user.user_type && user.user_type.toLowerCase() === role.id ? 'active' : ''}`}
                onClick={() => handleRoleChange(role.id)}
              >
                {role.icon}
                {role.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserCard; 