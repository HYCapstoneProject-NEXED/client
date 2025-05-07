import React, { useContext } from 'react';
import './DashboardHeader.css';
import { ProfileModalContext } from '../../../context/ProfileModalContext';

/**
 * 어노테이터 대시보드 헤더 컴포넌트
 * 타이틀과 사용자 프로필 표시
 */
const DashboardHeader = ({ title = 'Annotator' }) => {
  const { setIsProfileOpen } = useContext(ProfileModalContext);

  const handleProfileClick = () => {
    setIsProfileOpen(true);
  };

  return (
    <div className="main-header">
      <div className="header-title">{title}</div>
      <div 
        className="user-profile" 
        onClick={handleProfileClick}
        style={{ cursor: 'pointer' }}
      ></div>
    </div>
  );
};

export default DashboardHeader; 