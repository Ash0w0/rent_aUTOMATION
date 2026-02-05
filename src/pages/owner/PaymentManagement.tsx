import React, { useState, useEffect } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types/supabase';
import { CreditCard, CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

type Payment = Database['public']['Tables']['payments']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];
type Room = Database['public']['Tables']['rooms']['Row'];

interface PaymentWithDetails extends Payment {
  tenant: Profile;
  room: Room;
}

const PaymentManagement: React.FC = () => {
  const [payments, setPayments] = useState<PaymentWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentWithDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          tenant:profiles!tenant_id(*),
          room:rooms(*)
        `)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      setPayments(data as PaymentWithDetails[] || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePaymentStatus = async (paymentId: string, status: Payment['verification_status']) => {
    try {
      const { error } = await supabase
        .from('payments')
        .update({ verification_status: status })
        .eq('id', paymentId);

      if (error) throw error;
      fetchPayments();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  };

  const getStatusIcon = (status: Payment['verification_status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-amber-500" />;
      case 'verified':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadgeColor = (status: Payment['verification_status']) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateTotalVerified = () => {
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
        <h1 className="text-2xl font-semibold text-gray-900">Payment Management</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-500 rounded-lg">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-blue-600">Total Verified Payments</p>
              <p className="text-2xl font-bold text-blue-900">
                ${calculateTotalVerified().toFixed(2)}
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
              <p className="text-sm text-green-600">Verification Rate</p>
              <p className="text-2xl font-bold text-green-900">
                {payments.length > 0
                  ? Math.round((payments.filter(p => p.verification_status === 'verified').length / payments.length) * 100)
                  : 0}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payments...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                      Room {payment.room.room_number} · {payment.tenant.full_name}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  getStatusBadgeColor(payment.verification_status)
                }`}>
                  {payment.verification_status}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                <span>
                  Payment Date: {format(new Date(payment.payment_date), 'PP')}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedPayment(payment);
                    setIsModalOpen(true);
                  }}
                >
                  Verify Payment
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPayment(null);
        }}
        title="Payment Verification"
      >
        {selectedPayment && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Payment Details
                </h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  getStatusBadgeColor(selectedPayment.verification_status)
                }`}>
                  {selectedPayment.verification_status}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Submitted by {selectedPayment.tenant.full_name}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Amount</h4>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  ${selectedPayment.amount.toFixed(2)}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900">Payment Date</h4>
                <p className="mt-1 text-gray-600">
                  {format(new Date(selectedPayment.payment_date), 'PPP')}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900">Room Details</h4>
              <div className="mt-1 text-sm text-gray-600">
                <p>Room Number: {selectedPayment.room.room_number}</p>
                <p>Floor: {selectedPayment.room.floor_number}</p>
                <p>Monthly Rent: ${selectedPayment.room.monthly_rent}</p>
              </div>
            </div>

            {selectedPayment.payment_screenshot_url && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Payment Screenshot</h4>
                <div className="relative">
                  <img
                    src={selectedPayment.payment_screenshot_url}
                    alt="Payment screenshot"
                    className="w-full rounded-lg shadow-sm"
                  />
                  <a
                    href={selectedPayment.payment_screenshot_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                  >
                    <ExternalLink className="w-4 h-4 text-gray-600" />
                  </a>
                </div>
              </div>
            )}

            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Verification Actions</h4>
              <div className="grid grid-cols-2 gap-3">
                {selectedPayment.verification_status !== 'verified' && (
                  <Button
                    variant="success"
                    onClick={() => updatePaymentStatus(selectedPayment.id, 'verified')}
                  >
                    Verify Payment
                  </Button>
                )}
                
                {selectedPayment.verification_status !== 'rejected' && (
                  <Button
                    variant="danger"
                    onClick={() => updatePaymentStatus(selectedPayment.id, 'rejected')}
                  >
                    Reject Payment
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PaymentManagement;