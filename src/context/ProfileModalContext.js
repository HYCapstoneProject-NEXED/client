// src/context/ProfileModalContext.js
import { createContext, useState } from 'react';

export const ProfileModalContext = createContext();

export const ProfileModalProvider = ({ children }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  return (
    <ProfileModalContext.Provider value={{ 
      isProfileOpen, 
      setIsProfileOpen,
      profileImage,
      setProfileImage
    }}>
      {children}
    </ProfileModalContext.Provider>
  );
};
