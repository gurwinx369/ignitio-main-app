"use client";

import { useState, useEffect } from "react";

export default function KnowledgeCheckScreen({ onKnowsSomething, onBeginner, onBack }) {
  const [selected, setSelected] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  const handleSelect = (value) => {
    setSelected(value);
    setTimeout(() => {
      if (value === "yes") onKnowsSomething();
      else onBeginner();
    }, 260);
  };

  return (
    <main
      className="min-h-dvh flex flex-col items-center justify-center px-5 py-10"
      style={{ backgroundColor: "#FCF5EE" }}
    >
      <div className="w-full max-w-sm">
        {/* Back */}
        <button
          type="button"
          onClick={onBack}
          aria-label="Go back"
          className="mb-8 w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors text-[#001D32]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>

        {/* Headline */}
        <div className="mb-10">
          <h1 className="text-[32px] font-black text-[#001D32] leading-[1.1] tracking-tight mb-3">
            Do you already know how to code at all?
          </h1>
          <p className="text-[14px] text-slate-500 font-medium leading-relaxed">
            Totally honest answer — this just changes whether we run a quick check first.
          </p>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-4">
          <button
            type="button"
            onClick={() => handleSelect("yes")}
            aria-pressed={selected === "yes"}
            className="w-full flex items-center gap-5 px-6 py-5 rounded-2xl border-2 text-left transition-all duration-150 focus-visible:outline-none"
            style={{
              borderColor: selected === "yes" ? "#00A9FF" : "#E2E8F0",
              backgroundColor: selected === "yes" ? "#E5F6FF" : "#FFFFFF",
            }}
          >
            <span className="text-3xl">💡</span>
            <div>
              <p className="font-bold text-[15px] text-[#001D32]">Yes, I know something</p>
              <p className="text-[13px] text-slate-500 mt-0.5">
                90-second quick check — personalises your roadmap
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleSelect("no")}
            aria-pressed={selected === "no"}
            className="w-full flex items-center gap-5 px-6 py-5 rounded-2xl border-2 text-left transition-all duration-150 focus-visible:outline-none"
            style={{
              borderColor: selected === "no" ? "#00A9FF" : "#E2E8F0",
              backgroundColor: selected === "no" ? "#E5F6FF" : "#FFFFFF",
            }}
          >
            <span className="text-3xl">🌱</span>
            <div>
              <p className="font-bold text-[15px] text-[#001D32]">No, I&apos;m a complete beginner</p>
              <p className="text-[13px] text-slate-500 mt-0.5">
                You get the full foundation — skip nothing
              </p>
            </div>
          </button>
        </div>
      </div>
    </main>
  );
}
