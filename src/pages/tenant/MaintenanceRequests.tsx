import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { PenTool as Tool, Clock, CheckCircle, XCircle, AlertTriangle, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { Database } from '../../types/supabase';

type MaintenanceRequest = Database['public']['Tables']['maintenance_requests']['Row'];

const requestSchema = z.object({
  request_type: z.string().min(1, 'Request type is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
});

type RequestFormValues = z.infer<typeof requestSchema>;

const MaintenanceRequests: React.FC = () => {
  const { user } = useAuthStore();
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema),
  });

  useEffect(() => {
    if (user?.id) {
      fetchRequests();
    }
  }, [user?.id]);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('maintenance_requests')
        .select('*')
        .eq('tenant_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching maintenance requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: RequestFormValues) => {
    if (!user?.id) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('maintenance_requests')
        .insert([{
          tenant_id: user.id,
          request_type: data.request_type,
          description: data.description,
          status: 'pending',
        }]);

      if (error) throw error;

      fetchRequests();
      setIsModalOpen(false);
      reset();
    } catch (error) {
      console.error('Error submitting maintenance request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: MaintenanceRequest['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-amber-500" />;
      case 'in_progress':
        return <Tool className="h-5 w-5 text-blue-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadgeColor = (status: MaintenanceRequest['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
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
        <Button
          variant="primary"
          onClick={() => setIsModalOpen(true)}
          leftIcon={<Plus className="w-5 h-5" />}
        >
          New Request
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {['pending', 'in_progress', 'completed', 'cancelled'].map((status) => {
          const count = requests.filter(r => r.status === status).length;
          return (
            <Card key={status} className={`bg-gradient-to-br ${
              status === 'pending' ? 'from-amber-50 to-amber-100' :
              status === 'in_progress' ? 'from-blue-50 to-blue-100' :
              status === 'completed' ? 'from-green-50 to-green-100' :
              'from-red-50 to-red-100'
            }`}>
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${
                  status === 'pending' ? 'bg-amber-500' :
                  status === 'in_progress' ? 'bg-blue-500' :
                  status === 'completed' ? 'bg-green-500' :
                  'bg-red-500'
                }`}>
                  {getStatusIcon(status as MaintenanceRequest['status'])}
                </div>
                <div>
                  <p className={`text-sm ${
                    status === 'pending' ? 'text-amber-600' :
                    status === 'in_progress' ? 'text-blue-600' :
                    status === 'completed' ? 'text-green-600' :
                    'text-red-600'
                  }`}>
                    {status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1)}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {count}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading maintenance requests...</p>
        </div>
      ) : (
        <div className="space-y-4">
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
                      Submitted: {format(new Date(request.created_at), 'PPp')}
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
            </Card>
          ))}

          {requests.length === 0 && (
            <div className="text-center py-12">
              <Tool className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No maintenance requests</h3>
              <p className="mt-2 text-gray-500">Submit a request if you need any repairs or maintenance.</p>
              <Button
                variant="primary"
                className="mt-4"
                onClick={() => setIsModalOpen(true)}
              >
                Submit Request
              </Button>
            </div>
          )}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          reset();
        }}
        title="Submit Maintenance Request"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Request Type"
            placeholder="e.g., Plumbing, Electrical, AC Repair"
            {...register('request_type')}
            error={errors.request_type?.message}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              className={`mt-1 block w-full rounded-md shadow-sm ${
                errors.description
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              }`}
              rows={4}
              placeholder="Please describe the issue in detail..."
              {...register('description')}
            ></textarea>
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                reset();
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              isLoading={isSubmitting}
            >
              Submit Request
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MaintenanceRequests;