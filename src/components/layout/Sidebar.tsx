import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, Key, PenTool as Tool, CreditCard, Bell, LogOut, Settings, LayoutDashboard, User } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';

interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (isOpen: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isMobileOpen,
  setIsMobileOpen
}) => {
  const { user, logout } = useAuthStore();
  const { getUnreadCount } = useNotificationStore();

  const unreadCount = user ? getUnreadCount(user.id) : 0;

  const closeMobileMenu = () => {
    setIsMobileOpen(false);
  };

  const ownerLinks = [
    { to: '/owner', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { to: '/owner/rooms', label: 'Rooms', icon: <Key size={20} /> },
    { to: '/owner/tenants', label: 'Tenants', icon: <Users size={20} /> },
    { to: '/owner/maintenance', label: 'Maintenance', icon: <Tool size={20} /> },
    { to: '/owner/payments', label: 'Payments', icon: <CreditCard size={20} /> },
  ];

  const tenantLinks = [
    { to: '/tenant', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { to: '/tenant/profile', label: 'My Profile', icon: <User size={20} /> },
    { to: '/tenant/payments', label: 'Payments', icon: <CreditCard size={20} /> },
    { to: '/tenant/maintenance', label: 'Maintenance', icon: <Tool size={20} /> },
  ];

  const links = user?.role === 'owner' ? ownerLinks : tenantLinks;

  const handleLogout = () => {
    logout();
    closeMobileMenu();
  };
  
  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={closeMobileMenu}
        ></div>
      )}
      
      {/* Sidebar */}
      <div 
        className={`
          fixed top-0 bottom-0 left-0 z-50 w-64 bg-white shadow-xl 
          transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo and app name */}
          <div className="flex items-center justify-center h-16 px-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-blue-900">RentProp</h1>
          </div>
          
          {/* Navigation links */}
          <nav className="flex-1 px-4 py-4 overflow-y-auto">
            <ul className="space-y-1">
              {links.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    end={link.to === '/owner' || link.to === '/tenant'}
                    className={({ isActive }) => `
                      flex items-center px-4 py-2.5 text-sm font-medium rounded-md
                      transition-colors duration-200
                      ${isActive 
                        ? 'bg-blue-50 text-blue-900' 
                        : 'text-gray-700 hover:bg-gray-50'
                      }
                    `}
                    onClick={closeMobileMenu}
                  >
                    <span className="mr-3 text-gray-500">{link.icon}</span>
                    {link.label}
                  </NavLink>
                </li>
              ))}
              
              <li>
                <NavLink
                  to={user?.role === 'owner' ? '/owner/notifications' : '/tenant/notifications'}
                  className={({ isActive }) => `
                    flex items-center px-4 py-2.5 text-sm font-medium rounded-md
                    transition-colors duration-200
                    ${isActive 
                      ? 'bg-blue-50 text-blue-900' 
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                  onClick={closeMobileMenu}
                >
                  <span className="mr-3 text-gray-500 relative">
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </span>
                  Notifications
                </NavLink>
              </li>
            </ul>
            
            <div className="pt-4 mt-6 border-t border-gray-200">
              <ul className="space-y-1">
                <li>
                  <NavLink
                    to={user?.role === 'owner' ? '/owner/settings' : '/tenant/settings'}
                    className={({ isActive }) => `
                      flex items-center px-4 py-2.5 text-sm font-medium rounded-md
                      transition-colors duration-200
                      ${isActive 
                        ? 'bg-blue-50 text-blue-900' 
                        : 'text-gray-700 hover:bg-gray-50'
                      }
                    `}
                    onClick={closeMobileMenu}
                  >
                    <span className="mr-3 text-gray-500">
                      <Settings size={20} />
                    </span>
                    Settings
                  </NavLink>
                </li>
                
                <li>
                  <button
                    className="w-full flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200"
                    onClick={handleLogout}
                  >
                    <span className="mr-3 text-gray-500">
                      <LogOut size={20} />
                    </span>
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;