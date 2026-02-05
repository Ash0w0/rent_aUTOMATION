import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Login from './pages/Login';
import Layout from './components/layout/Layout';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import RoomManagement from './pages/owner/RoomManagement';
import TenantManagement from './pages/owner/TenantManagement';
import MaintenanceManagement from './pages/owner/MaintenanceManagement';
import PaymentManagement from './pages/owner/PaymentManagement';
import TenantDashboard from './pages/tenant/TenantDashboard';
import TenantVerification from './pages/tenant/TenantVerification';
import PaymentSubmission from './pages/tenant/PaymentSubmission';
import PaymentHistory from './pages/tenant/PaymentHistory';
import MaintenanceRequests from './pages/tenant/MaintenanceRequests';
import TenantProfile from './pages/tenant/TenantProfile';
import NotificationsPage from './pages/notifications/NotificationsPage';

function App() {
  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(
          () => {
            console.log('Service Worker registered successfully');
          },
          (error) => {
            console.error('Service Worker registration failed:', error);
          }
        );
      });
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />

        {/* Tenant verification route */}
        <Route path="/verify" element={<TenantVerification />} />

        {/* Main routes */}
        <Route path="/" element={<Layout />}>
          {/* Owner routes */}
          <Route path="owner" element={<OwnerDashboard />} />
          <Route path="owner/rooms" element={<RoomManagement />} />
          <Route path="owner/tenants" element={<TenantManagement />} />
          <Route path="owner/maintenance" element={<MaintenanceManagement />} />
          <Route path="owner/payments" element={<PaymentManagement />} />
          <Route path="owner/notifications" element={<NotificationsPage />} />
          <Route path="owner/settings" element={<div>Settings</div>} />

          {/* Tenant routes */}
          <Route path="tenant" element={<TenantDashboard />} />
          <Route path="tenant/profile" element={<TenantProfile />} />
          <Route path="tenant/payments" element={<PaymentHistory />} />
          <Route path="tenant/payments/new" element={<PaymentSubmission />} />
          <Route path="tenant/maintenance" element={<MaintenanceRequests />} />
          <Route path="tenant/notifications" element={<NotificationsPage />} />
          <Route path="tenant/settings" element={<div>Settings</div>} />
        </Route>

        {/* Default redirect to owner dashboard */}
        <Route path="*" element={<Navigate to="/owner" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;