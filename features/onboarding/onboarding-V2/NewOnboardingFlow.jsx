'use client';

import React, { useState } from 'react';
import OnboardingStepLevel from './OnboardingStepLevel';
import OnboardingStepTriedBefore from './OnboardingStepTriedBefore';
import OnboardingStepSeenBefore from './OnboardingStepSeenBefore';
import OnboardingStepDailyTime from './OnboardingStepDailyTime';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/features/context/AuthContext';

const saveToDatabase = async (data) => {
  try {
    const payload = {
      email: data?.email || 'email not found',
      firebaseUID: data?.firebaseUID || 'UID not found',
      questions: {
        selectedTechField: data?.selectedTechField,
        selectedProject: data?.selectedProject || '',
      },
      roadmaps: {
        name: 'Git and Github',
      },
      badge: data?.badge || {
        name: 'Beginner',
        badgeUrl: 'default badge',
      },
    };

    const response = await axios.post('/api/v1/user', payload, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });
    return response.data;
  } catch (err) {
    if (err.response) {
      throw new Error(err.response.data?.message || `Server error: ${err.response.status}`);
    } else if (err.request) {
      throw new Error('Network error. Please check your connection.');
    } else {
      throw new Error(err.message);
    }
  }
};

const NewOnboardingFlow = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    level: '',
    triedBefore: '',
    seenBefore: [],
    dailyTime: '',
  });

  const updateData = (field, value) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNextFromLevel = () => {
    if (data.level === 'beginner') {
      setStep(4); // Skip to daily time
    } else if (data.level === 'some_code') {
      setStep(2); // Go to tried before
    } else if (data.level === 'know_basics') {
      setStep(3); // Go to seen before
    }
  };

  const handleComplete = async () => {
    try {
      setIsLoading(true);

      const finalData = {
        level: data.level,
        triedBefore: data.triedBefore,
        seenBefore: data.seenBefore,
        dailyTime: data.dailyTime,
      };

      // Construct a valid payload for the old API
      const selectedTechField = data.seenBefore.length >= 2 
        ? data.seenBefore 
        : ['New Onboarding Path', 'Gamified Learning'];
      
      const selectedProject = `Level: ${data.level}, Tried: ${data.triedBefore}, Time: ${data.dailyTime}`;

      const { uid, email } = user || {};

      const badge = {
        name: 'Onboarding Complete',
        badgeUrl: '/badges/onboarding-badge.png',
      };

      await saveToDatabase({
        firebaseUID: uid,
        email: email,
        selectedTechField,
        selectedProject,
        badge,
      });

      localStorage.setItem('onboarding_completed', JSON.stringify(finalData));
      router.push('/home/onboarding/welcome');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      alert(`Failed to save your progress: ${error.message}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#fcf5ee] flex justify-center items-center">
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-[#fcf5ee]/80 backdrop-blur-sm">
          <div className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-xl border-2 border-slate-200">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-[#00a9ff] rounded-full animate-spin mb-4"></div>
            <p className="font-bold text-[#19183b]">Saving your progress...</p>
          </div>
        </div>
      )}

      {step === 1 && (
        <OnboardingStepLevel
          selection={data.level}
          setSelection={(val) => updateData('level', val)}
          onNext={handleNextFromLevel}
        />
      )}
      {step === 2 && (
        <OnboardingStepTriedBefore
          selection={data.triedBefore}
          setSelection={(val) => updateData('triedBefore', val)}
          onBack={() => setStep(1)}
          onNext={() => setStep(4)} // After screen 4, go to screen 6 (Daily time)
        />
      )}
      {step === 3 && (
        <OnboardingStepSeenBefore
          selection={data.seenBefore}
          setSelection={(val) => updateData('seenBefore', val)}
          onBack={() => setStep(1)}
          onNext={() => setStep(4)} // After screen 5, go to screen 6 (Daily time)
        />
      )}
      {step === 4 && (
        <OnboardingStepDailyTime
          selection={data.dailyTime}
          setSelection={(val) => updateData('dailyTime', val)}
          onBack={() => {
            // Determine back path based on level
            if (data.level === 'beginner') setStep(1);
            else if (data.level === 'some_code') setStep(2);
            else if (data.level === 'know_basics') setStep(3);
          }}
          onComplete={handleComplete}
        />
      )}
    </div>
  );
};

export default NewOnboardingFlow;
