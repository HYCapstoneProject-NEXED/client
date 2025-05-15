// src/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles, children }) => {
  // 테스트용 가짜 유저
  const fakeUser = { role: 'admin' };

  // 권한 없으면 접근 불가
  if (!allowedRoles.includes(fakeUser.role)) {
    return <Navigate to="/unauthorized" />;
  }

  // 통과하면 자식 컴포넌트 렌더링
  return children;
};

export default ProtectedRoute;
