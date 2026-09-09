'use client';

import React from 'react';
import { Terminal, Globe, Book, Compass } from 'lucide-react';
import Image from 'next/image';
import ProgressHeader from './components/ProgressHeader';

const OnboardingStepTriedBefore = ({ onBack, onNext, selection, setSelection }) => {
  const options = [
    {
      id: 'python',
      title: 'Python scripts & programs',
      icon: <Terminal size={20} className="text-[#d97706] shrink-0" />,
    },
    {
      id: 'html_css',
      title: 'HTML & CSS websites',
      icon: <Globe size={20} className="text-[#2563eb] shrink-0" />,
    },
    {
      id: 'college',
      title: 'College assignments only',
      icon: <Book size={20} className="text-[#7c3aed] shrink-0" />,
    },
    {
      id: 'explored',
      title: 'Just explored on my own',
      icon: <Compass size={20} className="text-[#16a34a] shrink-0" />,
    },
  ];

  const handleContinue = () => {
    if (selection) onNext();
  };

  return (
    <div className="w-full min-h-dvh max-w-md mx-auto flex flex-col bg-[#fcf5ee]">
      <ProgressHeader
        currentStep="triedBefore"
        codingLevel="some_code"
        onBack={onBack}
      />

      {/* Mascot chat bubble */}
      <div className="px-6 pt-2 pb-6 flex items-start gap-3">
        <div className="w-[52px] h-[52px] shrink-0 border-2 border-[#1e293b] rounded-2xl bg-[#edeae2] flex items-center justify-center overflow-hidden">
          <Image
            alt="Kyle Robot Mascot"
            src="https://lh3.googleusercontent.com/aida/ADBb0uhm7k_FuO5l-pDmZI_sW4ke1q7jxG_zhrnlhxq8wIDLpY6kkP0fMPvzIAeoAljcolLH5IqH8klQchoKRtmf1_MzL2njPw3KcAp5wHc3wMYVxKfWZHtJbnuUJDs2OCd3ixRPCbONpeWYUThDtkRAPQgCPXl9v8Uovb0ikeQXPDIbj3eToR_ftdFcNu26KZagmj3maI9xGJwhZ-vxn9FsXM2qgiIbxBaKe54vhVf5Ohfg0yGg4wKUeRPdn9ZABC9P6VYanewmt6L5cw"
            width={36}
            height={36}
            className="object-contain"
            unoptimized
          />
        </div>
        <div className="relative bg-white border border-[#e2e8f0] rounded-2xl px-4 py-3 flex-1 shadow-sm">
          <div className="absolute left-[-7px] top-4 w-3 h-3 bg-white border-l border-b border-[#e2e8f0] rotate-45" />
          <p className="text-[13px] font-medium text-[#19183b] leading-snug">
            Interesting! So what kind of stuff have you actually built?
          </p>
        </div>
      </div>

      {/* Question */}
      <div className="px-6 mb-2">
        <h1 className="text-[22px] font-bold text-[#19183b] leading-tight mb-1">
          What have you tried before?
        </h1>
        <p className="text-[13px] text-[#94a3b8]">Pick one that fits best.</p>
      </div>

      {/* Option chips — single column, one per line */}
      <div className="px-6 mt-5 flex flex-col gap-3 flex-1">
        {options.map((opt) => {
          const isSelected = selection === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setSelection(opt.id)}
              className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl border-2 text-left transition-all duration-200 active:scale-[0.98] ${
                isSelected
                  ? 'bg-[#e8f6ff] border-[#00a9ff] shadow-[0_2px_12px_rgba(0,169,255,0.12)]'
                  : 'bg-white border-[#e2ddd6]'
              }`}
            >
              {opt.icon}
              <span className="flex-1 text-[15px] font-semibold text-[#19183b]">
                {opt.title}
              </span>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  isSelected ? 'border-[#00a9ff] bg-[#00a9ff]' : 'border-[#ccc5bc]'
                }`}
              >
                {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* CTA — flat divider + full-width button */}
      <div className="w-full mt-auto">
        <div className="h-px bg-[#e8e0d8]" />
        <div className="px-6 py-5">
          <button
            onClick={handleContinue}
            disabled={!selection}
            className={`w-full py-4 rounded-2xl text-white font-bold text-[16px] tracking-wide transition-all duration-150 active:scale-[0.98] ${
              selection
                ? 'bg-[#00a9ff] shadow-[0_4px_0px_#0085cc] active:translate-y-[3px] active:shadow-none'
                : 'bg-[#d4cfc9] cursor-not-allowed'
            }`}
          >
            CONTINUE
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingStepTriedBefore;
