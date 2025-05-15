import React from 'react';
import { FaBell } from 'react-icons/fa';
import './Header.css';
import { useContext } from 'react';
import { ProfileModalContext } from '../../context/ProfileModalContext';
import DefaultProfileIcon from './DefaultProfileIcon';

const Header = () => {
  const { setIsProfileOpen, isProfileOpen, profileImage } = useContext(ProfileModalContext);
  
  return (
    <div className="top-header">
      <div className="header-right">
        <div className="customer-user-role">Customer</div>
        <div className="user-info">
          <FaBell className="icon" />
          <div
            className="profile-icon-container"
            onClick={() => {
              console.log("프로필 클릭됨");
              console.log("모달 상태:", isProfileOpen); 
              setIsProfileOpen(true);
            }}
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

export default Header;
