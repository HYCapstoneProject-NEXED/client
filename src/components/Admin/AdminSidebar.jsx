import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaHistory, FaTasks, FaSignOutAlt } from 'react-icons/fa';
import '../Annotator/Sidebar/DashboardSidebar.css'; // 재사용

/**
 * 어드민 사이드바 컴포넌트
 * Members, History, Task Assignments, Logout 네비게이션 메뉴 제공
 */
const AdminSidebar = ({ activeMenu = 'members' }) => {
  const navigate = useNavigate();

  const handleMenuClick = (menuType) => {
    switch (menuType) {
      case 'members':
        navigate('/admin');
        break;
      case 'history':
        navigate('/admin/history');
        break;
      case 'tasks':
        navigate('/admin/tasks');
        break;
      case 'logout':
        // 실제 로그아웃 로직 구현 필요
        console.log('Logging out...');
        navigate('/');
        break;
      default:
        navigate('/admin');
    }
  };

  return (
    <div className="left-sidebar">
      <div className="logo">Defectect.</div>
      <div className="sidebar-menu">
        <div
          className={`menu-item ${activeMenu === 'members' ? 'active' : ''}`}
          onClick={() => handleMenuClick('members')}
        >
          <div className="menu-content">
            <FaUsers className="menu-icon" size={18} />
            <span className="menu-text">Members</span>
          </div>
        </div>
        <div
          className={`menu-item ${activeMenu === 'history' ? 'active' : ''}`}
          onClick={() => handleMenuClick('history')}
        >
          <div className="menu-content">
            <FaHistory className="menu-icon" size={18} />
            <span className="menu-text">History</span>
          </div>
        </div>
        <div
          className={`menu-item ${activeMenu === 'tasks' ? 'active' : ''}`}
          onClick={() => handleMenuClick('tasks')}
        >
          <div className="menu-content">
            <FaTasks className="menu-icon" size={18} />
            <span className="menu-text">Task Assignments</span>
          </div>
        </div>
        <div
          className="menu-item logout"
          onClick={() => handleMenuClick('logout')}
        >
          <FaSignOutAlt className="menu-icon" size={18} />
          <span className="menu-text">Logout</span>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar; 