import React from 'react';
import { Menu, Bell } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  toggleSidebar: () => void;
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ toggleSidebar, title }) => {
  const { user } = useAuthStore();
  const { getUnreadCount } = useNotificationStore();
  const navigate = useNavigate();

  const unreadCount = user ? getUnreadCount(user.id) : 0;
  const notificationsPath = user?.role === 'owner' ? '/owner/notifications' : '/tenant/notifications';
  const userName = user?.full_name || 'User';
  const userRole = user?.role || 'user';
  
  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <button
            type="button"
            className="p-2 text-gray-500 rounded-md lg:hidden"
            onClick={toggleSidebar}
          >
            <Menu size={24} />
          </button>
          
          <h1 className="ml-4 text-xl font-semibold text-gray-900">
            {title}
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            type="button"
            className="relative p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
            onClick={() => navigate(notificationsPath)}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 block w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          
          <div className="flex items-center space-x-2">
            <div className="relative">
              <img
                className="h-8 w-8 rounded-full object-cover"
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random`}
                alt="User profile"
              />
            </div>

            <div className="hidden md:block">
              <div className="text-sm font-medium text-gray-900">
                {userName}
              </div>
              <div className="text-xs text-gray-500 capitalize">
                {userRole}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;