import React, { useContext } from 'react';
import './DashboardHeader.css';
import { ProfileModalContext } from '../../../context/ProfileModalContext';
import { FaBell } from 'react-icons/fa';
import DefaultProfileIcon from '../../Customer/DefaultProfileIcon';
import { useLocation } from 'react-router-dom';

/**
 * 대시보드 헤더 컴포넌트
 * 사용자 프로필 표시
 */
const DashboardHeader = () => {
  const { setIsProfileOpen, isProfileOpen, profileImage } = useContext(ProfileModalContext);
  const location = useLocation();
  
  // 현재 URL에 따라 사용자 역할 결정
  const userRole = location.pathname.includes('/admin') ? 'Admin' : 'Annotator';

  const handleProfileClick = () => {
    console.log(`${userRole} 프로필 클릭됨`);
    console.log("모달 상태:", isProfileOpen);
    setIsProfileOpen(true);
  };

  return (
    <div className="main-header">
      <div className="header-right">
        <div className="annotator-user-role">{userRole}</div>
        <div className="user-info">
          <FaBell className="icon" />
          <div
            className="profile-icon-container"
            onClick={handleProfileClick}
            style={{ cursor: 'pointer' }}
          >
            {profileImage ? (
              <img 
                src={profileImage} 
                alt="프로필" 
                className="profile-img"
              />
            ) : (
              <DefaultProfileIcon size={32} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader; 