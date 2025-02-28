import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  // localStorage에 token이 없으면 로그인 안 된 상태로 간주
  const token = localStorage.getItem('token');

  if (!token) {
    // 로그인 안 되었으므로, 메인 페이지(/)로 리다이렉트
    return <Navigate to="/" replace />;
  }

  // 로그인 된 상태면 자식 컴포넌트 렌더링
  return children;
}

export default ProtectedRoute;
