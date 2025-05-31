import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Dashboard from '../pages/Customer/Dashboard';
import Defectdata from '../pages/Customer/Defectdata';
import Editclass from '../pages/Customer/Editclass';
import Statistics from '../pages/Customer/Statistics';

const CustomerRoutes = () => (
  <Routes>
    <Route
      path="dashboard"
      element={<Dashboard />}
    />
    <Route
      path="defectdata"
      element={<Defectdata />}
    />
    <Route
      path="editclass"
      element={<Editclass />}
    />
    <Route
      path="statistics"
      element={<Statistics />}
    />
    
  </Routes>
);

export default CustomerRoutes;
