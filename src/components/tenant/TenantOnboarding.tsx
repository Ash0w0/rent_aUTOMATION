import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Webcam from 'react-webcam';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Camera, Upload, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';

const onboardingSchema = z.object({
  roomNumber: z.string().min(1, 'Room number is required'),
  aadhaarNumber: z.string()
    .min(12, 'Aadhaar number must be 12 digits')
    .max(12, 'Aadhaar number must be 12 digits')
    .regex(/^\d+$/, 'Aadhaar number must contain only digits'),
});

type OnboardingFormValues = z.infer<typeof onboardingSchema>;

export const TenantOnboarding: React.FC = () => {
  const { user } = useAuthStore();
  const [step, setStep] = useState(1);
  const [photo, setPhoto] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const webcamRef = React.useRef<Webcam>(null);

  const { 
    register, 
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
  });

  const capturePhoto = React.useCallback(() => {
    if (webcamRef.current) {
      const photoData = webcamRef.current.getScreenshot();
      setPhoto(photoData);
      setIsCameraActive(false);
    }
  }, [webcamRef]);

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: OnboardingFormValues) => {
    try {
      // Simulate Aadhaar verification
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Upload photo to Supabase storage if we have both user and photo
      if (photo && user?.id) {
        const photoBlob = await fetch(photo).then(res => res.blob());
        const fileName = `profile-photos/${user.id}-${Date.now()}.jpg`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('tenant-photos')
          .upload(fileName, photoBlob);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('tenant-photos')
          .getPublicUrl(fileName);

        // Update profile with Aadhaar and photo
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            aadhaar_number: data.aadhaarNumber,
            profile_photo_url: publicUrl,
          })
          .eq('id', user.id);

        if (updateError) throw updateError;
      }

      setStep(step + 1);
    } catch (error) {
      console.error('Onboarding error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md mx-auto w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Welcome!</h2>
          <p className="mt-2 text-gray-600">Let's get you set up</p>
        </div>

        {step === 1 && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Room Number"
              {...register('roomNumber')}
              error={errors.roomNumber?.message}
              placeholder="Enter your room number"
            />

            <Input
              label="Aadhaar Number"
              {...register('aadhaarNumber')}
              error={errors.aadhaarNumber?.message}
              placeholder="12-digit Aadhaar number"
              type="password"
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isSubmitting}
            >
              Verify Details
            </Button>
          </form>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900">Identity Verification</h3>
              <p className="mt-1 text-sm text-gray-500">
                Please take a photo for verification
              </p>
            </div>

            {!photo && !isCameraActive && (
              <div className="space-y-4">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => setIsCameraActive(true)}
                  leftIcon={<Camera className="w-5 h-5" />}
                >
                  Take Photo
                </Button>
                
                <div className="relative">
                  <Button
                    variant="outline"
                    fullWidth
                    leftIcon={<Upload className="w-5 h-5" />}
                  >
                    Upload Photo
                  </Button>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {isCameraActive && (
              <div className="space-y-4">
                <Webcam
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="w-full rounded-lg"
                />
                <Button
                  variant="primary"
                  fullWidth
                  onClick={capturePhoto}
                >
                  Capture Photo
                </Button>
              </div>
            )}

            {photo && (
              <div className="space-y-4">
                <img
                  src={photo}
                  alt="Verification photo"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <div className="flex space-x-4">
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => setPhoto(null)}
                  >
                    Retake
                  </Button>
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={() => setStep(3)}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Verification Complete!</h3>
              <p className="mt-1 text-sm text-gray-500">
                Your account is now being reviewed. We'll notify you once it's approved.
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};