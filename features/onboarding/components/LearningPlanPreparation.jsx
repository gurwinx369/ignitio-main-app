"use client";

import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

/**
 * LearningPlanPreparation
 *
 * Results / "Building your path" loading screen.
 *
 * Visual: kyle-working-laptop.svg (final Figma export)
 *   - replaces temporary kyle-working-laptop.webp
 *   - entry: fade up from 8px offset
 *   - idle: gentle float (-3px, ease-in-out, 3s, infinite)
 *   - reduced-motion: static, no animation
 *
 * Loading architecture, copy, API behavior, and layout unchanged.
 */

const LAPTOP_KYLE_SRC = "/onboarding/figma/kyle/kyle-working-laptop.svg";

const KYLE_STYLES = `
  @keyframes lpp-kyle-enter {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0);    }
  }

  @keyframes lpp-kyle-idle {
    0%   { transform: translateY(0);   }
    50%  { transform: translateY(-3px); }
    100% { transform: translateY(0);   }
  }

  .lpp-kyle {
    animation:
      lpp-kyle-enter 600ms ease-out both,
      lpp-kyle-idle  3s ease-in-out 600ms infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    .lpp-kyle {
      animation: none;
      opacity: 1;
      transform: none;
    }
  }
`;

export default function LearningPlanPreparation({ status, error, onRetry }) {

  if (status === "error") {
    return (
      <div className="absolute inset-0 z-50 flex flex-col items-center justify-center p-6 bg-[#001D32]">
        <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-lg border border-slate-100 max-w-md w-full text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-2xl font-bold mb-3 text-[#001D32]">
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
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center bg-[#07131D] text-white overflow-y-auto px-4 py-12">
      <style>{KYLE_STYLES}</style>

      <div className="w-full max-w-[430px] flex flex-col items-center flex-grow">

        {/* Illustration — final Figma SVG, animated */}
        <div className="lpp-kyle w-64 h-64 mb-8 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={LAPTOP_KYLE_SRC}
            alt="Kyle preparing your learning plan"
            width={256}
            height={256}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Heading & Progress */}
        <h2 className="text-[22px] sm:text-2xl font-medium mb-3 text-center">
          Building your path...
        </h2>

        {/* Indeterminate bar — no numeric percentage; progress is not measured */}
        <div className="w-full mb-12 px-2">
          <div className="flex-grow h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#00A9FF] rounded-full animate-[loading-slide_1.6s_ease-in-out_infinite]"
              style={{ width: "45%" }}
            />
          </div>
        </div>

        {/* Benefits */}
        <div className="w-full flex flex-col gap-3">
          <div className="bg-[#102235] border border-slate-700/50 rounded-2xl p-5 flex items-center gap-4">
            <svg className="w-6 h-6 text-[#00A9FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="font-semibold text-[15px]">No re-learning what you already know</span>
          </div>

          <div className="bg-[#102235] border border-slate-700/50 rounded-2xl p-5 flex items-center gap-4">
            <svg className="w-6 h-6 text-[#00A9FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-semibold text-[15px]">No gaps left to cost you an interview</span>
          </div>

          <div className="bg-[#102235] border border-slate-700/50 rounded-2xl p-5 flex items-center gap-4">
            <svg className="w-6 h-6 text-[#00A9FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="font-semibold text-[15px]">Built to end in one place: internship-ready</span>
          </div>
        </div>

      </div>
    </div>
  );
}
