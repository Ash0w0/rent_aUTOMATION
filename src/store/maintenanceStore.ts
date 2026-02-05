import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MaintenanceRequest } from '../types';

// Generate sample maintenance requests
const generateSampleRequests = (): MaintenanceRequest[] => {
  return [
    {
      id: '1',
      tenantId: '2',
      roomId: 'room-1',
      title: 'Leaking faucet',
      description: 'The bathroom sink faucet is leaking continuously.',
      status: 'pending',
      priority: 'medium',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      tenantId: '2',
      roomId: 'room-1',
      title: 'Broken AC',
      description: 'Air conditioner is not cooling properly.',
      status: 'in-progress',
      priority: 'high',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
};

interface MaintenanceState {
  requests: MaintenanceRequest[];
  addRequest: (request: Omit<MaintenanceRequest, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateRequest: (id: string, updates: Partial<MaintenanceRequest>) => void;
  deleteRequest: (id: string) => void;
  getRequestsByTenantId: (tenantId: string) => MaintenanceRequest[];
  getRequestsByStatus: (status: MaintenanceRequest['status']) => MaintenanceRequest[];
}

export const useMaintenanceStore = create<MaintenanceState>()(
  persist(
    (set, get) => ({
      requests: generateSampleRequests(),
      addRequest: (request) => {
        const now = new Date().toISOString();
        const newRequest: MaintenanceRequest = {
          ...request,
          id: `request-${Date.now()}`,
          createdAt: now,
          updatedAt: now,
        };
        
        set((state) => ({
          requests: [...state.requests, newRequest],
        }));
      },
      updateRequest: (id, updates) => {
        set((state) => ({
          requests: state.requests.map((request) => 
            request.id === id 
              ? { ...request, ...updates, updatedAt: new Date().toISOString() } 
              : request
          ),
        }));
      },
      deleteRequest: (id) => {
        set((state) => ({
          requests: state.requests.filter((request) => request.id !== id),
        }));
      },
      getRequestsByTenantId: (tenantId) => {
        return get().requests.filter((request) => request.tenantId === tenantId);
      },
      getRequestsByStatus: (status) => {
        return get().requests.filter((request) => request.status === status);
      },
    }),
    {
      name: 'maintenance-storage',
    }
  )
);