import React from 'react';
import { ArrowLeft } from 'lucide-react';

const getFlowSteps = (codingLevel) => {
  if (codingLevel === "beginner") return ["level", "dailyTime"];
  if (codingLevel === "some_code") return ["level", "triedBefore", "dailyTime"];
  if (codingLevel === "know_basics") return ["level", "seenBefore", "dailyTime"];
  return ["level"]; // Fallback if no level is set yet
};

const ProgressHeader = ({ currentStep, codingLevel, onBack }) => {
  const steps = getFlowSteps(codingLevel);
  const currentIndex = steps.indexOf(currentStep);

  return (
    <div className="pt-14 px-6 pb-4 flex items-center gap-4">
      {onBack && (
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-full bg-white border-2 border-[#cdc5bc] shadow-[0_4px_0_0_rgba(0,0,0,0.05)] active:translate-y-0.5 transition-all shrink-0">
          <ArrowLeft className="text-[#19183b]" size={20} />
        </button>
      )}
      <div className={`flex flex-1 gap-1.5 ${onBack ? '' : 'ml-0'}`}>
        {steps.map((step, index) => {
          const isActive = index <= currentIndex;
          return (
            <div
              key={step}
              className={`h-[7px] flex-1 rounded-full transition-colors duration-300 ${
                isActive ? 'bg-[#00a9ff] shadow-[0_0_8px_rgba(0,169,255,0.4)]' : 'bg-[#ddd8d0]'
              }`}
            ></div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressHeader;
