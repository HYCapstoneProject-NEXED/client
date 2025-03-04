// src/App.js
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
        {/* 로그인 페이지 */}
        <Route path="/" element={<LoginPage />} />

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
      </Routes>
    </Router>
  );
}

export default App;
