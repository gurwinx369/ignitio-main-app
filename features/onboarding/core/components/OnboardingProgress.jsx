"use client";

import React from "react";
import { Check } from "lucide-react";

const STEPS = [
  "Assessment",
  "Results",
  "Choose Access",
  "Preferences",
  "Activation"
];

export default function OnboardingProgress({ currentStep = 1 }) {
  // currentStep is 1-indexed
  
  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative">
        {/* Background track line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 rounded-full z-0" />
        
        {/* Active track line */}
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-purple-600 rounded-full z-0 transition-all duration-300" 
          style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
        />

        {STEPS.map((stepName, index) => {
          const stepNum = index + 1;
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;
          const isUpcoming = stepNum > currentStep;

          return (
            <div key={stepName} className="relative z-10 flex flex-col items-center group">
              <div 
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                  ${isCompleted ? "bg-purple-600 text-white" : ""}
                  ${isCurrent ? "bg-purple-600 text-white shadow-md shadow-purple-600/30 scale-110" : ""}
                  ${isUpcoming ? "bg-white text-slate-400 border-2 border-slate-200" : ""}
                `}
              >
                {isCompleted ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : stepNum}
              </div>
              
              <div 
                className={`absolute -bottom-6 text-[10px] sm:text-xs font-semibold whitespace-nowrap transition-colors duration-300
                  ${(isCompleted || isCurrent) ? "text-slate-800" : "text-slate-400"}
                `}
              >
                {/* On very small screens, only show the current step label or hide labels completely? We'll show all but truncate or just rely on the step number. */}
                <span className="hidden sm:inline">{stepName}</span>
                <span className="sm:hidden">{isCurrent ? stepName : ""}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
