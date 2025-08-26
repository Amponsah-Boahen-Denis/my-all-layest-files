'use client';

import React from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminDashboard from './page';

const ProtectedAdminDashboard = () => {
  return (
    <ProtectedRoute requiredRoles={['admin']}>
      <AdminDashboard />
    </ProtectedRoute>
  );
};

export default ProtectedAdminDashboard;
