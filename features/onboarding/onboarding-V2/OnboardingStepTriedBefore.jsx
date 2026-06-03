'use client';

import { Terminal, Globe, Book, Compass, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import ProgressHeader from './components/ProgressHeader';

const OnboardingStepTriedBefore = ({ onBack, onNext, selection, setSelection }) => {
  const options = [
    {
      id: 'python',
      title: 'Python scripts & programs',
      icon: <Terminal className="text-[#d97706]" size={24} />,
      bg: 'bg-[#ffecd9]',
    },
    {
      id: 'html_css',
      title: 'HTML & CSS websites',
      icon: <Globe className="text-[#2563eb]" size={24} />,
      bg: 'bg-[#d9ecff]',
    },
    {
      id: 'college',
      title: 'College assignments only',
      icon: <Book className="text-[#7c3aed]" size={24} />,
      bg: 'bg-[#f0d9ff]',
    },
    {
      id: 'explored',
      title: 'Just explored on my own',
      icon: <Compass className="text-[#16a34a]" size={24} />,
      bg: 'bg-[#e8f7d9]',
    },
  ];

  const handleContinue = () => {
    if (selection) onNext();
  };

  return (
    <div className="w-full min-h-dvh max-w-md mx-auto flex flex-col bg-[#fcf5ee] font-sans relative">
      <ProgressHeader 
        currentStep="triedBefore" 
        codingLevel="some_code" 
        onBack={onBack} 
      />

      <section className="px-6 py-4 flex items-start gap-3">
        <div className="w-[68px] h-[68px] bg-[#edeae2] border-2 border-[#1e293b] rounded-[16px] shrink-0 overflow-hidden flex items-center justify-center p-1">
          <Image alt="Robot character" className="w-10 h-10 object-contain" src="https://lh3.googleusercontent.com/aida/ADBb0uhm7k_FuO5l-pDmZI_sW4ke1q7jxG_zhrnlhxq8wIDLpY6kkP0fMPvzIAeoAljcolLH5IqH8klQchoKRtmf1_MzL2njPw3KcAp5wHc3wMYVxKfWZHtJbnuUJDs2OCd3ixRPCbONpeWYUThDtkRAPQgCPXl9v8Uovb0ikeQXPDIbj3eToR_ftdFcNu26KZagmj3maI9xGJwhZ-vxn9FsXM2qgiIbxBaKe54vhVf5Ohfg0yGg4wKUeRPdn9ZABC9P6VYanewmt6L5cw" width={40} height={40} unoptimized />
        </div>
        <div className="relative bg-white border-[1.5px] border-slate-200 rounded-[14px] px-4 py-3 self-center shadow-sm">
          <div className="absolute top-1/2 -left-[6px] -translate-y-1/2 w-3 h-3 bg-white border-l-[1.5px] border-b-[1.5px] border-slate-200 rotate-45"></div>
          <p className="text-[14px] font-medium text-[#19183b] leading-tight">
            Interesting! So what kind of stuff have you actually built?
          </p>
        </div>
      </section>

      <section className="px-6 mt-6 mb-4">
        <h1 className="text-[26px] font-bold text-[#19183b] leading-tight mb-1">
          What have you tried before?
        </h1>
        <p className="text-[13px] text-[#94a3b8] font-normal">
          Pick one that fits best.
        </p>
      </section>

      <section className="px-6 flex flex-col gap-[10px] flex-1 overflow-y-auto pb-32">
        {options.map((opt) => {
          const isSelected = selection === opt.id;
          return (
            <div
              key={opt.id}
              onClick={() => setSelection(opt.id)}
              className={`border-2 rounded-[16px] p-4 flex items-center gap-4 transition-all duration-300 ease-out active:scale-[0.98] cursor-pointer ${
                isSelected 
                  ? 'bg-[#f0faff] border-[#00a9ff] shadow-[0_4px_18px_rgba(0,169,255,0.14)]' 
                  : 'bg-white border-[#ede8e1] shadow-[0_2px_10px_rgba(0,0,0,0.055)]'
              }`}
            >
              <div className={`w-12 h-12 rounded-full ${opt.bg} flex items-center justify-center shrink-0`}>
                {opt.icon}
              </div>
              <p className="flex-1 text-[15px] font-semibold text-[#19183b]">{opt.title}</p>
              <div className={`w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-[#00a9ff] bg-[#00a9ff]' : 'border-[#ede8e1] bg-transparent'}`}>
                {isSelected && <div className="w-2 h-2 rounded-full bg-white"></div>}
              </div>
            </div>
          );
        })}
      </section>

      <footer className="sticky bottom-0 left-0 w-full px-6 py-6 bg-linear-to-t from-[#fcf5ee] via-[#fcf5ee] to-transparent">
        <button
          onClick={handleContinue}
          disabled={!selection}
          className={`w-full h-14 text-white text-[16px] font-bold transition-all duration-300 ease-out flex items-center justify-center gap-2 rounded-[30px] ${
            selection
              ? 'bg-[#00a9ff] shadow-[0_5px_0px_#0085cc] active:translate-y-1 active:shadow-none' 
              : 'bg-gray-300'
          }`}
        >
          Continue <ArrowRight size={20} />
        </button>
      </footer>
    </div>
  );
};

export default OnboardingStepTriedBefore;
