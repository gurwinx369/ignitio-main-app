"use client";

import { useEffect, useState } from "react";
import { SKILL_LABELS } from "@/lib/onboarding/free-path-questions";

const VERDICT_CONFIG = {
  mastery: {
    label: "you've got this. Skipped.",
    icon: "✅",
    bg: "#F0FDF4",
    border: "#86EFAC",
    text: "#15803D",
    strikethrough: true,
  },
  developing: {
    label: "keeping this in. Gaps here compound later, so we're not skipping it.",
    icon: "📈",
    bg: "#EFF6FF",
    border: "#93C5FD",
    text: "#1D4ED8",
    strikethrough: false,
  },
  gap: {
    label: "keeping this in. The gaps that showed up here compound badly later, so we're not skipping it.",
    icon: "🔧",
    bg: "#FFF7ED",
    border: "#FCD34D",
    text: "#92400E",
    strikethrough: false,
  },
  insufficient: {
    label: "keeping this in — not enough data to skip it safely.",
    icon: "📋",
    bg: "#F8FAFC",
    border: "#CBD5E1",
    text: "#475569",
    strikethrough: false,
  },
};

function SkillResultRow({ skillId, verdict, delay }) {
  const [visible, setVisible] = useState(false);
  const config = VERDICT_CONFIG[verdict] ?? VERDICT_CONFIG.insufficient;

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      className="transition-all duration-500 ease-out"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
      }}
    >
      <div
        className="flex items-start gap-3 p-4 rounded-2xl border-2"
        style={{
          backgroundColor: config.bg,
          borderColor: config.border,
        }}
      >
        <span className="text-xl mt-0.5 flex-shrink-0" aria-hidden="true">
          {config.icon}
        </span>
        <div>
          <p className="font-bold text-[15px]" style={{ color: "#001D32" }}>
            <span
              style={
                config.strikethrough
                  ? { textDecoration: "line-through", opacity: 0.5 }
                  : {}
              }
            >
              {SKILL_LABELS[skillId]}
            </span>
          </p>
          <p className="text-[13px] mt-1 leading-snug" style={{ color: config.text }}>
            {config.label}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * RevealScreen — shown after Path C diagnostic.
 *
 * Props:
 *   results — Array<{ skillId, verdict, include }>
 *   onNext  — () => void
 */
export default function RevealScreen({ results, onNext }) {
  const [headlineVisible, setHeadlineVisible] = useState(false);
  const skipped = results.filter((r) => !r.include).length;

  useEffect(() => {
    const t = setTimeout(() => setHeadlineVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <main
      className="min-h-dvh flex flex-col items-center px-5 py-10"
      style={{ backgroundColor: "#FCF5EE" }}
    >
      <div className="w-full max-w-sm flex flex-col gap-6">
        {/* Headline */}
        <div
          className="transition-all duration-500 ease-out"
          style={{
            opacity: headlineVisible ? 1 : 0,
            transform: headlineVisible ? "translateY(0)" : "translateY(12px)",
          }}
        >
          <h1 className="text-[30px] font-black text-[#001D32] leading-[1.1] tracking-tight mb-2">
            {skipped > 0
              ? `Nice — ${skipped} skill${skipped > 1 ? "s" : ""} skipped.`
              : "Your roadmap is ready."}
          </h1>
          <p className="text-[14px] text-slate-500 leading-relaxed">
            {skipped > 0
              ? "We only keep what you actually need."
              : "Everything stayed in — each skill builds on the last."}
          </p>
        </div>

        {/* Skill result cards */}
        <div className="flex flex-col gap-3">
          {results.map((r, i) => (
            <SkillResultRow
              key={r.skillId}
              skillId={r.skillId}
              verdict={r.verdict}
              delay={200 + i * 120}
            />
          ))}
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={onNext}
          className="w-full py-4 rounded-2xl text-white font-extrabold text-[16px] uppercase tracking-wide mt-2 transition-all active:scale-[0.98] focus-visible:outline-none"
          style={{ background: "linear-gradient(135deg, #00bfff, #0288d1)", boxShadow: "0 4px 0 #005fa3" }}
        >
          Continue
        </button>
      </div>
    </main>
  );
}
