'use client';
import React from 'react';
import { Award } from 'lucide-react';

const OnboardingBadge = ({ profession, onNext }) => {
  return (
    <div className="w-full min-h-dvh max-w-md mx-auto flex flex-col bg-[#fcf5ee] font-sans relative items-center justify-center">
      <div className="flex flex-col items-center justify-center flex-1 px-6 w-full">
        <div className="w-32 h-32 rounded-full bg-[#f0faff] flex items-center justify-center shadow-[0_8px_30px_rgba(0,169,255,0.2)] mb-8">
            <Award className="text-[#00a9ff]" size={64} />
        </div>
        <h1 className="text-[32px] font-bold text-[#19183b] leading-[1.2] text-center mb-2">
          🎉 Badge Unlocked
        </h1>
        <p className="text-[18px] text-[#6b7280] text-center bg-white px-6 py-3 rounded-2xl border-2 border-[#ede8e1] shadow-sm">
          Profession: <strong className="text-[#00a9ff]">{profession}</strong>
        </p>
      </div>

      <div className="w-full px-6 py-6 bg-gradient-to-t from-[#fcf5ee] via-[#fcf5ee] to-transparent">
        <button
          onClick={onNext}
          className="w-full h-15 py-4 text-white font-extrabold text-[17px] transition-all flex items-center justify-center gap-2 rounded-full bg-[#00a9ff] shadow-[0_5px_0px_#0085cc] active:translate-y-[3px] active:shadow-[0_2px_0px_#0085cc]"
        >
          Continue →
        </button>
      </div>
    </div>
  );
};
export default OnboardingBadge;
