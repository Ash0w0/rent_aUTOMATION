import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { TenantOnboarding } from '../../components/tenant/TenantOnboarding';

const TenantVerification: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If user is already verified, redirect to dashboard
  if (user?.aadhaar_number) {
    return <Navigate to="/tenant" replace />;
  }

  return <TenantOnboarding />;
};

export default TenantVerification;