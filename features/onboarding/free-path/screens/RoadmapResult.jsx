"use client";

import { useState, useEffect } from "react";
import { SKILL_LABELS, SKILL_IDS } from "@/lib/onboarding/free-path-questions";

// Premium skills are always shown at the bottom — locked
const PREMIUM_SKILLS = [
  { id: "dsa", label: "DSA with C++", description: "Premium — unlocks after foundation", icon: "🏆" },
  { id: "gen_ai", label: "Gen AI with Python", description: "Premium — unlocks after foundation", icon: "🤖" },
];

const SKILL_ICONS = {
  [SKILL_IDS.GIT]: "🌿",
  [SKILL_IDS.PYTHON]: "🐍",
  [SKILL_IDS.PROMPT]: "✨",
  [SKILL_IDS.SYSTEM_DESIGN]: "🏗️",
};

const SKILL_DESCRIPTIONS = {
  [SKILL_IDS.GIT]: "Version control, branching, pull requests",
  [SKILL_IDS.PYTHON]: "Variables, functions, data structures",
  [SKILL_IDS.PROMPT]: "Output format, context, few-shot patterns",
  [SKILL_IDS.SYSTEM_DESIGN]: "Scalability, databases, tradeoffs",
};

function SkillCard({ skillId, index, path }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 120 + index * 100);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <div
      className="transition-all duration-500 ease-out"
      style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(12px)" }}
    >
      <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border-2 border-[#E2E8F0]">
        {/* Step number */}
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-[15px] text-white flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #00A9FF, #0277BD)" }}
        >
          {index + 1}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-lg" aria-hidden="true">{SKILL_ICONS[skillId]}</span>
            <p className="font-bold text-[14px] text-[#001D32]">{SKILL_LABELS[skillId]}</p>
          </div>
          <p className="text-[12px] text-slate-500 mt-0.5">{SKILL_DESCRIPTIONS[skillId]}</p>
        </div>

        {/* Unlock status */}
        {index === 0 ? (
          <span className="text-[11px] font-bold text-[#16A34A] bg-[#F0FDF4] px-2 py-1 rounded-full flex-shrink-0">
            Unlocked
          </span>
        ) : (
          <svg className="text-slate-300 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        )}
      </div>
    </div>
  );
}

function PremiumCard({ skill, delay }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      className="transition-all duration-500 ease-out"
      style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(12px)" }}
    >
      <div className="flex items-center gap-4 p-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 opacity-60">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg bg-slate-200 flex-shrink-0">
          {skill.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[14px] text-slate-400">{skill.label}</p>
          <p className="text-[12px] text-slate-400 mt-0.5">{skill.description}</p>
        </div>
        <svg className="text-slate-300 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>
    </div>
  );
}

/**
 * RoadmapResult — final confirmation before signup.
 *
 * Props:
 *   roadmap     — string[] of skillIds in order
 *   path        — "A" | "B" | "C"
 *   onContinue  — () => void (routes to auth)
 */
export default function RoadmapResult({ roadmap, path, onContinue }) {
  const [headlineVisible, setHeadlineVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeadlineVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  const daysEstimate = roadmap.length * 7; // ~7 days per skill, rough estimate

  return (
    <main
      className="min-h-dvh flex flex-col items-center px-5 py-10"
      style={{ backgroundColor: "#FCF5EE" }}
    >
      <div className="w-full max-w-sm flex flex-col gap-6">
        {/* Headline */}
        <div
          className="transition-all duration-500 ease-out"
          style={{ opacity: headlineVisible ? 1 : 0, transform: headlineVisible ? "translateY(0)" : "translateY(12px)" }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4 bg-[#E5F6FF] text-[#0288d1]">
            <span>🗺️</span>
            <span>Your {daysEstimate}-day roadmap</span>
          </div>
          <h1 className="text-[28px] font-black text-[#001D32] leading-[1.1] tracking-tight mb-2">
            {path === "B"
              ? "The full foundation — every skill, in order."
              : "Personalised to exactly what you need."}
          </h1>
          <p className="text-[14px] text-slate-500 leading-relaxed">
            {path === "B"
              ? "Nothing skipped — each level unlocks the next."
              : "Sign up to lock this in and start your first step."}
          </p>
        </div>

        {/* Free skill cards */}
        <div className="flex flex-col gap-3">
          {roadmap.map((skillId, i) => (
            <SkillCard key={skillId} skillId={skillId} index={i} path={path} />
          ))}
        </div>

        {/* Premium preview — always shown, always locked */}
        <div className="flex flex-col gap-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">
            Coming up — after foundation
          </p>
          {PREMIUM_SKILLS.map((skill, i) => (
            <PremiumCard
              key={skill.id}
              skill={skill}
              delay={200 + roadmap.length * 100 + i * 100}
            />
          ))}
        </div>

        {/* Signup CTA */}
        <button
          type="button"
          onClick={onContinue}
          className="w-full py-4 rounded-2xl text-white font-extrabold text-[16px] uppercase tracking-wide mt-2 transition-all active:scale-[0.98] focus-visible:outline-none"
          style={{ background: "linear-gradient(135deg, #00bfff, #0288d1)", boxShadow: "0 4px 0 #005fa3" }}
        >
          Create My Account →
        </button>

        <p className="text-center text-[12px] text-slate-400">
          Free to start · No credit card needed
        </p>
      </div>
    </main>
  );
}
