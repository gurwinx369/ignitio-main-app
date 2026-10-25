'use client';
/* eslint-disable @next/next/no-img-element */

import React, { useState } from 'react';
import { ArrowLeft, Play, Sparkles, Compass } from 'lucide-react';

const KIBO_LOCKED_CSS = `
@media (prefers-reduced-motion: no-preference) {
  .kibo-locked-float {
    animation: kibo-locked-floating 4s ease-in-out infinite;
  }
  .kibo-locked-eyes-blink {
    animation: kibo-locked-blink 4s 1.2s infinite;
  }
  .kibo-locked-pulse {
    animation: kibo-locked-glow 3s ease-in-out infinite alternate;
  }
}

@keyframes kibo-locked-floating {
  0%, 100% {
    transform: translateY(0px) scale(1);
  }
  50% {
    transform: translateY(-8px) scale(1.02);
  }
}

@keyframes kibo-locked-blink {
  0%, 94%, 100% { opacity: 1; }
  96%, 98%      { opacity: 0; }
}

@keyframes kibo-locked-glow {
  0% {
    filter: drop-shadow(0 8px 16px rgba(245, 158, 11, 0.15));
  }
  100% {
    filter: drop-shadow(0 14px 28px rgba(245, 158, 11, 0.35));
  }
}
`;

export default function KiboLockedLevel({
  currentLevel,
  dayNumber = 1,
  activeDayColor = '#f59e0b',
  lockedReason,
  roadmapTitle = 'Prompt Engineering',
  activeUnlockedLevel = null,
  onReturnToRoadmap,
  onGoToCurrentLesson,
}) {
  const [isWiggling, setIsWiggling] = useState(false);

  const handleKiboClick = () => {
    setIsWiggling(true);
    setTimeout(() => setIsWiggling(false), 600);
  };

  const lessonTitle = currentLevel?.name || currentLevel?.title || 'Locked Lesson';
  const hasActiveAlternative =
    Boolean(activeUnlockedLevel && activeUnlockedLevel.id !== currentLevel?.id);

  return (
    <div className="min-h-screen bg-[var(--color-primary)] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      <style>{KIBO_LOCKED_CSS}</style>

      {/* Ambient background accent glow */}
      <div
        className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl opacity-30"
        style={{ background: activeDayColor }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-40 -right-40 w-96 h-96 rounded-full blur-3xl opacity-20"
        style={{ background: '#f59e0b' }}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-lg bg-white/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-amber-200/60 shadow-[0_20px_60px_-15px_rgba(217,119,6,0.15)] text-center transition-all">
        {/* Top Floating Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200/80 rounded-full text-amber-800 text-xs font-semibold uppercase tracking-wider mb-5 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          Day {dayNumber} Lesson Locked
        </div>

        {/* Kibo Mascot Area */}
        <div className="relative flex items-center justify-center mb-4">
          <button
            type="button"
            onClick={handleKiboClick}
            className={`group relative h-28 w-28 sm:h-32 sm:w-32 cursor-pointer focus:outline-hidden rounded-full transition-transform duration-300 hover:scale-105 active:scale-95 ${
              isWiggling ? 'animate-bounce' : 'kibo-locked-float kibo-locked-pulse'
            }`}
            aria-label="Kibo, your learning companion. Click to interact."
          >
            {/* Body */}
            <img
              src="/kibo/kibo_body.svg"
              alt=""
              aria-hidden="true"
              draggable={false}
              className="absolute inset-0 h-full w-full object-contain pointer-events-none z-1"
            />

            {/* Animated Eyes */}
            <img
              src="/kibo/kibo_eyes.svg"
              alt=""
              aria-hidden="true"
              draggable={false}
              className="kibo-locked-eyes-blink absolute inset-0 h-full w-full object-contain pointer-events-none z-2"
            />
          </button>
        </div>

        {/* Kibo Speech Bubble */}
        <div className="relative mt-1 mb-6 w-full">
          <div className="relative rounded-2xl border border-amber-200/80 bg-amber-50/70 p-4 sm:p-5 shadow-sm text-left">
            {/* Speech bubble pointer arrow */}
            <div
              className="absolute -top-2 left-1/2 h-3.5 w-3.5 -translate-x-1/2 rotate-45 border-t border-l border-amber-200/80 bg-amber-50"
              aria-hidden="true"
            />

            <div className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-600">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-1 flex items-center gap-1.5">
                  Kibo says
                </div>
                <p className="text-sm text-slate-700 font-medium leading-relaxed">
                  &ldquo;Whoa there, adventurer! 🐾 This lesson is still locked on your path.
                  Complete the previous lesson first and we&apos;ll unlock this one together!&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Locked Lesson Details Preview */}
        <div className="bg-slate-50/80 border border-slate-200/70 rounded-2xl p-4 mb-6 text-left">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Target Lesson
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
            {lessonTitle}
          </h2>
          {currentLevel?.description && (
            <p className="text-xs text-slate-600 mt-1 line-clamp-2">
              {currentLevel.description}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {hasActiveAlternative && onGoToCurrentLesson && (
            <button
              type="button"
              onClick={onGoToCurrentLesson}
              className="w-full sm:flex-1 py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95 text-sm cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              Go to My Current Lesson
            </button>
          )}

          <button
            type="button"
            onClick={onReturnToRoadmap}
            className={`w-full ${
              hasActiveAlternative ? 'sm:flex-1' : ''
            } py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all active:scale-95 text-sm cursor-pointer`}
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Roadmap Canvas
          </button>
        </div>
      </div>
    </div>
  );
}
