'use client';

import React from 'react';
import { Check, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import ProgressHeader from './components/ProgressHeader';

const OnboardingStepDailyTime = ({ onBack, onComplete, selection, setSelection, codingLevel }) => {
  const options = [
    {
      id: '30_min',
      title: '30 minutes',
      desc: 'Quick daily wins, steady progress',
      icon: '⚡',
      bg: 'bg-[#d9f7e8]',
    },
    {
      id: '1_2_hours',
      title: '1 – 2 hours',
      desc: 'The sweet spot for real momentum',
      icon: '🔥',
      bg: 'bg-[#ffecd9]',
    },
    {
      id: '2_plus_hours',
      title: '2+ hours',
      desc: 'Accelerated path, deep focus mode',
      icon: '🚀',
      bg: 'bg-[#fde8f0]',
    },
  ];

  const handleComplete = () => {
    if (selection) onComplete();
  };

  return (
    <div className="w-full min-h-dvh max-w-md mx-auto flex flex-col bg-[#fcf5ee] font-sans relative">
      <ProgressHeader 
        currentStep="dailyTime" 
        codingLevel={codingLevel || 'beginner'} 
        onBack={onBack} 
      />

      <section className="px-6 flex-1 overflow-y-auto pb-8">
        <section className="flex items-start gap-3 mt-4 mb-6">
          <div className="w-12 h-12 shrink-0 bg-[#edeae2] border-2 border-slate-700 rounded-2xl overflow-hidden shadow-sm flex items-center justify-center p-1">
            <Image alt="Kyle Avatar" className="w-full h-full object-contain" src="https://lh3.googleusercontent.com/aida/ADBb0uhm7k_FuO5l-pDmZI_sW4ke1q7jxG_zhrnlhxq8wIDLpY6kkP0fMPvzIAeoAljcolLH5IqH8klQchoKRtmf1_MzL2njPw3KcAp5wHc3wMYVxKfWZHtJbnuUJDs2OCd3ixRPCbONpeWYUThDtkRAPQgCPXl9v8Uovb0ikeQXPDIbj3eToR_ftdFcNu26KZagmj3maI9xGJwhZ-vxn9FsXM2qgiIbxBaKe54vhVf5Ohfg0yGg4wKUeRPdn9ZABC9P6VYanewmt6L5cw" width={48} height={48} unoptimized />
          </div>
          <div className="relative bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex-1">
            <div className="absolute left-[-8px] top-4 w-4 h-4 bg-white border-l border-b border-slate-200 rotate-45"></div>
            <p className="text-[14px] text-[#1e293b] leading-relaxed">
              Be honest — consistency beats intensity every time ⏱️
            </p>
          </div>
        </section>

        <div className="mb-8">
          <h1 className="text-[24px] font-bold text-[#19183b] leading-tight">How much time can you give daily?</h1>
          <p className="text-[13px] text-[#94a3b8] mt-2">Your roadmap will be paced around this.</p>
        </div>

        <div className="space-y-3.5">
          {options.map((opt) => {
            const isSelected = selection === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => setSelection(opt.id)}
                className={`group flex items-center h-[88px] w-full rounded-[16px] px-4 cursor-pointer transition-all duration-300 border-2 ${
                  isSelected 
                    ? 'bg-[#f0faff] border-[#00a9ff] shadow-[0_4px_12px_rgba(0,169,255,0.1)]' 
                    : 'bg-white border-[#e8e0d8] hover:border-[#00a9ff]'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${opt.bg}`}>
                  <span className="text-xl">{opt.icon}</span>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-[14px] text-[#1e293b]">{opt.title}</p>
                  <p className="text-[12px] text-[#74706a]">{opt.desc}</p>
                </div>
                {isSelected ? (
                  <div className="w-6 h-6 rounded-full bg-[#00a9ff] flex items-center justify-center">
                    <Check className="text-white" size={16} strokeWidth={3} />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-[#e8e0d8]"></div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-2 mt-8 mb-4">
          <span className="text-[14px]">🗓️</span>
          <p className="font-medium text-[12px] text-[#b0a89e]">Kyle will build your roadmap around this</p>
        </div>
      </section>

      <footer className="sticky bottom-0 left-0 w-full px-6 py-6 bg-linear-to-t from-[#fcf5ee] via-[#fcf5ee] to-transparent">
        <button
          onClick={handleComplete}
          disabled={!selection}
          className={`relative w-full h-16 rounded-full border-b-[6px] active:border-b-0 active:translate-y-[6px] transition-all duration-100 flex items-center justify-center group ${
            selection ? 'bg-[#00a9ff] border-[#0085cc]' : 'bg-gray-300 border-gray-400'
          }`}
        >
          <span className="font-bold text-white text-lg flex items-center gap-2">
            Complete Onboarding <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
          </span>
        </button>
      </footer>
    </div>
  );
};

export default OnboardingStepDailyTime;
