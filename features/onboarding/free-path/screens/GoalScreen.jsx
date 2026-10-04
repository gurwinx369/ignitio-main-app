"use client";

import { useState, useEffect } from "react";

const GOAL_OPTIONS = [
  { value: "internship", label: "Get an internship", emoji: "🎯" },
  { value: "job", label: "Land a job", emoji: "💼" },
  { value: "project", label: "Build a project", emoji: "🛠️" },
  { value: "dsa", label: "Learn DSA properly", emoji: "📊" },
  { value: "gen_ai", label: "Get into Gen AI", emoji: "🤖" },
  { value: "unsure", label: "Honestly, I don't know yet", emoji: "🤔" },
];

export default function GoalScreen({ onNext }) {
  const [selected, setSelected] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  const handleSelect = (value) => {
    setSelected(value);
    setTimeout(() => onNext(value), 260);
  };

  return (
    <main
      className="min-h-dvh flex flex-col items-center px-5 py-10"
      style={{ backgroundColor: "#FCF5EE" }}
    >
      <style>{`
        @keyframes ob-in {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ob-in { animation: ob-in 420ms cubic-bezier(0.22,1,0.36,1) both; }
        @media (prefers-reduced-motion: reduce) {
          .ob-in { animation: none; opacity: 1; transform: none; }
        }
      `}</style>

      <div className="w-full max-w-sm">
        {/* Step indicator */}
        <div
          className="ob-in flex items-center gap-2 mb-8"
          style={{ animationDelay: "0ms" }}
        >
          <div className="flex gap-1.5">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: i === 0 ? "24px" : "8px",
                  backgroundColor: i === 0 ? "#00A9FF" : "#CBD5E1",
                }}
              />
            ))}
          </div>
          <span className="text-xs font-semibold text-slate-400">Step 1 of 2</span>
        </div>

        {/* Headline */}
        <div
          className="ob-in mb-8"
          style={{ animationDelay: "60ms" }}
        >
          <h1 className="text-[32px] font-black text-[#001D32] leading-[1.1] tracking-tight mb-2">
            What are you actually trying to do right now?
          </h1>
          <p className="text-[14px] text-slate-500 font-medium">
            This shapes your entire roadmap — pick what fits best.
          </p>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-3">
          {GOAL_OPTIONS.map((opt, i) => {
            const isSelected = selected === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelect(opt.value)}
                aria-pressed={isSelected}
                className="ob-in w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 text-left transition-all duration-150 focus-visible:outline-none"
                style={{
                  animationDelay: `${80 + i * 40}ms`,
                  borderColor: isSelected ? "#00A9FF" : "#E2E8F0",
                  backgroundColor: isSelected ? "#E5F6FF" : "#FFFFFF",
                }}
              >
                <span className="text-2xl" aria-hidden="true">{opt.emoji}</span>
                <span
                  className="text-[15px] font-bold"
                  style={{ color: isSelected ? "#001D32" : "#374151" }}
                >
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </main>
  );
}
