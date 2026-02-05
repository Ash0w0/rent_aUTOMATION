import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Home, Users, PenTool as Tool, CreditCard, Check, Clock, AlertTriangle } from 'lucide-react';
import { useRoomStore } from '../../store/roomStore';
import { useMaintenanceStore } from '../../store/maintenanceStore';
import { usePaymentStore } from '../../store/paymentStore';

const OwnerDashboard: React.FC = () => {
  const { rooms, totalRooms } = useRoomStore();
  const { requests } = useMaintenanceStore();
  const { payments } = usePaymentStore();
  const navigate = useNavigate();
  
  // Set page title
  useEffect(() => {
    document.title = 'Owner Dashboard - Rental Property Management';
  }, []);
  
  // Calculate stats
  const occupiedRooms = rooms.filter(room => room.occupied).length;
  const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;
  
  const pendingMaintenance = requests.filter(req => req.status === 'pending').length;
  const inProgressMaintenance = requests.filter(req => req.status === 'in-progress').length;
  
  const pendingPayments = payments.filter(payment => payment.status === 'pending').length;
  const overduePayments = payments.filter(payment => payment.status === 'overdue').length;
  const paidPayments = payments.filter(payment => payment.status === 'paid').length;
  
  const totalIncome = payments
    .filter(payment => payment.status === 'paid')
    .reduce((sum, payment) => sum + payment.amount, 0);
  
  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="transform transition-all hover:shadow-lg">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full mr-4">
              <Home className="h-6 w-6 text-blue-700" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Occupancy Rate</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-semibold text-gray-900">
                  {occupancyRate.toFixed(0)}%
                </p>
                <p className="ml-2 text-sm text-gray-500">
                  ({occupiedRooms}/{totalRooms} rooms)
                </p>
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="transform transition-all hover:shadow-lg">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full mr-4">
              <CreditCard className="h-6 w-6 text-green-700" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Income</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-semibold text-gray-900">
                  ${totalIncome.toFixed(2)}
                </p>
                <p className="ml-2 text-sm text-gray-500">
                  ({paidPayments} payments)
                </p>
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="transform transition-all hover:shadow-lg">
          <div className="flex items-center">
            <div className="p-3 bg-amber-100 rounded-full mr-4">
              <Clock className="h-6 w-6 text-amber-700" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending Payments</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-semibold text-gray-900">
                  {pendingPayments}
                </p>
                {overduePayments > 0 && (
                  <p className="ml-2 text-sm text-red-500">
                    +{overduePayments} overdue
                  </p>
                )}
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="transform transition-all hover:shadow-lg">
          <div className="flex items-center">
            <div className="p-3 bg-indigo-100 rounded-full mr-4">
              <Tool className="h-6 w-6 text-indigo-700" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Maintenance</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-semibold text-gray-900">
                  {pendingMaintenance}
                </p>
                <p className="ml-2 text-sm text-gray-500">
                  pending (+{inProgressMaintenance} in progress)
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rooms overview */}
        <Card 
          title="Rooms Overview" 
          subtitle="Status of all rooms"
          className="transform transition-all hover:shadow-lg"
          footer={
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => navigate('/owner/rooms')}
              >
                Manage Rooms
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-50 p-3 rounded-md text-center">
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-xl font-medium text-gray-900">{totalRooms}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-md text-center">
                <p className="text-sm text-gray-500">Occupied</p>
                <p className="text-xl font-medium text-green-700">{occupiedRooms}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-md text-center">
                <p className="text-sm text-gray-500">Available</p>
                <p className="text-xl font-medium text-blue-700">{totalRooms - occupiedRooms}</p>
              </div>
            </div>
            
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-2 bg-blue-600 rounded-full"
                style={{ width: `${occupancyRate}%` }}
              ></div>
            </div>
          </div>
        </Card>
        
        {/* Maintenance requests */}
        <Card 
          title="Maintenance Requests" 
          subtitle="Recent maintenance issues"
          className="transform transition-all hover:shadow-lg"
          footer={
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => navigate('/owner/maintenance')}
              >
                View All
              </Button>
            </div>
          }
        >
          {requests.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {requests.slice(0, 4).map((request) => (
                <li key={request.id} className="py-3 flex items-start">
                  <div className={`p-2 rounded-full mr-3 flex-shrink-0 ${
                    request.status === 'pending' 
                      ? 'bg-amber-100' 
                      : request.status === 'in-progress'
                      ? 'bg-blue-100'
                      : request.status === 'completed'
                      ? 'bg-green-100'
                      : 'bg-red-100'
                  }`}>
                    {request.status === 'pending' ? (
                      <Clock className="h-5 w-5 text-amber-700" />
                    ) : request.status === 'in-progress' ? (
                      <Tool className="h-5 w-5 text-blue-700" />
                    ) : request.status === 'completed' ? (
                      <Check className="h-5 w-5 text-green-700" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-700" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {request.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Room #{rooms.find(r => r.id === request.roomId)?.number} · 
                      Priority: <span className="capitalize">{request.priority}</span>
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    request.status === 'pending' 
                      ? 'bg-amber-100 text-amber-800' 
                      : request.status === 'in-progress'
                      ? 'bg-blue-100 text-blue-800'
                      : request.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {request.status}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-6">
              <Tool className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No maintenance requests found.</p>
            </div>
          )}
        </Card>
      </div>
      
      {/* Quick actions */}
      <Card title="Quick Actions" className="transform transition-all hover:shadow-lg">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Button
            variant="outline"
            fullWidth
            className="flex flex-col items-center justify-center h-24"
            onClick={() => navigate('/owner/rooms')}
          >
            <Home className="h-6 w-6 mb-2" />
            <span>Manage Rooms</span>
          </Button>
          
          <Button
            variant="outline"
            fullWidth
            className="flex flex-col items-center justify-center h-24"
            onClick={() => navigate('/owner/tenants')}
          >
            <Users className="h-6 w-6 mb-2" />
            <span>Manage Tenants</span>
          </Button>
          
          <Button
            variant="outline"
            fullWidth
            className="flex flex-col items-center justify-center h-24"
            onClick={() => navigate('/owner/maintenance')}
          >
            <Tool className="h-6 w-6 mb-2" />
            <span>Maintenance</span>
          </Button>
          
          <Button
            variant="outline"
            fullWidth
            className="flex flex-col items-center justify-center h-24"
            onClick={() => navigate('/owner/payments')}
          >
            <CreditCard className="h-6 w-6 mb-2" />
            <span>Payments</span>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default OwnerDashboard;