import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Building, Home, User } from 'lucide-react';

const Login: React.FC = () => {
  const { isAuthenticated, user, setUser } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Login - Rental Property Management';
  }, []);

  if (isAuthenticated) {
    const redirectPath = user?.role === 'owner' ? '/owner' : '/tenant';
    return <Navigate to={redirectPath} replace />;
  }

  const handleOwnerLogin = () => {
    const ownerUser = {
      id: 'owner-001',
      email: 'owner@example.com',
      full_name: 'John Property Owner',
      role: 'owner' as const,
      aadhaar_number: null,
      phone_number: '+91 9876543210',
      date_of_birth: null,
      profile_photo_url: null,
    };
    setUser(ownerUser);
    navigate('/owner');
  };

  const handleTenantLogin = () => {
    const tenantUser = {
      id: 'tenant-001',
      email: 'tenant@example.com',
      full_name: 'Jane Tenant',
      role: 'tenant' as const,
      aadhaar_number: '123456789012',
      phone_number: '+91 9876543211',
      date_of_birth: '1990-01-15',
      profile_photo_url: null,
    };
    setUser(tenantUser);
    navigate('/tenant');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-full bg-white shadow-lg flex items-center justify-center">
            <Building className="h-10 w-10 text-blue-900" />
          </div>
        </div>
        <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          RentProp
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Rental Property Management
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow rounded-lg space-y-6">
          <div className="text-center mb-6">
            <p className="text-gray-600 text-sm">Select your role to continue</p>
          </div>

          <button
            onClick={handleOwnerLogin}
            className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-900 hover:bg-blue-800 transition-colors duration-200"
          >
            <Home className="h-5 w-5 mr-2" />
            Login as Owner
          </button>

          <button
            onClick={handleTenantLogin}
            className="w-full flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
          >
            <User className="h-5 w-5 mr-2" />
            Login as Tenant
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;