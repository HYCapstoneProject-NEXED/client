import React from 'react';
import './DashboardHeader.css';

/**
 * 어노테이터 대시보드 헤더 컴포넌트
 * 타이틀과 사용자 프로필 표시
 */
const DashboardHeader = ({ title = 'Annotator' }) => {
  return (
    <div className="main-header">
      <div className="header-title">{title}</div>
      <div className="user-profile"></div>
    </div>
  );
};

export default DashboardHeader; 