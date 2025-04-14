import React from 'react';
import { FaBell } from 'react-icons/fa';
import './Header.css';
import { useContext } from 'react';
import { ProfileModalContext } from '../context/ProfileModalContext';



const Header = () => {
  const { setIsProfileOpen } = useContext(ProfileModalContext);
  const { isProfileOpen } = useContext(ProfileModalContext);
  return (
    <div className="top-header">
      <div className="header-right">
        <div className="user-role">Customer</div>
        <div className="user-info">
          <FaBell className="icon" />
          <img
            src="/default-profile.jpg"
            alt="profile"
            className="profile-img"
            onClick={() => {
              console.log("프로필 클릭됨");
              console.log("모달 상태:", isProfileOpen); 
              setIsProfileOpen(true);
            }}// ✅ 클릭 시 모달 열기
            style={{ cursor: 'pointer' }} // UX 향상: 커서 변경
          />
        </div>
      </div>
    </div>
  );
};

export default Header;
