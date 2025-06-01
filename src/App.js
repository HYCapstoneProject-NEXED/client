// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import ProtectedRoute from './routes/ProtectedRoute';
import CustomerRoutes from './routes/CustomerRoutes';
import LoginRoutes from './routes/LoginRoutes';
import AdminRoutes from './routes/AdminRoutes';
import AnnotatorRoutes from './routes/AnnotatorRoutes';

import AuthCallback from './pages/AuthCallback/AuthCallback';
import MainPage from './pages/MainPage/MainPage';

import ProfileModal from './components/Customer/ProfileModal'; // 컴포넌트
import { ProfileModalProvider } from './context/ProfileModalContext'; // context
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
        <Route path="/naverCallback" element={<AuthCallback />} />

        {/* 구글 콜백 URL */}
        <Route path="/googleCallback" element={<AuthCallback />} />

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

        {/* Annotator 역할 전용 라우트 */}
        <Route path="/annotator/*" element={<AnnotatorRoutes />} />
        
        {/* 테스트 페이지 */}
        <Route path="/test/filter" element={<TestFilterPage />} />

        </Routes>
      </Router>
      <ProfileModal /> {/* 항상 전역에서 접근 가능하게 */}
    </ProfileModalProvider>
  );
}

export default App;