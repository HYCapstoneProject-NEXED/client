import React from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardSidebar.css';

/**
 * 어노테이터 대시보드 사이드바 컴포넌트
 * 대시보드, 히스토리, 로그아웃 등의 네비게이션 메뉴 제공
 */
const DashboardSidebar = ({ activeMenu = 'dashboard' }) => {
  const navigate = useNavigate();

  const handleMenuClick = (menuType) => {
    switch (menuType) {
      case 'dashboard':
        navigate('/annotator/dashboard');
        break;
      case 'history':
        navigate('/annotator/history');
        break;
      case 'logout':
        // 실제 로그아웃 로직 구현 필요
        console.log('Logging out...');
        navigate('/');
        break;
      default:
        navigate('/annotator/dashboard');
    }
  };

  return (
    <div className="left-sidebar">
      <div className="logo">Defectect.</div>
      <div className="sidebar-menu">
        <div
          className={`menu-item ${activeMenu === 'dashboard' ? 'active' : ''}`}
          onClick={() => handleMenuClick('dashboard')}
        >
          <div className="menu-icon dashboard-icon"></div>
          <span className="menu-text">Dashboard</span>
        </div>
        <div
          className={`menu-item ${activeMenu === 'history' ? 'active' : ''}`}
          onClick={() => handleMenuClick('history')}
        >
          <div className="menu-icon history-icon"></div>
          <span className="menu-text">History</span>
        </div>
        <div
          className="menu-item logout"
          onClick={() => handleMenuClick('logout')}
        >
          <div className="menu-icon logout-icon"></div>
          <span className="menu-text">Logout</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardSidebar; 