import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Notification } from '../types';

// Generate sample notifications
const generateSampleNotifications = (): Notification[] => {
  return [
    {
      id: '1',
      userId: '2', // tenant
      title: 'Rent due reminder',
      message: 'Your monthly rent is due in 3 days.',
      read: false,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      type: 'warning',
      link: '/tenant/payments',
    },
    {
      id: '2',
      userId: '1', // owner
      title: 'New maintenance request',
      message: 'A tenant has submitted a new maintenance request.',
      read: true,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      type: 'info',
      link: '/owner/maintenance',
    },
    {
      id: '3',
      userId: '2', // tenant
      title: 'Maintenance update',
      message: 'Your maintenance request has been scheduled for tomorrow.',
      read: false,
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      type: 'success',
      link: '/tenant/maintenance',
    },
  ];
};

interface NotificationState {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: (userId: string) => void;
  deleteNotification: (id: string) => void;
  getNotificationsByUserId: (userId: string) => Notification[];
  getUnreadCount: (userId: string) => number;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: generateSampleNotifications(),
      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: `notification-${Date.now()}`,
          createdAt: new Date().toISOString(),
          read: false,
        };
        
        set((state) => ({
          notifications: [...state.notifications, newNotification],
        }));
      },
      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((notification) => 
            notification.id === id ? { ...notification, read: true } : notification
          ),
        }));
      },
      markAllAsRead: (userId) => {
        set((state) => ({
          notifications: state.notifications.map((notification) => 
            notification.userId === userId ? { ...notification, read: true } : notification
          ),
        }));
      },
      deleteNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter((notification) => notification.id !== id),
        }));
      },
      getNotificationsByUserId: (userId) => {
        return get().notifications.filter((notification) => notification.userId === userId);
      },
      getUnreadCount: (userId) => {
        return get().notifications.filter(
          (notification) => notification.userId === userId && !notification.read
        ).length;
      },
    }),
    {
      name: 'notification-storage',
    }
  )
);