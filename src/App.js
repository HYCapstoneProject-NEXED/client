// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import ProtectedRoute from './routes/ProtectedRoute';
import CustomerRoutes from './routes/CustomerRoutes';
import LoginRoutes from './routes/LoginRoutes';
import AdminRoutes from './routes/AdminRoutes';

import AuthCallback from './pages/AuthCallback/AuthCallback';
import MainPage from './pages/MainPage/MainPage';

import ProfileModal from './components/Customer/ProfileModal'; // 컴포넌트
import { ProfileModalProvider } from './context/ProfileModalContext'; // context
import AnnotationEditPage from './pages/AnnotatorPage/AnnotationEditPage'; // 어노테이션 편집 페이지
import AnnotationDetailPage from './pages/AnnotatorPage/AnnotationDetailPage'; // 어노테이션 상세 페이지
import AnnotatorDashboard from './pages/AnnotatorPage/AnnotatorDashboard'; // 어노테이션 대시보드 페이지
import TestFilterPage from './pages/TestFilterPage'; // 필터 테스트 페이지

import './App.css';

function App() {
  return (
    <ProfileModalProvider>
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
        <Route path="/customer/*" element={<CustomerRoutes />} />

        {/* Admin 역할 전용 라우트 */}
        <Route path="/admin/*" element={<AdminRoutes />} />

        {/* Annotation 페이지 라우트 */}
        <Route path="/annotator" element={<AnnotatorDashboard />} />
        <Route path="/annotator/dashboard" element={<AnnotatorDashboard />} />
        <Route path="/annotator/edit/:imageId" element={<AnnotationEditPage />} />
        <Route path="/annotator/detail/:imageId" element={<AnnotationDetailPage />} />
        
        {/* 테스트 페이지 */}
        <Route path="/test/filter" element={<TestFilterPage />} />

        </Routes>
      </Router>
      <ProfileModal /> {/* 항상 전역에서 접근 가능하게 */}
    </ProfileModalProvider>
  );
}

export default App;