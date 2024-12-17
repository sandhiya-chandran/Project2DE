// src\routes.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login/Login';
import SuperAdminDashboard from './components/SuperAdmin/Dashboard/SuperAdminDashboard';
import DealerDashboard from './components/Dealer/Dashboard/DealerDashboard';
import ManufacturerDashboard from './components/Manufacturer/Dashboard/ManufacturerDashboard';
import PrivateRoute from './components/Login/PrivateRoute';
const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/super_admin/*"
          element={
            <PrivateRoute allowedRoles={['super_admin']}>
              <SuperAdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/dealer/*"
          element={
            <PrivateRoute allowedRoles={['dealer_admin']}>
              <DealerDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/manufacturer/*"
          element={
            <PrivateRoute allowedRoles={['manufacturer_admin']}>
              <ManufacturerDashboard />
            </PrivateRoute>
          }
        />

      </Routes>
    </Router>
  );
};

export default AppRoutes;
