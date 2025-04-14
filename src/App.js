// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


import ProtectedRoute from './routes/ProtectedRoute';
import CustomerRoutes from './routes/CustomerRoutes';
import LoginRoutes from './routes/LoginRoutes';

import AuthCallback from './pages/AuthCallback/AuthCallback';
import MainPage from './pages/MainPage/MainPage';

import ProfileModal from './components/Customer/ProfileModal'; // 컴포넌트
import { ProfileModalProvider } from './context/ProfileModalContext'; // context
import AnnotationEditPage from './pages/AnnotatorPage/AnnotationEditPage'; // 어노테이션 편집 페이지


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

        {/* Annotation Edit Page */}
        <Route path="/edit-annotation" element={<AnnotationEditPage />} />

        </Routes>
      </Router>
      <ProfileModal /> {/* 항상 전역에서 접근 가능하게 */}
    </ProfileModalProvider>
  );
}

export default App;
