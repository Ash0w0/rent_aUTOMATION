import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { User, Phone, Mail, Calendar, Camera, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

const profileSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  phone_number: z.string().min(10, 'Phone number must be at least 10 digits'),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const TenantProfile: React.FC = () => {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: user?.full_name || '',
      phone_number: user?.phone_number || '',
      date_of_birth: user?.date_of_birth || '',
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        full_name: user.full_name || '',
        phone_number: user.phone_number || '',
        date_of_birth: user.date_of_birth || '',
      });
    }
  }, [user, reset]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File size must be less than 5MB');
        return;
      }

      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      let profilePhotoUrl = user.profile_photo_url;

      // Upload new profile photo if changed
      if (profileImage) {
        const fileExt = profileImage.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('profile-photos')
          .upload(fileName, profileImage);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('profile-photos')
          .getPublicUrl(fileName);

        profilePhotoUrl = publicUrl;
      }

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
          phone_number: data.phone_number,
          date_of_birth: data.date_of_birth,
          profile_photo_url: profilePhotoUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card className="transform transition-all hover:shadow-lg">
        <div className="text-center">
          <div className="relative inline-block">
            <img
              src={previewUrl || user?.profile_photo_url || `https://ui-avatars.com/api/?name=${user?.full_name || 'User'}&background=random`}
              alt="Profile"
              className="h-32 w-32 rounded-full object-cover mx-auto"
            />
            {isEditing && (
              <label className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg cursor-pointer hover:bg-gray-50">
                <Camera className="h-5 w-5 text-gray-600" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            )}
          </div>

          <h2 className="mt-4 text-2xl font-bold text-gray-900">
            {user?.full_name || 'Loading...'}
          </h2>
          <p className="text-sm text-gray-500 capitalize">
            {user?.role || 'Tenant'}
          </p>

          {!isEditing && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </Button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
            <Input
              label="Full Name"
              {...register('full_name')}
              error={errors.full_name?.message}
              leftIcon={<User className="h-5 w-5 text-gray-400" />}
            />

            <Input
              label="Phone Number"
              {...register('phone_number')}
              error={errors.phone_number?.message}
              leftIcon={<Phone className="h-5 w-5 text-gray-400" />}
            />

            <Input
              label="Date of Birth"
              type="date"
              {...register('date_of_birth')}
              error={errors.date_of_birth?.message}
              leftIcon={<Calendar className="h-5 w-5 text-gray-400" />}
            />

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setPreviewUrl(null);
                  setProfileImage(null);
                  reset();
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                isLoading={isLoading}
              >
                Save Changes
              </Button>
            </div>
          </form>
        ) : (
          <div className="mt-6 border-t border-gray-200 pt-6">
            <dl className="divide-y divide-gray-200">
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500">Full name</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  {user?.full_name || 'Not set'}
                </dd>
              </div>
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500">Email address</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  {user?.email || 'Not set'}
                </dd>
              </div>
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500">Phone number</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  {user?.phone_number || 'Not set'}
                </dd>
              </div>
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500">Date of birth</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  {user?.date_of_birth ? format(new Date(user.date_of_birth), 'PP') : 'Not set'}
                </dd>
              </div>
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500">Aadhaar verification</dt>
                <dd className="mt-1 text-sm sm:col-span-2 sm:mt-0">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="mr-1 h-4 w-4" />
                    Verified
                  </span>
                </dd>
              </div>
            </dl>
          </div>
        )}

        {updateSuccess && (
          <div className="absolute top-4 right-4 flex items-center bg-green-100 text-green-700 px-4 py-2 rounded-md">
            <CheckCircle className="h-5 w-5 mr-2" />
            Profile updated successfully
          </div>
        )}
      </Card>
    </div>
  );
};

export default TenantProfile;