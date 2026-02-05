import React, { useState, useEffect } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types/supabase';
import { PenTool as Tool, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

type MaintenanceRequest = Database['public']['Tables']['maintenance_requests']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];
type Room = Database['public']['Tables']['rooms']['Row'];

interface RequestWithDetails extends MaintenanceRequest {
  tenant: Profile;
  room: Room;
}

const MaintenanceManagement: React.FC = () => {
  const [requests, setRequests] = useState<RequestWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RequestWithDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('maintenance_requests')
        .select(`
          *,
          tenant:profiles!tenant_id(*),
          room:rooms(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data as RequestWithDetails[] || []);
    } catch (error) {
      console.error('Error fetching maintenance requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateRequestStatus = async (requestId: string, status: MaintenanceRequest['status']) => {
    try {
      const { error } = await supabase
        .from('maintenance_requests')
        .update({ status })
        .eq('id', requestId);

      if (error) throw error;
      fetchRequests();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error updating request status:', error);
    }
  };

  const getStatusIcon = (status: MaintenanceRequest['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-amber-500" />;
      case 'in_progress':
        return <Tool className="h-5 w-5 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadgeColor = (status: MaintenanceRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Maintenance Requests</h1>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading maintenance requests...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {requests.map((request) => (
            <Card 
              key={request.id} 
              className={`transform transition-all hover:shadow-lg ${
                request.status === 'pending' ? 'border-l-4 border-amber-500' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${
                    getStatusBadgeColor(request.status).split(' ')[0]
                  }`}>
                    {getStatusIcon(request.status)}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {request.request_type}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Room {request.room.room_number} · {request.tenant.full_name}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  getStatusBadgeColor(request.status)
                }`}>
                  {request.status.replace('_', ' ')}
                </span>
              </div>

              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  {request.description}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                <span>
                  Submitted {format(new Date(request.created_at), 'PPp')}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedRequest(request);
                    setIsModalOpen(true);
                  }}
                >
                  Manage Request
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
          setSelectedRequest(null);
        }}
        title="Maintenance Request Details"
      >
        {selectedRequest && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedRequest.request_type}
                </h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  getStatusBadgeColor(selectedRequest.status)
                }`}>
                  {selectedRequest.status.replace('_', ' ')}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Submitted by {selectedRequest.tenant.full_name}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900">Description</h4>
              <p className="mt-1 text-sm text-gray-600">
                {selectedRequest.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Room Details</h4>
                <div className="mt-1 text-sm text-gray-600">
                  <p>Room Number: {selectedRequest.room.room_number}</p>
                  <p>Floor: {selectedRequest.room.floor_number}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900">Contact Information</h4>
                <div className="mt-1 text-sm text-gray-600">
                  <p>Phone: {selectedRequest.tenant.phone_number}</p>
                  <p>Email: {selectedRequest.tenant.email}</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Update Status</h4>
              <div className="grid grid-cols-2 gap-3">
                {selectedRequest.status !== 'in_progress' && (
                  <Button
                    variant="primary"
                    onClick={() => updateRequestStatus(selectedRequest.id, 'in_progress')}
                  >
                    Mark In Progress
                  </Button>
                )}
                
                {selectedRequest.status !== 'completed' && (
                  <Button
                    variant="success"
                    onClick={() => updateRequestStatus(selectedRequest.id, 'completed')}
                  >
                    Mark Completed
                  </Button>
                )}
                
                {selectedRequest.status !== 'cancelled' && (
                  <Button
                    variant="danger"
                    onClick={() => updateRequestStatus(selectedRequest.id, 'cancelled')}
                  >
                    Cancel Request
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

export default MaintenanceManagement;