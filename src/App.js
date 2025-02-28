// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage/LoginPage';
import AuthCallback from './pages/AuthCallback/AuthCallback';
import MainPage from './pages/MainPage/MainPage';
import ProtectedRoute from './ProtectedRoute';
import './App.css';


function App() {
  return (
    <Router>
      <Routes>
        {/* 1) 메인(로그인) 페이지 */}
        <Route path="/" element={<LoginPage />} />

        {/* 2) 소셜 로그인 후, 돌아오는 콜백 페이지 */}
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* 3) 로그인 후 접근 가능한 홈 페이지 (보호 라우트) */}
        <Route
          path="/Pages/MainPage/MainPage"
          element={
            <ProtectedRoute>
              <MainPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;