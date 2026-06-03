'use client';

import React from 'react';
import { Leaf, Code, Zap } from 'lucide-react';
import Image from 'next/image';
import ProgressHeader from './components/ProgressHeader';

const OnboardingStepLevel = ({ onBack, onNext, selection, setSelection }) => {
  const options = [
    {
      id: 'beginner',
      title: 'Complete Beginner',
      icon: <Leaf className="text-[#16a34a]" size={24} />,
      bg: 'bg-[#d9f7e8]',
      borderActive: 'border-[#00a9ff]',
      cardActive: 'bg-[#f0faff] border-[#00a9ff]',
      cardInactive: 'bg-white border-[#ede8e1]',
    },
    {
      id: 'some_code',
      title: <>I&apos;ve written some code</>,
      icon: <Code className="text-[#d97706]" size={24} />,
      bg: 'bg-[#ffecd9]',
      borderActive: 'border-[#00a9ff]',
      cardActive: 'bg-[#f0faff] border-[#00a9ff]',
      cardInactive: 'bg-white border-[#ede8e1]',
    },
    {
      id: 'know_basics',
      title: 'I know basics, want structure',
      icon: <Zap className="text-[#db2777]" size={24} />,
      bg: 'bg-[#fde8f0]',
      borderActive: 'border-[#00a9ff]',
      cardActive: 'bg-[#f0faff] border-[#00a9ff]',
      cardInactive: 'bg-white border-[#ede8e1]',
    },
  ];

  const handleContinue = () => {
    if (selection) onNext();
  };

  return (
    <div className="w-full min-h-dvh max-w-md mx-auto flex flex-col bg-[#fcf5ee] font-sans relative">
      <ProgressHeader 
        currentStep="level" 
        codingLevel={selection || 'beginner'} 
        onBack={onBack} 
      />

      {/* HEADER SECTION */}
      <div className="mt-8 px-6 flex items-start gap-4">
        <div className="w-[64px] h-[64px] shrink-0 border-2 border-[#1e293b] rounded-xl bg-[#edeae2] flex flex-col items-center justify-between p-1 overflow-hidden">
          <div className="flex-1 flex items-center justify-center pt-1">
            <Image alt="Kyle Robot Mascot" className="w-9 h-9 object-contain" src="https://lh3.googleusercontent.com/aida/ADBb0uhm7k_FuO5l-pDmZI_sW4ke1q7jxG_zhrnlhxq8wIDLpY6kkP0fMPvzIAeoAljcolLH5IqH8klQchoKRtmf1_MzL2njPw3KcAp5wHc3wMYVxKfWZHtJbnuUJDs2OCd3ixRPCbONpeWYUThDtkRAPQgCPXl9v8Uovb0ikeQXPDIbj3eToR_ftdFcNu26KZagmj3maI9xGJwhZ-vxn9FsXM2qgiIbxBaKe54vhVf5Ohfg0yGg4wKUeRPdn9ZABC9P6VYanewmt6L5cw" width={36} height={36} unoptimized />
          </div>
        </div>
        <div className="relative bg-white border-[1.5px] border-[#e2e8f0] rounded-2xl p-4 flex-1">
          <div className="absolute left-[-10px] top-[19px] w-0 h-0 border-t-[9px] border-t-transparent border-b-[9px] border-b-transparent border-r-[9px] border-r-[#e2e8f0] z-0"></div>
          <div className="absolute left-[-8px] top-[20px] w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-white z-10"></div>
          <p className="text-[14px] font-medium text-[#19183b] leading-tight">
            Hey <span className="text-[#00a9ff]">Student</span>! Quick question before we begin
          </p>
        </div>
      </div>

      {/* QUESTION SECTION */}
      <div className="mt-10 px-6">
        <h1 className="text-[26px] font-bold text-[#19183b] leading-[1.2]">
          What&apos;s your current coding level?
        </h1>
      </div>

      {/* SELECTION CARDS */}
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

      {/* CTA BUTTON */}
      <div className="sticky bottom-0 left-0 w-full px-6 py-6 bg-linear-to-t from-[#fcf5ee] via-[#fcf5ee] to-transparent">
        <button
          onClick={handleContinue}
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

export default OnboardingStepLevel;
