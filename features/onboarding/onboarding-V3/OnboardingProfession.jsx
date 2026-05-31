'use client';
import React from 'react';
import { User, Briefcase, GraduationCap } from 'lucide-react';

const OnboardingProfession = ({ onNext, selection, setSelection }) => {
  const options = [
    {
      id: 'Student',
      title: 'Student',
      icon: <GraduationCap className="text-[#16a34a]" size={24} />,
      bg: 'bg-[#d9f7e8]',
      borderActive: 'border-[#00a9ff]',
      cardActive: 'bg-[#f0faff] border-[#00a9ff]',
      cardInactive: 'bg-white border-[#ede8e1]',
    },
    {
      id: 'Teacher',
      title: 'Teacher',
      icon: <User className="text-[#d97706]" size={24} />,
      bg: 'bg-[#ffecd9]',
      borderActive: 'border-[#00a9ff]',
      cardActive: 'bg-[#f0faff] border-[#00a9ff]',
      cardInactive: 'bg-white border-[#ede8e1]',
    },
    {
      id: 'Job Doing',
      title: 'Job Doing',
      icon: <Briefcase className="text-[#db2777]" size={24} />,
      bg: 'bg-[#fde8f0]',
      borderActive: 'border-[#00a9ff]',
      cardActive: 'bg-[#f0faff] border-[#00a9ff]',
      cardInactive: 'bg-white border-[#ede8e1]',
    },
  ];

  return (
    <div className="w-full min-h-dvh max-w-md mx-auto flex flex-col bg-[#fcf5ee] font-sans relative">
      <div className="mt-10 px-6">
        <h1 className="text-[26px] font-bold text-[#19183b] leading-[1.2]">
          Choose your profession
        </h1>
        <p className="mt-2 text-[16px] text-[#6b7280]">
          Tell us about yourself
        </p>
      </div>

      <div className="mt-6 px-6 flex flex-col gap-4 flex-1 overflow-y-auto pb-32">
        {options.map((opt) => {
          const isSelected = selection === opt.id;
          return (
            <div
              key={opt.id}
              onClick={() => setSelection(opt.id)}
              className={`flex items-center p-4 rounded-2xl border-2 transition-all cursor-pointer active:scale-[0.98] ${
                isSelected ? opt.cardActive + ' shadow-[0_4px_20px_rgba(0,169,255,0.15)]' : opt.cardInactive
              }`}
            >
              <div className={`w-12 h-12 rounded-xl ${opt.bg} flex items-center justify-center shrink-0`}>
                {opt.icon}
              </div>
              <div className="ml-4 flex-1">
                <p className="text-[16px] font-bold text-[#19183b]">{opt.title}</p>
              </div>
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  isSelected ? 'border-[#00a9ff] bg-[#00a9ff]' : 'border-[#ede8e1]'
                }`}
              >
                {isSelected && <div className="w-2 h-2 rounded-full bg-white"></div>}
              </div>
            </div>
          );
        })}
      </div>

      <div className="sticky bottom-0 left-0 w-full px-6 py-6 bg-gradient-to-t from-[#fcf5ee] via-[#fcf5ee] to-transparent">
        <button
          onClick={() => selection && onNext()}
          disabled={!selection}
          className={`w-full h-15 py-4 text-white font-extrabold text-[17px] transition-all flex items-center justify-center gap-2 rounded-full ${
            selection ? 'bg-[#00a9ff] shadow-[0_5px_0px_#0085cc] active:translate-y-[3px] active:shadow-[0_2px_0px_#0085cc]' : 'bg-gray-300'
          }`}
        >
          Continue →
        </button>
      </div>
    </div>
  );
};
export default OnboardingProfession;
