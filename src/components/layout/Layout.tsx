import React, { useState } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import Header from './Header';
import Sidebar from './Sidebar';
import { Loader2 } from 'lucide-react';

const getPageTitle = (pathname: string): string => {
  const paths = {
    '/owner': 'Owner Dashboard',
    '/owner/rooms': 'Room Management',
    '/owner/tenants': 'Tenant Management',
    '/owner/maintenance': 'Maintenance Requests',
    '/owner/payments': 'Payment Management',
    '/owner/notifications': 'Notifications',
    '/owner/settings': 'Settings',
    '/tenant': 'Tenant Dashboard',
    '/tenant/profile': 'My Profile',
    '/tenant/payments': 'My Payments',
    '/tenant/maintenance': 'Maintenance Requests',
    '/tenant/notifications': 'Notifications',
    '/tenant/settings': 'Settings',
  };
  
  return paths[pathname as keyof typeof paths] || 'Dashboard';
};

export const Layout: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  
  const toggleSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
      </div>
    );
  }
  
  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Redirect to correct dashboard based on user role
  const basePath = user?.role === 'owner' ? '/owner' : '/tenant';
  if (location.pathname === '/') {
    return <Navigate to={basePath} replace />;
  }
  
  // Check if user is accessing the correct section
  const accessingCorrectSection = 
    (user?.role === 'owner' && location.pathname.startsWith('/owner')) ||
    (user?.role === 'tenant' && location.pathname.startsWith('/tenant'));
  
  if (!accessingCorrectSection) {
    return <Navigate to={basePath} replace />;
  }
  
  const pageTitle = getPageTitle(location.pathname);
  
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        isMobileOpen={isMobileOpen} 
        setIsMobileOpen={setIsMobileOpen} 
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          toggleSidebar={toggleSidebar}
          title={pageTitle}
        />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;