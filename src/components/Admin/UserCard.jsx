import React, { useState, useRef } from 'react';
import { FaEllipsisV, FaUserEdit, FaTrash, FaUserShield, FaUser, FaUserTie, FaPencilAlt } from 'react-icons/fa';
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
    { id: 'Admin', label: 'Admin', icon: <FaUserShield className="role-icon" /> },
    { id: 'Customer', label: 'Customer', icon: <FaUser className="role-icon" /> },
    { id: 'MLEng', label: 'ML Engineer', icon: <FaUserTie className="role-icon" /> },
    { id: 'Annotator', label: 'Annotator', icon: <FaPencilAlt className="role-icon" /> }
  ];

  // Profile image
  const profileImg = user.profile_image || 'https://placehold.co/150x150?text=No+Image';

  // Display role name
  const getRoleDisplayName = (role) => {
    if (!role) return 'No Role';
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
    const currentRole = roles.find(role => role.id === user.user_type);
    return currentRole ? currentRole.icon : <FaUser className="role-icon" />;
  };

  return (
    <div className="user-card">
      <div className="user-card-image">
        <img src={profileImg} alt={user.name || 'User'} />
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
              <span>Delete User</span>
            </button>
          </div>
        )}
        
        {isRoleSelectOpen && (
          <div className="role-dropdown">
            {roles.map(role => (
              <button
                key={role.id}
                className={`role-item ${user.user_type === role.id ? 'active' : ''}`}
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