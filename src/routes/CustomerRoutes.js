import React from 'react';
import { Routes, Route } from 'react-router-dom';

import ProtectedRoute from './ProtectedRoute';

import Dashboard from '../pages/Customer/Dashboard';
import Defectdata from '../pages/Customer/Defectdata';
import Editclass from '../pages/Customer/Editclass';
import Statistics from '../pages/Customer/Statistics';

const CustomerRoutes = () => (
  <Routes>
    <Route
      path="/customer-dashboard"
      element={
        <ProtectedRoute allowedRoles={['customer']}>
          <Dashboard />
        </ProtectedRoute>
      }
    />
    <Route
      path="/customer-defectdata"
      element={
        <ProtectedRoute allowedRoles={['customer']}>
          <Defectdata />
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
    
  </Routes>
);

export default CustomerRoutes;
