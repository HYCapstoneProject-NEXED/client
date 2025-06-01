import React from 'react';
import { Routes, Route } from 'react-router-dom';

import AnnotationEditPage from '../pages/AnnotatorPage/AnnotationEditPage';
import AnnotationDetailPage from '../pages/AnnotatorPage/AnnotationDetailPage';
import AnnotatorDashboard from '../pages/AnnotatorPage/AnnotatorDashboard';

const AnnotatorRoutes = () => (
  <Routes>
    {/* 어노테이터 대시보드 - 기본 경로 */}
    <Route
      path=""
      element={<AnnotatorDashboard />}
    />
    
    {/* 어노테이터 대시보드 - 명시적 경로 */}
    <Route
      path="dashboard"
      element={<AnnotatorDashboard />}
    />
    
    {/* 어노테이션 편집 페이지 */}
    <Route
      path="edit/:imageId"
      element={<AnnotationEditPage />}
    />
    
    {/* 어노테이션 상세 페이지 */}
    <Route
      path="detail/:imageId"
      element={<AnnotationDetailPage />}
    />
    
    {/* 기존 어노테이션 편집 페이지 - 호환성을 위해 유지 */}
    <Route
      path="annotation-edit"
      element={<AnnotationEditPage />}
    />
    
    {/* 필요한 경우 더 많은 어노테이터 관련 경로를 여기에 추가 */}
    
  </Routes>
);

export default AnnotatorRoutes; 