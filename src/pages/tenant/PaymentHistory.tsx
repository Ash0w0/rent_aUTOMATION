import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { CreditCard, CheckCircle, Clock, XCircle, ExternalLink, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { Database } from '../../types/supabase';

type Payment = Database['public']['Tables']['payments']['Row'];

const PaymentHistory: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchPayments();
    }
  }, [user?.id]);

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('tenant_id', user?.id)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: Payment['verification_status']) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-amber-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadgeColor = (status: Payment['verification_status']) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateTotalPaid = () => {
    return payments
      .filter(p => p.verification_status === 'verified')
      .reduce((sum, p) => sum + Number(p.amount), 0);
  };

  const calculatePendingAmount = () => {
    return payments
      .filter(p => p.verification_status === 'pending')
      .reduce((sum, p) => sum + Number(p.amount), 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Payment History</h1>
        <Button
          variant="primary"
          onClick={() => navigate('/tenant/payments/new')}
          leftIcon={<Plus className="w-5 h-5" />}
        >
          New Payment
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-500 rounded-lg">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-blue-600">Total Paid</p>
              <p className="text-2xl font-bold text-blue-900">
                ${calculateTotalPaid().toFixed(2)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-amber-500 rounded-lg">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-amber-600">Pending Verification</p>
              <p className="text-2xl font-bold text-amber-900">
                ${calculatePendingAmount().toFixed(2)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-500 rounded-lg">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-green-600">Last Payment</p>
              <p className="text-2xl font-bold text-green-900">
                {payments.find(p => p.verification_status === 'verified')
                  ? format(new Date(payments.find(p => p.verification_status === 'verified')!.payment_date), 'MMM d, yyyy')
                  : 'No payments'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment history...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <Card 
              key={payment.id} 
              className={`transform transition-all hover:shadow-lg ${
                payment.verification_status === 'pending' ? 'border-l-4 border-amber-500' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${
                    getStatusBadgeColor(payment.verification_status).split(' ')[0]
                  }`}>
                    {getStatusIcon(payment.verification_status)}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      ${payment.amount.toFixed(2)}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Payment Date: {format(new Date(payment.payment_date), 'PPP')}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  getStatusBadgeColor(payment.verification_status)
                }`}>
                  {payment.verification_status}
                </span>
              </div>

              {payment.payment_screenshot_url && (
                <div className="mt-4">
                  <a
                    href={payment.payment_screenshot_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
                  >
                    View Payment Proof
                    <ExternalLink className="ml-1 h-4 w-4" />
                  </a>
                </div>
              )}
            </Card>
          ))}

          {payments.length === 0 && (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No payments yet</h3>
              <p className="mt-2 text-gray-500">Make your first payment to get started.</p>
              <Button
                variant="primary"
                className="mt-4"
                onClick={() => navigate('/tenant/payments/new')}
              >
                Make Payment
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;