import React from 'react';
import { Routes, Route } from 'react-router-dom';

import ProtectedRoute from './ProtectedRoute';
import AnnotationEditPage from '../pages/AnnotatorPage/AnnotationEditPage';

const AnnotatorRoutes = () => (
  <Routes>
    {/* 어노테이션 편집 페이지 - 중첩 경로 사용 */}
    <Route
      path="annotation-edit"
      element={
        <ProtectedRoute allowedRoles={['annotator']}>
          <AnnotationEditPage />
        </ProtectedRoute>
      }
    />
    
    {/* 필요한 경우 더 많은 어노테이터 관련 경로를 여기에 추가 */}
    
  </Routes>
);

export default AnnotatorRoutes; 