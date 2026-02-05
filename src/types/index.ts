export type UserRole = 'tenant' | 'owner';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profileImage?: string;
}

export interface Room {
  id: string;
  number: string;
  floor: number;
  isOccupied: boolean;
  currentTenant?: string;
  monthlyRent: number;
  size: number;
  amenities: string[];
}

export interface Tenant extends User {
  role: 'tenant';
  roomId: string;
  leaseStart: string;
  leaseEnd: string;
  rentDueDay: number;
  balance: number;
}

export interface Owner extends User {
  role: 'owner';
  properties: string[];
}

export interface MaintenanceRequest {
  id: string;
  tenantId: string;
  roomId: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'emergency';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  images?: string[];
}

export interface Payment {
  id: string;
  tenantId: string;
  amount: number;
  date: string;
  type: 'rent' | 'deposit' | 'fee' | 'other';
  status: 'pending' | 'completed' | 'failed';
  description?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  type: 'info' | 'warning' | 'success' | 'error';
}

export interface Document {
  id: string;
  title: string;
  description: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  type: 'lease' | 'rules' | 'notice' | 'other';
}