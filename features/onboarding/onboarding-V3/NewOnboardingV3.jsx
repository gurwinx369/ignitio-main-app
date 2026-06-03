'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingProfession from './OnboardingProfession';
import OnboardingBadge from './OnboardingBadge';
import { useAuth } from '@/features/context/AuthContext';
import axios from 'axios';
import ErrorToast from '../onboarding-V2/components/ErrorToast';

const NewOnboardingV3 = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [profession, setProfession] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorToast, setErrorToast] = useState({ show: false, title: '', message: '' });

  const handleNextFromProfession = () => {
    if (profession) {
      setStep(2);
    }
  };

  const handleComplete = async () => {
    try {
      setIsLoading(true);
      setErrorToast({ show: false, title: '', message: '' });

      if (!user) {
        throw new Error('No authenticated user found. Please log in.');
      }

      const idToken = await user.getIdToken();
      const payload = {
        email: user.email,
        role: profession.toLowerCase(), // role must be one of: student, writer, designer, developer, other
      };

      const response = await axios.post('/api/v2/user', payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        timeout: 10000,
      });

      console.log('Profile created successfully:', response.data);

      localStorage.setItem('profession', profession.toLowerCase());
      router.push('/home');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred.';
      setErrorToast({
        show: true,
        title: 'Setup issue',
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#fcf5ee] flex justify-center items-center">
      {errorToast.show && (
        <ErrorToast
          title={errorToast.title}
          message={errorToast.message}
          onDismiss={() => setErrorToast({ ...errorToast, show: false })}
          onTryAgain={() => {
            setErrorToast({ ...errorToast, show: false });
            handleComplete();
          }}
        />
      )}

      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-[#fcf5ee]/80 backdrop-blur-sm">
          <div className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-xl border-2 border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-[#00a9ff] rounded-full animate-spin mb-4"></div>
            <p className="font-bold text-[#19183b] font-sans">Saving your profile...</p>
          </div>
        </div>
      )}

      {step === 1 && (
        <OnboardingProfession
          selection={profession}
          setSelection={setProfession}
          onNext={handleNextFromProfession}
        />
      )}
      {step === 2 && (
        <OnboardingBadge
          profession={profession}
          onNext={handleComplete}
        />
      )}
    </div>
  );
};

export default NewOnboardingV3;
