"use client";

import React from "react";
import OnboardingProgress from "./OnboardingProgress";

export const ONBOARDING_BACKGROUND = "#FCF5EE";
export const ONBOARDING_HEADING = "#001D32";

export default function OnboardingShell({ 
  children, 
  title, 
  subtitle, 
  step = 0,
  hideProgress = true
}) {
  return (
    <div 
      className="min-h-dvh flex flex-col items-center px-4 sm:px-6"
      style={{ backgroundColor: ONBOARDING_BACKGROUND }}
    >
      {/* Container matching mobile width ~390-430px */}
      <div className="w-full max-w-[430px] flex flex-col pt-6 pb-12">
        {step > 0 && !hideProgress && (
          <div className="w-full mb-6">
            <OnboardingProgress currentStep={step} />
          </div>
        )}
        
        {(title || subtitle) && (
          <div className="text-center mb-6">
            {title && (
              <h1 
                className="text-2xl sm:text-3xl font-bold mb-2"
                style={{ color: ONBOARDING_HEADING }}
              >
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-slate-600 text-[15px] max-w-[340px] mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div className="w-full flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
}
