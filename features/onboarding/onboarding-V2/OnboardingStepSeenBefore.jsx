'use client';

import React from 'react';
import { Check, Terminal, Network, Webhook, Database, Link2, GitBranch, Layers, Box } from 'lucide-react';
import ProgressHeader from './components/ProgressHeader';

const OnboardingStepSeenBefore = ({ onBack, onNext, selection = [], setSelection }) => {
  const options = [
    { id: 'python', title: 'Python', icon: <Terminal size={20} className="text-slate-600 shrink-0" /> },
    { id: 'git', title: 'Git & GitHub', icon: <Network size={20} className="text-slate-600 shrink-0" /> },
    { id: 'rest_apis', title: 'REST APIs', icon: <Webhook size={20} className="text-slate-600 shrink-0" /> },
    { id: 'sql', title: 'SQL / Databases', icon: <Database size={20} className="text-slate-600 shrink-0" /> },
    { id: 'langchain', title: 'LangChain', icon: <Link2 size={20} className="text-slate-600 shrink-0" /> },
    { id: 'langgraph', title: 'LangGraph', icon: <GitBranch size={20} className="text-slate-600 shrink-0" /> },
    { id: 'react_next', title: 'React / Next.js', icon: <Layers size={20} className="text-slate-600 shrink-0" /> },
    { id: 'docker', title: 'Docker', icon: <Box size={20} className="text-slate-600 shrink-0" /> },
  ];

  const toggleSelection = (id) => {
    if (selection.includes(id)) {
      setSelection(selection.filter((item) => item !== id));
    } else {
      setSelection([...selection, id]);
    }
  };

  return (
    <div className="w-full min-h-dvh max-w-md mx-auto flex flex-col bg-[#fcf5ee]">
      <ProgressHeader
        currentStep="seenBefore"
        codingLevel="know_basics"
        onBack={onBack}
      />

      {/* Question */}
      <div className="px-6 pt-2 mb-6">
        <h1 className="text-[22px] font-bold text-[#19183b] leading-tight mb-1">
          Which of these have you actually used?
        </h1>
        <p className="text-[13px] text-[#94a3b8]">Pick everything that applies — no wrong answers.</p>
      </div>

      {/* Option chips — single column, one per line */}
      <div className="px-6 flex flex-col gap-3 flex-1">
        {options.map((opt) => {
          const isSelected = selection.includes(opt.id);
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => toggleSelection(opt.id)}
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
                {isSelected && <Check size={11} className="text-white" strokeWidth={3} />}
              </div>
            </button>
          );
        })}
      </div>

      {/* CTA — flat divider + full-width button */}
      <div className="w-full mt-auto">
        {selection.length > 0 && (
          <p className="text-center text-[12px] font-bold text-[#00a9ff] mb-3">
            {selection.length} SELECTED
          </p>
        )}
        <div className="h-px bg-[#e8e0d8]" />
        <div className="px-6 py-5">
          <button
            onClick={onNext}
            className="w-full py-4 rounded-2xl text-white font-bold text-[16px] tracking-wide bg-[#00a9ff] shadow-[0_4px_0px_#0085cc] active:translate-y-[3px] active:shadow-none transition-all duration-150 active:scale-[0.98]"
          >
            CONTINUE
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingStepSeenBefore;
