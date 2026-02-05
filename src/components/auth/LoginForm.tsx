import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle } from 'lucide-react';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { useAuthStore } from '../../store/authStore';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginForm: React.FC = () => {
  const { login, isLoading, error, clearError } = useAuthStore();
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  const onSubmit = async (data: LoginFormValues) => {
    await login(data.email, data.password);
  };
  
  return (
    <div className="w-full max-w-md">
      <div className="bg-white py-8 px-6 shadow-md rounded-lg">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
          <p className="mt-2 text-gray-600">Sign in to access your account</p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-md">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-sm text-red-600">{error}</span>
            </div>
            <div className="mt-2 text-xs text-gray-600">
              <p>Try these demo accounts:</p>
              <p>- Owner: owner@example.com</p>
              <p>- Tenant: tenant@example.com</p>
              <p>Password can be anything for the demo.</p>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Input
              id="email"
              type="email"
              label="Email address"
              placeholder="your@email.com"
              fullWidth
              error={errors.email?.message}
              {...register('email')}
              onChange={() => {
                if (error) clearError();
              }}
            />
          </div>
          
          <div>
            <Input
              id="password"
              type="password"
              label="Password"
              placeholder="••••••••"
              fullWidth
              error={errors.password?.message}
              {...register('password')}
              onChange={() => {
                if (error) clearError();
              }}
            />
          </div>
          
          <div>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isLoading}
            >
              Sign in
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;