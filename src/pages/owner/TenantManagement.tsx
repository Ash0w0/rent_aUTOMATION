import React, { useState } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types/supabase';
import { Phone, Mail, Home, Calendar, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Tenant = Database['public']['Tables']['tenants']['Row'];
type Room = Database['public']['Tables']['rooms']['Row'];

interface TenantWithDetails extends Tenant {
  profile: Profile;
  room: Room;
}

const TenantManagement: React.FC = () => {
  const [tenants, setTenants] = useState<TenantWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<TenantWithDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch tenants on component mount
  React.useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    setIsLoading(true);
    try {
      const { data: tenantsData, error: tenantsError } = await supabase
        .from('tenants')
        .select(`
          *,
          profile:profiles(*),
          room:rooms(*)
        `);

      if (tenantsError) throw tenantsError;
      setTenants(tenantsData as TenantWithDetails[] || []);
    } catch (error) {
      console.error('Error fetching tenants:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAadhaar = async (tenantId: string) => {
    try {
      const { error } = await supabase
        .from('tenants')
        .update({ aadhaar_verified: true })
        .eq('id', tenantId);

      if (error) throw error;
      fetchTenants();
    } catch (error) {
      console.error('Error verifying Aadhaar:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Tenant Management</h1>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tenants...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {tenants.map((tenant) => (
            <Card key={tenant.id} className="transform transition-all hover:shadow-lg">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <img
                    src={tenant.profile.profile_photo_url || `https://ui-avatars.com/api/?name=${tenant.profile.full_name}`}
                    alt={tenant.profile.full_name || ''}
                    className="h-12 w-12 rounded-full"
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {tenant.profile.full_name}
                    </h3>
                    <div className="flex items-center">
                      {!tenant.aadhaar_verified && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Unverified
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-1 space-y-2">
                    <div className="flex items-center text-sm text-gray-500">
                      <Home className="flex-shrink-0 mr-1.5 h-4 w-4" />
                      Room {tenant.room.room_number}, Floor {tenant.room.floor_number}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500">
                      <Phone className="flex-shrink-0 mr-1.5 h-4 w-4" />
                      {tenant.profile.phone_number || 'No phone number'}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500">
                      <Mail className="flex-shrink-0 mr-1.5 h-4 w-4" />
                      {tenant.profile.email || 'No email'}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4" />
                      Lease: {format(new Date(tenant.lease_start_date), 'PP')} - {format(new Date(tenant.lease_end_date), 'PP')}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={() => {
                    setSelectedTenant(tenant);
                    setIsModalOpen(true);
                  }}
                >
                  View Details
                </Button>
                
                {!tenant.aadhaar_verified && (
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    onClick={() => handleVerifyAadhaar(tenant.id)}
                  >
                    Verify Aadhaar
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTenant(null);
        }}
        title="Tenant Details"
        size="lg"
      >
        {selectedTenant && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <img
                src={selectedTenant.profile.profile_photo_url || `https://ui-avatars.com/api/?name=${selectedTenant.profile.full_name}`}
                alt={selectedTenant.profile.full_name || ''}
                className="h-20 w-20 rounded-full"
              />
              <div>
                <h3 className="text-xl font-medium text-gray-900">
                  {selectedTenant.profile.full_name}
                </h3>
                <p className="text-sm text-gray-500">
                  Tenant since {format(new Date(selectedTenant.lease_start_date), 'PP')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Room Details</h4>
                <div className="mt-2 space-y-2">
                  <p className="text-sm text-gray-500">
                    Room Number: {selectedTenant.room.room_number}
                  </p>
                  <p className="text-sm text-gray-500">
                    Floor: {selectedTenant.room.floor_number}
                  </p>
                  <p className="text-sm text-gray-500">
                    Monthly Rent: ${selectedTenant.room.monthly_rent}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900">Contact Information</h4>
                <div className="mt-2 space-y-2">
                  <p className="text-sm text-gray-500">
                    Phone: {selectedTenant.profile.phone_number}
                  </p>
                  <p className="text-sm text-gray-500">
                    Email: {selectedTenant.profile.email}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900">Lease Information</h4>
              <div className="mt-2 space-y-2">
                <p className="text-sm text-gray-500">
                  Start Date: {format(new Date(selectedTenant.lease_start_date), 'PP')}
                </p>
                <p className="text-sm text-gray-500">
                  End Date: {format(new Date(selectedTenant.lease_end_date), 'PP')}
                </p>
                <p className="text-sm text-gray-500">
                  Rent Due Day: {selectedTenant.rent_due_day}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900">Verification Status</h4>
              <div className="mt-2">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  selectedTenant.aadhaar_verified
                    ? 'bg-green-100 text-green-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {selectedTenant.aadhaar_verified ? 'Verified' : 'Pending Verification'}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TenantManagement;