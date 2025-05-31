// src/ProtectedRoute.js
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles, children }) => {
  // 테스트용 가짜 유저 - 어드민 역할만 부여
  const fakeUser = { roles: ['admin'] };

  // localStorage에서 사용자 정보 확인
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  
  // 실제 사용자가 있으면 해당 역할 사용, 없으면 테스트용 역할 사용
  const roles = user ? [user.role] : fakeUser.roles;

  // 권한 체크
  const hasRequiredRole = roles.some(role => allowedRoles.includes(role));
  
  // 권한 없으면 접근 불가
  if (!hasRequiredRole) {
    return <Navigate to="/unauthorized" />;
  }

  // 통과하면 자식 컴포넌트 렌더링
  return children;
};

export default ProtectedRoute;
