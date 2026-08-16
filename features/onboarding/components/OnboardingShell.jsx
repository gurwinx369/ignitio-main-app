"use client";

import React from "react";
import OnboardingProgress from "./OnboardingProgress";

export const ONBOARDING_BACKGROUND = "#fffaf3";
export const ONBOARDING_HEADING = "#111638";

export default function OnboardingShell({ 
  children, 
  title, 
  subtitle, 
  step = 0,
  hideProgress = false
}) {
  return (
    <div 
      className="min-h-dvh flex flex-col items-center py-8 px-4 sm:px-6 md:py-12"
      style={{ backgroundColor: ONBOARDING_BACKGROUND }}
    >
      <div className="w-full max-w-[600px] flex flex-col items-center">
        {step > 0 && !hideProgress && (
          <div className="w-full mb-8">
            <OnboardingProgress currentStep={step} />
          </div>
        )}
        
        {(title || subtitle) && (
          <div className="text-center mb-8">
            {title && (
              <h1 
                className="text-2xl sm:text-3xl font-bold mb-3"
                style={{ color: ONBOARDING_HEADING }}
              >
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-slate-600 text-[15px] sm:text-base max-w-[480px] mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div className="w-full">
          {children}
        </div>
      </div>
    </div>
  );
}
