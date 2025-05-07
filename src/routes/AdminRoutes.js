import React from 'react';
import { Routes, Route } from 'react-router-dom';

import ProtectedRoute from './ProtectedRoute';
import Members from '../pages/AdminPage/AdminDashboard'; // Members로 리네임됨
import PendingApprovals from '../pages/AdminPage/PendingApprovals';
import History from '../pages/AdminPage/History';
import TaskAssignments from '../pages/AdminPage/TaskAssignments';

/**
 * 어드민 페이지 라우트 설정
 * 어드민 관련 페이지에 대한 라우트 정의
 */
const AdminRoutes = () => (
  <Routes>
    {/* 멤버 관리 페이지 (이전의 어드민 대시보드) */}
    <Route
      path="/"
      element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Members />
        </ProtectedRoute>
      }
    />
    
    {/* 대기 중인 승인 요청 페이지 */}
    <Route
      path="/pending-approvals"
      element={
        <ProtectedRoute allowedRoles={['admin']}>
          <PendingApprovals />
        </ProtectedRoute>
      }
    />
    
    {/* 히스토리 페이지 */}
    <Route
      path="/history"
      element={
        <ProtectedRoute allowedRoles={['admin']}>
          <History />
        </ProtectedRoute>
      }
    />
    
    {/* 작업 할당 페이지 */}
    <Route
      path="/tasks"
      element={
        <ProtectedRoute allowedRoles={['admin']}>
          <TaskAssignments />
        </ProtectedRoute>
      }
    />
    
  </Routes>
);

export default AdminRoutes; 