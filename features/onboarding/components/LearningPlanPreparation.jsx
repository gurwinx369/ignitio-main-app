"use client";

import React, { useEffect, useState } from "react";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { ONBOARDING_BACKGROUND, ONBOARDING_HEADING } from "./OnboardingShell";

const PHASES = [
  "Analyzing your answers...",
  "Structuring your learning path...",
  "Preparing your recommendations..."
];

export default function LearningPlanPreparation({ status, error, onRetry }) {
  const [phaseIndex, setPhaseIndex] = useState(0);

  useEffect(() => {
    if (status !== "preparing") return;
    
    // Cycle through phases every 800ms
    const interval = setInterval(() => {
      setPhaseIndex((prev) => Math.min(prev + 1, PHASES.length - 1));
    }, 800);

    return () => clearInterval(interval);
  }, [status]);

  return (
    <div 
      className="absolute inset-0 z-50 flex flex-col items-center justify-center p-6"
      style={{ backgroundColor: ONBOARDING_BACKGROUND }}
    >
      <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-lg border border-slate-100 max-w-md w-full text-center flex flex-col items-center">
        {status === "error" ? (
          <>
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-2xl font-bold mb-3" style={{ color: ONBOARDING_HEADING }}>
              Connection Interrupted
            </h2>
            <p className="text-slate-600 mb-8">
              {error?.message || error || "We couldn't save your progress. Please try again."}
            </p>
            <button
              onClick={onRetry}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors"
            >
              <RefreshCw size={18} />
              Retry Connection
            </button>
          </>
        ) : (
          <>
            <div className="relative mb-8">
              <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center">
                <Loader2 size={40} className="text-purple-600 animate-spin" />
              </div>
            </div>
            
            <h2 className="text-xl sm:text-2xl font-bold mb-2 transition-all duration-300" style={{ color: ONBOARDING_HEADING }}>
              {PHASES[phaseIndex]}
            </h2>
            <p className="text-slate-500 text-sm">
              Please wait while we finalize your results.
            </p>
            
            {/* Simple progress bar */}
            <div className="w-full h-1.5 bg-slate-100 rounded-full mt-8 overflow-hidden">
              <div 
                className="h-full bg-purple-600 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${((phaseIndex + 1) / PHASES.length) * 100}%` }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
