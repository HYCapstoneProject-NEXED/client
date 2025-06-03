import React, { useState, useRef } from 'react';
import { FaEllipsisV, FaUserEdit, FaTrash, FaUserShield, FaUser, FaUserTie, FaPencilAlt } from 'react-icons/fa';
import DefaultProfileIcon from '../../components/Customer/DefaultProfileIcon';
import './UserCard.css';

// 하드코딩된 프로필 사진 배열
const PROFILE_IMAGES = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1494790108755-2616b332c87c?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507101105822-7472b28e22ac?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1528892952291-009c663ce843?w=150&h=150&fit=crop&crop=face'
];

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

  // 하드코딩된 프로필 이미지 가져오기 함수
  const getProfileImage = () => {
    // 기존 프로필 이미지가 있으면 사용
    if (user.profile_image && user.profile_image.trim() !== '') {
      return user.profile_image;
    }
    
    // 사용자 ID를 기반으로 프로필 이미지 선택 (순환)
    const imageIndex = (user.user_id || 0) % PROFILE_IMAGES.length;
    return PROFILE_IMAGES[imageIndex];
  };

  // 항상 프로필 이미지를 표시 (하드코딩된 이미지 포함)
  const profileImageUrl = getProfileImage();

  // 이미지 로딩 에러 처리
  const handleImageError = (e) => {
    // 에러 발생 시 DefaultProfileIcon으로 대체
    e.target.style.display = 'none';
    e.target.nextSibling.style.display = 'flex';
  };

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
        <img 
          src={profileImageUrl} 
          alt={user.name || 'User'} 
          onError={handleImageError}
          style={{ display: 'block' }}
        />
        <div 
          className="default-profile-container"
          style={{ display: 'none' }}
        >
          <DefaultProfileIcon size={80} />
        </div>
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