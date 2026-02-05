import React, { useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useRoomStore } from '../../store/roomStore';
import { usePaymentStore } from '../../store/paymentStore';
import { useMaintenanceStore } from '../../store/maintenanceStore';
import Card from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Home, PenTool as Tool, CreditCard, Calendar, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';

const TenantDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { rooms, getRoomByTenantId } = useRoomStore();
  const { payments, getPaymentsByTenantId } = usePaymentStore();
  const { requests, getRequestsByTenantId } = useMaintenanceStore();
  const navigate = useNavigate();
  
  // Set page title
  useEffect(() => {
    document.title = 'Tenant Dashboard - Rental Property Management';
  }, []);
  
  // Find tenant's room
  const tenantRoom = user?.id ? getRoomByTenantId(user.id) : undefined;
  
  // Get tenant's payments
  const tenantPayments = user?.id ? getPaymentsByTenantId(user.id) : [];
  const upcomingPayment = tenantPayments.find(p => p.status === 'pending');
  const isPaymentDueSoon = upcomingPayment && 
    new Date(upcomingPayment.dueDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  
  // Get tenant's maintenance requests
  const tenantRequests = user?.id ? getRequestsByTenantId(user.id) : [];
  const activeRequests = tenantRequests.filter(r => 
    r.status === 'pending' || r.status === 'in-progress'
  );
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Room information */}
        <Card
          title="Your Room"
          className="md:col-span-2 transform transition-all hover:shadow-lg"
        >
          {tenantRoom ? (
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-full mr-4">
                  <Home className="h-6 w-6 text-blue-700" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Room #{tenantRoom.number}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {tenantRoom.area} sq ft · {tenantRoom.amenities.join(', ')}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-500">Monthly Rent</p>
                  <p className="text-lg font-medium text-gray-900">
                    ${tenantRoom.rent.toFixed(2)}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="text-lg font-medium text-gray-900 capitalize">
                    {tenantRoom.status}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">No room assigned yet.</p>
            </div>
          )}
        </Card>
        
        {/* Next payment */}
        <Card
          title="Next Payment"
          className={`transform transition-all hover:shadow-lg ${
            isPaymentDueSoon ? 'border-l-4 border-amber-500' : ''
          }`}
        >
          {upcomingPayment ? (
            <div className="space-y-4">
              <div className="flex items-center">
                <div className={`p-3 rounded-full mr-4 ${
                  isPaymentDueSoon ? 'bg-amber-100' : 'bg-blue-100'
                }`}>
                  <CreditCard className={`h-6 w-6 ${
                    isPaymentDueSoon ? 'text-amber-700' : 'text-blue-700'
                  }`} />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    ${upcomingPayment.amount.toFixed(2)}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Due: {format(parseISO(upcomingPayment.dueDate), 'PPP')}
                  </p>
                </div>
              </div>
              
              {isPaymentDueSoon && (
                <div className="flex items-center text-amber-700 bg-amber-50 p-2 rounded-md text-sm">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  <span>Payment due soon</span>
                </div>
              )}
              
              <Button
                variant="primary"
                fullWidth
                onClick={() => navigate('/tenant/payments')}
              >
                View Payment Details
              </Button>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">No upcoming payments.</p>
            </div>
          )}
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Maintenance requests */}
        <Card
          title="Maintenance Requests"
          className="transform transition-all hover:shadow-lg"
        >
          {activeRequests.length > 0 ? (
            <div className="space-y-4">
              <ul className="divide-y divide-gray-100">
                {activeRequests.slice(0, 3).map((request) => (
                  <li key={request.id} className="py-3 flex items-start">
                    <div className={`p-2 rounded-full mr-3 flex-shrink-0 ${
                      request.status === 'pending' 
                        ? 'bg-amber-100' 
                        : 'bg-blue-100'
                    }`}>
                      {request.status === 'pending' ? (
                        <Clock className="h-5 w-5 text-amber-700" />
                      ) : (
                        <Tool className="h-5 w-5 text-blue-700" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {request.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Status: <span className="capitalize">{request.status}</span> · 
                        Priority: <span className="capitalize">{request.priority}</span>
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              
              <Button
                variant="outline"
                fullWidth
                onClick={() => navigate('/tenant/maintenance')}
              >
                View All Requests
              </Button>
            </div>
          ) : (
            <div className="text-center py-6">
              <Tool className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 mb-4">No active maintenance requests.</p>
              <Button
                variant="primary"
                onClick={() => navigate('/tenant/maintenance')}
              >
                Request Maintenance
              </Button>
            </div>
          )}
        </Card>
        
        {/* Recent activity */}
        <Card
          title="Recent Activity"
          className="transform transition-all hover:shadow-lg"
        >
          <div className="space-y-4">
            <ul className="divide-y divide-gray-100">
              {tenantPayments.slice(0, 2).map((payment) => (
                <li key={payment.id} className="py-3 flex items-start">
                  <div className={`p-2 rounded-full mr-3 flex-shrink-0 ${
                    payment.status === 'paid' 
                      ? 'bg-green-100' 
                      : payment.status === 'overdue'
                      ? 'bg-red-100'
                      : 'bg-gray-100'
                  }`}>
                    {payment.status === 'paid' ? (
                      <CheckCircle className="h-5 w-5 text-green-700" />
                    ) : payment.status === 'overdue' ? (
                      <AlertTriangle className="h-5 w-5 text-red-700" />
                    ) : (
                      <Calendar className="h-5 w-5 text-gray-700" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      Rent Payment - ${payment.amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {payment.status === 'paid' 
                        ? `Paid on ${format(parseISO(payment.paidDate!), 'PP')}` 
                        : `Due on ${format(parseISO(payment.dueDate), 'PP')}`}
                    </p>
                  </div>
                </li>
              ))}
              
              {tenantRequests.slice(0, 2).map((request) => (
                <li key={request.id} className="py-3 flex items-start">
                  <div className={`p-2 rounded-full mr-3 flex-shrink-0 ${
                    request.status === 'completed' 
                      ? 'bg-green-100' 
                      : request.status === 'declined'
                      ? 'bg-red-100'
                      : 'bg-blue-100'
                  }`}>
                    <Tool className={`h-5 w-5 ${
                      request.status === 'completed' 
                        ? 'text-green-700' 
                        : request.status === 'declined'
                        ? 'text-red-700'
                        : 'text-blue-700'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {request.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Status changed to <span className="capitalize">{request.status}</span>
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TenantDashboard;