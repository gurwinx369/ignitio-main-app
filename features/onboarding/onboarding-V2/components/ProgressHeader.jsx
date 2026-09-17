'use client';

import React from 'react';
import { ArrowLeft } from 'lucide-react';

const getFlowSteps = (codingLevel) => {
  if (codingLevel === "beginner") return ["level", "dailyTime"];
  if (codingLevel === "some_code") return ["level", "triedBefore", "dailyTime"];
  if (codingLevel === "know_basics") return ["level", "seenBefore", "dailyTime"];
  return ["level"];
};

const ProgressHeader = ({ currentStep, codingLevel, onBack }) => {
  const steps = getFlowSteps(codingLevel);
  const currentIndex = steps.indexOf(currentStep);

  return (
    <div className="w-full flex items-center gap-3 pt-12 pb-4 px-6">
      {onBack && (
        <button
          onClick={onBack}
          className="btn-push-sm w-10 h-10 flex items-center justify-center rounded-xl bg-white border-[#ddd8d0] hover:bg-[#ede8e1] shrink-0"
          aria-label="Go back"
        >
          <ArrowLeft className="text-[#19183b]" size={22} />
        </button>
      )}
      <div className={`flex flex-1 gap-1.5 ${!onBack ? 'ml-0' : ''}`}>
        {steps.map((step, index) => {
          const isActive = index <= currentIndex;
          return (
            <div
              key={step}
              className={`h-[5px] flex-1 rounded-full transition-colors duration-300 ${
                isActive ? 'bg-[#00a9ff]' : 'bg-[#ddd8d0]'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ProgressHeader;
