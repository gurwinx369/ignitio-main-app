"use client";

import { useState, useEffect } from "react";

const YEAR_OPTIONS = [
  { value: "1", label: "1st Year" },
  { value: "2", label: "2nd Year" },
  { value: "3", label: "3rd Year" },
  { value: "4", label: "4th Year" },
];

export default function YearScreen({ onNext, onBack }) {
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
      <div className="w-full max-w-sm">
        {/* Step indicator + back */}
        <div className="flex items-center justify-between mb-8">
          <button
            type="button"
            onClick={onBack}
            aria-label="Go back"
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors text-[#001D32]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <div className="flex gap-1.5">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="h-1.5 rounded-full"
                style={{
                  width: "24px",
                  backgroundColor: "#00A9FF",
                }}
              />
            ))}
          </div>
          <span className="text-xs font-semibold text-slate-400">Step 2 of 2</span>
        </div>

        {/* Headline */}
        <div className="mb-8">
          <h1 className="text-[32px] font-black text-[#001D32] leading-[1.1] tracking-tight mb-2">
            Which year are you in?
          </h1>
          <p className="text-[14px] text-slate-500 font-medium">
            This helps us gauge where you are in your learning journey.
          </p>
        </div>

        {/* Options — 2×2 grid */}
        <div className="grid grid-cols-2 gap-3">
          {YEAR_OPTIONS.map((opt) => {
            const isSelected = selected === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelect(opt.value)}
                aria-pressed={isSelected}
                className="w-full flex flex-col items-center justify-center py-8 rounded-2xl border-2 text-center transition-all duration-150 focus-visible:outline-none"
                style={{
                  borderColor: isSelected ? "#00A9FF" : "#E2E8F0",
                  backgroundColor: isSelected ? "#E5F6FF" : "#FFFFFF",
                }}
              >
                <span
                  className="text-[28px] font-black leading-none"
                  style={{ color: isSelected ? "#00A9FF" : "#001D32" }}
                >
                  {opt.value}
                </span>
                <span
                  className="text-[12px] font-semibold mt-1"
                  style={{ color: isSelected ? "#0288d1" : "#94A3B8" }}
                >
                  {opt.value === "1" ? "st" : opt.value === "2" ? "nd" : opt.value === "3" ? "rd" : "th"} Year
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </main>
  );
}
