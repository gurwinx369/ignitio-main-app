'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingProfession from './OnboardingProfession';
import OnboardingBadge from './OnboardingBadge';

const NewOnboardingV3 = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [profession, setProfession] = useState('');

  const handleNextFromProfession = () => {
    if (profession) {
      setStep(2);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('profession', profession);
    router.push('/home');
  };

  return (
    <div className="w-full min-h-screen bg-[#fcf5ee] flex justify-center items-center">
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
