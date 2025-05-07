// src/context/ProfileModalContext.js
import { createContext, useState } from 'react';

export const ProfileModalContext = createContext();

export const ProfileModalProvider = ({ children }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <ProfileModalContext.Provider value={{ isProfileOpen, setIsProfileOpen }}>
      {children}
    </ProfileModalContext.Provider>
  );
};
