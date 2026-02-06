import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

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
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

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