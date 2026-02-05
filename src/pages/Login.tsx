import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import LoginForm from '../components/auth/LoginForm';
import { Building } from 'lucide-react';

const Login: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();
  
  // Set page title
  useEffect(() => {
    document.title = 'Login - Rental Property Management';
  }, []);
  
  // Redirect if already authenticated
  if (isAuthenticated) {
    const redirectPath = user?.role === 'owner' ? '/owner' : '/tenant';
    return <Navigate to={redirectPath} replace />;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
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
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;