import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Payment } from '../types';
import { format, addMonths } from 'date-fns';

// Generate sample payments
const generateSamplePayments = (): Payment[] => {
  const now = new Date();
  const lastMonth = addMonths(now, -1);
  const nextMonth = addMonths(now, 1);
  
  return [
    {
      id: '1',
      tenantId: '2',
      roomId: 'room-1',
      amount: 750,
      dueDate: format(lastMonth, 'yyyy-MM-dd'),
      paidDate: format(lastMonth, 'yyyy-MM-dd'),
      status: 'paid',
      method: 'card',
    },
    {
      id: '2',
      tenantId: '2',
      roomId: 'room-1',
      amount: 750,
      dueDate: format(now, 'yyyy-MM-dd'),
      status: 'pending',
    },
    {
      id: '3',
      tenantId: '2',
      roomId: 'room-1',
      amount: 750,
      dueDate: format(nextMonth, 'yyyy-MM-dd'),
      status: 'pending',
    },
  ];
};

interface PaymentState {
  payments: Payment[];
  addPayment: (payment: Omit<Payment, 'id'>) => void;
  updatePayment: (id: string, updates: Partial<Payment>) => void;
  deletePayment: (id: string) => void;
  markAsPaid: (id: string, method: Payment['method']) => void;
  getPaymentsByTenantId: (tenantId: string) => Payment[];
  getPaymentsByStatus: (status: Payment['status']) => Payment[];
}

export const usePaymentStore = create<PaymentState>()(
  persist(
    (set, get) => ({
      payments: generateSamplePayments(),
      addPayment: (payment) => {
        const newPayment: Payment = {
          ...payment,
          id: `payment-${Date.now()}`,
        };
        
        set((state) => ({
          payments: [...state.payments, newPayment],
        }));
      },
      updatePayment: (id, updates) => {
        set((state) => ({
          payments: state.payments.map((payment) => 
            payment.id === id ? { ...payment, ...updates } : payment
          ),
        }));
      },
      deletePayment: (id) => {
        set((state) => ({
          payments: state.payments.filter((payment) => payment.id !== id),
        }));
      },
      markAsPaid: (id, method) => {
        set((state) => ({
          payments: state.payments.map((payment) => 
            payment.id === id 
              ? { 
                  ...payment, 
                  status: 'paid', 
                  paidDate: format(new Date(), 'yyyy-MM-dd'),
                  method
                } 
              : payment
          ),
        }));
      },
      getPaymentsByTenantId: (tenantId) => {
        return get().payments.filter((payment) => payment.tenantId === tenantId);
      },
      getPaymentsByStatus: (status) => {
        return get().payments.filter((payment) => payment.status === status);
      },
    }),
    {
      name: 'payment-storage',
    }
  )
);