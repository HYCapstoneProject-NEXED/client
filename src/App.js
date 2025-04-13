// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


import ProtectedRoute from './routes/ProtectedRoute';
import CustomerRoutes from './routes/CustomerRoutes';
import LoginRoutes from './routes/LoginRoutes';

import AuthCallback from './pages/AuthCallback/AuthCallback';
import MainPage from './pages/MainPage/MainPage';
import AnnotationEditPage from './pages/AnnotatorPage/AnnotationEditPage';

import './App.css';

import CustomerDashboard from './pages/Customer/Dashboard';
import CustomerData from './pages/Customer/Defectdata';
import Editclass from './pages/Customer/Editclass';
import Statistics from './pages/Customer/Statistics';

function App() {
  return (
    <Router>
      <Routes>
        {/* 로그인 관련 */}
        <Route path="/*" element={<LoginRoutes />} />

        {/* 네이버 콜백 URL */}
        <Route path="/naverLogin" element={<AuthCallback />} />

        {/* 구글 콜백 URL */}
        <Route path="/googleLogin" element={<AuthCallback />} />

        {/* 보호된 메인 페이지 */}
        <Route
          path="/main"
          element={
            <ProtectedRoute>
              <MainPage />
            </ProtectedRoute>
          }
        />

        {/* Customer 역할 전용 라우트 */}
        <Route path="/*" element={<CustomerRoutes />} />

        <Route
          path="/customer-dashboard"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer-defectdata"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <CustomerData />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer-editclass"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <Editclass />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer-statistics"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <Statistics />
            </ProtectedRoute>
          }
        />
        {/* 어노테이션 편집 페이지 직접 접근 - 테스트용 */}
        <Route path="/edit-annotation" element={<AnnotationEditPage />} />

      </Routes>
    </Router>
  );
}

export default App;
