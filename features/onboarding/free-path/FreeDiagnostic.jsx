"use client";

import { useState, useCallback } from "react";
import DiagnosticProgress from "@/features/onboarding/diagnostic/components/DiagnosticProgress";
import { FREE_PATH_QUESTIONS, SKILL_LABELS, SKILL_ORDER } from "@/lib/onboarding/free-path-questions";

// ── Skill section header shown before each group of 3 ──────────────────────
const SKILL_COLORS = {
  git: { bg: "#E8F4FD", accent: "#0288d1", emoji: "🌿" },
  python: { bg: "#FFF8E8", accent: "#F59E0B", emoji: "🐍" },
  prompt: { bg: "#F0FDF4", accent: "#16A34A", emoji: "✨" },
  system_design: { bg: "#F5F3FF", accent: "#7C3AED", emoji: "🏗️" },
};

function SkillBadge({ skillId }) {
  const color = SKILL_COLORS[skillId] ?? { bg: "#F1F5F9", accent: "#475569", emoji: "📚" };
  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
      style={{ backgroundColor: color.bg, color: color.accent }}
    >
      <span>{color.emoji}</span>
      <span>{SKILL_LABELS[skillId]}</span>
    </div>
  );
}

function CodeBlock({ code }) {
  if (!code) return null;
  return (
    <pre
      className="rounded-2xl border border-slate-200 bg-slate-900 text-slate-100 text-[13px] leading-relaxed p-4 overflow-x-auto whitespace-pre-wrap font-mono mb-2"
      aria-label="Code snippet"
    >
      {code}
    </pre>
  );
}

/**
 * Single card — question + option chips.
 * Auto-advances after selection (no explicit Continue needed for chip questions).
 */
function QuestionCard({ question, value, onChange, onAutoAdvance }) {
  const handleSelect = useCallback(
    (optionValue) => {
      onChange(optionValue);
      // Short delay so the user sees the selection before advancing
      setTimeout(() => onAutoAdvance(), 320);
    },
    [onChange, onAutoAdvance]
  );

  return (
    <div
      key={question.id}
      className="diag-free-enter w-full max-w-[500px] mx-auto px-5 sm:px-6 py-6 flex flex-col gap-5"
    >
      <SkillBadge skillId={question.skill} />

      <h2 className="font-bold text-[#001D32] text-[21px] leading-snug">
        {question.title}
      </h2>

      <CodeBlock code={question.code} />

      <div className="flex flex-col gap-3">
        {question.options.map((opt) => {
          const isSelected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleSelect(opt.value)}
              aria-pressed={isSelected}
              className="w-full text-left px-5 py-4 rounded-2xl border-2 text-[15px] font-medium transition-all duration-150 focus-visible:outline-none"
              style={{
                borderColor: isSelected ? "#00A9FF" : "#E2E8F0",
                backgroundColor: isSelected ? "#E5F6FF" : "#FFFFFF",
                color: isSelected ? "#001D32" : "#374151",
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * FreeDiagnostic — 12-card swipeable stack for the free-path skill check.
 *
 * Props:
 *   onComplete(answers) — called with { questionId: selectedValue } when all 12 answered
 */
export default function FreeDiagnostic({ onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  const currentQuestion = FREE_PATH_QUESTIONS[currentIndex];
  const total = FREE_PATH_QUESTIONS.length;

  // ponytail: no state machine needed — index + answers map is sufficient
  const handleChange = useCallback((value) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion?.id]: value }));
  }, [currentQuestion]);

  const advance = useCallback(() => {
    if (currentIndex >= total - 1) {
      onComplete(answers);
      return;
    }
    setCurrentIndex((i) => i + 1);
  }, [currentIndex, total, answers, onComplete]);

  const handleBack = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  };

  const currentValue = answers[currentQuestion?.id] ?? null;

  return (
    <main
      className="h-dvh flex flex-col overflow-hidden"
      style={{ backgroundColor: "#FCF5EE" }}
    >
      <style>{`
        @keyframes diag-free-enter {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .diag-free-enter { animation: diag-free-enter 280ms cubic-bezier(0.22,1,0.36,1) both; }
        @media (prefers-reduced-motion: reduce) {
          .diag-free-enter { animation: none; opacity: 1; transform: none; }
        }
      `}</style>

      {/* ── Zone 1: Top bar ─────────────────────────────────────────── */}
      <div className="flex-shrink-0 w-full px-4 sm:px-6 pt-4 pb-3">
        <div className="flex items-center gap-3 w-full max-w-[500px] mx-auto">
          {/* Back button */}
          <div className="w-10 flex-shrink-0">
            {currentIndex > 0 && (
              <button
                type="button"
                onClick={handleBack}
                aria-label="Go back"
                className="w-10 h-10 flex items-center justify-center rounded-full text-[#001D32] hover:bg-black/5 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
            )}
          </div>

          {/* Progress bar */}
          <div className="flex-1 min-w-0">
            <DiagnosticProgress
              current={currentIndex + 1}
              total={total}
            />
          </div>

          {/* Counter */}
          <span className="text-xs font-semibold text-slate-400 flex-shrink-0 tabular-nums">
            {currentIndex + 1}/{total}
          </span>
        </div>
      </div>

      {/* ── Zone 2: Scrollable question ──────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        {currentQuestion && (
          <QuestionCard
            key={currentQuestion.id}
            question={currentQuestion}
            value={currentValue}
            onChange={handleChange}
            onAutoAdvance={advance}
          />
        )}
      </div>

      {/* ── Zone 3: Sticky footer (shown only while waiting for a pick) ─ */}
      {!currentValue && (
        <div
          className="flex-shrink-0 w-full border-t border-[#e8ddd4]"
          style={{ backgroundColor: "#FCF5EE" }}
        >
          <div className="w-full max-w-[500px] mx-auto px-5 sm:px-6 py-4">
            <p className="text-center text-[13px] text-slate-400 font-medium">
              Pick an answer to continue
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
