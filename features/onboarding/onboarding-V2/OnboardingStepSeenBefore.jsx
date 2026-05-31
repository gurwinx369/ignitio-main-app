'use client';

import React from 'react';
import { Check, Terminal, Network, Webhook, Database, Link2, GitBranch, Layers, Box } from 'lucide-react';
import ProgressHeader from './components/ProgressHeader';

const OnboardingStepSeenBefore = ({ onBack, onNext, selection = [], setSelection }) => {
  const options = [
    { id: 'python', title: 'Python', icon: <Terminal className="text-slate-700" />, bg: 'bg-[#d9f7e8]' },
    { id: 'git', title: 'Git & GitHub', icon: <Network className="text-slate-700" />, bg: 'bg-[#d9ecff]' },
    { id: 'rest_apis', title: 'REST APIs', icon: <Webhook className="text-slate-700" />, bg: 'bg-[#ffecd9]' },
    { id: 'sql', title: 'SQL / Databases', icon: <Database className="text-slate-700" />, bg: 'bg-[#f0d9ff]' },
    { id: 'langchain', title: 'LangChain', icon: <Link2 className="text-slate-700" />, bg: 'bg-[#fde8f0]' },
    { id: 'langgraph', title: 'LangGraph', icon: <GitBranch className="text-slate-700" />, bg: 'bg-[#fff3d9]' },
    { id: 'react_next', title: 'React / Next.js', icon: <Layers className="text-slate-700" />, bg: 'bg-[#d9f0ff]' },
    { id: 'docker', title: 'Docker', icon: <Box className="text-slate-700" />, bg: 'bg-[#e8f7d9]' },
  ];

  const toggleSelection = (id) => {
    if (selection.includes(id)) {
      setSelection(selection.filter(item => item !== id));
    } else {
      setSelection([...selection, id]);
    }
  };

  const handleContinue = () => {
    onNext();
  };

  return (
    <div className="w-full min-h-dvh max-w-md mx-auto flex flex-col bg-[#fcf5ee] font-sans relative">
      <ProgressHeader 
        currentStep="seenBefore" 
        codingLevel="know_basics" 
        onBack={onBack} 
      />

      <section className="px-6 mt-4 mb-6">
        <h1 className="text-[26px] font-bold text-[#19183b] leading-tight mb-2">Which of these have you actually used?</h1>
        <p className="text-[13px] text-slate-500 font-normal">Pick everything that applies — no wrong answers.</p>
      </section>

      <div className="px-6 grid grid-cols-2 gap-[10px] pb-32 flex-1 overflow-y-auto">
        {options.map((opt) => {
          const isSelected = selection.includes(opt.id);
          return (
            <div
              key={opt.id}
              onClick={() => toggleSelection(opt.id)}
              className={`relative bg-white border-2 rounded-[16px] p-5 flex flex-col items-center justify-center aspect-square shadow-[0_2px_10px_rgba(0,0,0,0.055)] cursor-pointer transition-all ${
                isSelected ? 'border-[#00a9ff] bg-[#f0faff]' : 'border-[#ede8e1]'
              }`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 w-[20px] h-[20px] bg-[#00a9ff] rounded-full flex items-center justify-center">
                  <Check className="text-white" size={14} strokeWidth={3} />
                </div>
              )}
              <div className={`w-[44px] h-[44px] rounded-2xl flex items-center justify-center mb-3 ${opt.bg}`}>
                {opt.icon}
              </div>
              <span className="font-bold text-[13px] text-[#19183b] text-center">{opt.title}</span>
            </div>
          );
        })}
      </div>

      <div className="sticky bottom-0 left-0 w-full px-6 py-6 bg-linear-to-t from-[#fcf5ee] via-[#fcf5ee] to-transparent flex flex-col items-center">
        <div className="bg-[#e8f7ff] rounded-full px-3 py-1 mb-4">
          <span className="font-bold text-[12px] text-[#00a9ff] tracking-wider">{selection.length} SELECTED</span>
        </div>
        <button
          onClick={handleContinue}
          className="w-full h-14 bg-[#00a9ff] rounded-[30px] flex items-center justify-center shadow-[0_5px_0px_#0085cc] active:translate-y-[4px] active:shadow-none transition-all"
        >
          <span className="font-bold text-[16px] text-white">Continue -&gt;</span>
        </button>
      </div>
    </div>
  );
};

export default OnboardingStepSeenBefore;
