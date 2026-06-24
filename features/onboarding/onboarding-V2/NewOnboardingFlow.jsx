'use client';

import React, { useState } from 'react';
import OnboardingStepLevel from './OnboardingStepLevel';
import OnboardingStepTriedBefore from './OnboardingStepTriedBefore';
import OnboardingStepSeenBefore from './OnboardingStepSeenBefore';
import OnboardingStepDailyTime from './OnboardingStepDailyTime';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/features/context/AuthContext';
import ErrorToast from './components/ErrorToast';

const getSelectedTechFieldHelper = (state) => {
  const { level } = state;

  if (level === "beginner") {
    return [
      "frontend development",
      "backend development"
    ];
  }

  if (level === "some_code") {
    return [
      "Gen Ai",
      "Ai/ML"
    ];
  }

  if (level === "know_basics") {
    return [
      "cloud computing",
      "Cybersecurity"
    ];
  }

  return [
    "frontend development",
    "backend development"
  ];
};

const saveToDatabase = async (data) => {
  try {
    if (!data.email || !data.firebaseUID) {
      throw new Error("Email and Firebase UID are required");
    }

    if (!data.selectedTechField || data.selectedTechField.length < 2) {
      throw new Error("At least 2 learning fields must be selected");
    }

    const payload = {
      email: data?.email || "email not found",

      firebaseUID: data?.firebaseUID || "UID not found",

      questions: {
        selectedTechField:
          data?.selectedTechField || [],

        selectedProject:
          data?.selectedProject ||
          data?.projectDescription ||
          "",
      },

      roadmaps: {
        name: "Git and Github"
      },

      badge:
        data?.badge || {
          name: "Onboarding Complete",
          badgeUrl:
            "/badges/onboarding-badge.png"
        }
    };



    const response = await axios.post("/api/v1/user", payload, {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 10000,
    });

    if (process.env.NODE_ENV === "development") {
      console.log("Data saved successfully");
    }
    return response.data;

  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error saving data:", err?.response?.status || err?.message || "unknown error");
    }
    throw err;
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

  const [errorToast, setErrorToast] = useState({ show: false, title: '', message: '' });

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

      const selectedTechField = getSelectedTechFieldHelper(data);
      const selectedProject = `Level: ${data.level}, Tried: ${data.triedBefore}, Time: ${data.dailyTime}`;

      const finalData = {
        selectedTechField: selectedTechField,
        selectedProject: selectedProject,
      };

      const { uid, email } = user || {};

      const badge = {
        name: 'Onboarding Complete',
        badgeUrl: '/badges/onboarding-badge.png',
      };

      const result = await saveToDatabase({
        firebaseUID: uid,
        email: email,
        selectedTechField: selectedTechField,
        selectedProject: selectedProject,
        badge,
      });

      localStorage.setItem('onboarding_completed', JSON.stringify(finalData));
      router.push('/home/onboarding/welcome');
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error('Failed to complete onboarding:', error?.message || "unknown error");
      }

      const errorMessage = error.response?.data?.message || error.message || '';
      const isEmailInUse = errorMessage.includes('auth/email-already-in-use') || errorMessage.includes('already exists');

      if (isEmailInUse) {
        setErrorToast({
          show: true,
          title: 'Account already exists',
          message: 'This email already has an account.\nPlease sign in instead.'
        });
      } else if (error.response?.data?.message) {
        setErrorToast({
          show: true,
          title: 'Setup issue',
          message: error.response.data.message
        });
      } else if (error.request) {
        setErrorToast({
          show: true,
          title: 'Something went wrong',
          message: "We couldn't save your progress.\nPlease check your connection and try again."
        });
      } else {
        setErrorToast({
          show: true,
          title: 'Something went wrong',
          message: errorMessage || "An unexpected error occurred."
        });
      }
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
          codingLevel={data.level}
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
