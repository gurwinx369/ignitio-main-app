"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, ChevronDown, Lock, Unlock, Sparkles } from "lucide-react";

export default function GraduatedHintDrawer({
  milestoneId,
  hints = [],
  unlockedHints = [],
  onUnlockHint,
  isUnlocking = false,
}) {
  const [isOpen, setIsOpen] = useState(false);

  // Check if a hint is unlocked
  const isHintUnlocked = (level) => {
    return unlockedHints.some(
      (h) => h.milestoneId === milestoneId && h.hintLevel === level
    );
  };

  const highestUnlockedLevel = unlockedHints
    .filter((h) => h.milestoneId === milestoneId)
    .reduce((max, h) => Math.max(max, h.hintLevel), 0);

  const nextLevelToUnlock = highestUnlockedLevel + 1;
  const nextHint = hints.find((h) => h.level === nextLevelToUnlock);

  return (
    <div className="overflow-hidden rounded-2xl border border-[#DFC8B5] bg-white shadow-sm transition-all">
      {/* Header Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-[#FCF5EE]"
      >
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
            <Lightbulb className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#19183B]">
              <span>Graduated Hints</span>
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">
                {highestUnlockedLevel} / {hints.length} Unlocked
              </span>
            </div>
            <p className="text-[10px] font-medium text-slate-500">
              Need a nudge? Unlock clues without spoiling the solution.
            </p>
          </div>
        </div>

        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </motion.div>
      </button>

      {/* Accordion Content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="border-t border-[#DFC8B5]/60 bg-[#FCF5EE]/50 px-4 py-3"
          >
            <div className="space-y-2.5">
              {hints.map((hint) => {
                const unlocked = isHintUnlocked(hint.level);

                return (
                  <div
                    key={hint.level}
                    className={`rounded-xl border p-3 transition-all ${
                      unlocked
                        ? "border-amber-200 bg-amber-50/70"
                        : "border-slate-200 bg-slate-50/60 opacity-80"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-extrabold text-[#19183B]">
                      <div className="flex items-center gap-1.5">
                        {unlocked ? (
                          <Unlock className="h-3.5 w-3.5 text-amber-600" />
                        ) : (
                          <Lock className="h-3.5 w-3.5 text-slate-400" />
                        )}
                        <span>
                          Level {hint.level}:{" "}
                          {hint.level === 1
                            ? "Conceptual Clue"
                            : hint.level === 2
                            ? "Algorithm / Pseudocode"
                            : "Code Structure"}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">
                        {unlocked ? "Unlocked" : "Locked"}
                      </span>
                    </div>

                    {unlocked ? (
                      <div className="mt-2 text-xs font-medium leading-relaxed text-slate-800 whitespace-pre-wrap">
                        {hint.content}
                      </div>
                    ) : (
                      <div className="mt-1 text-[11px] italic text-slate-500">
                        Locked hint. Unlock to reveal subtle guidance.
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Unlock Next Hint CTA */}
              {nextHint && (
                <div className="pt-1">
                  <button
                    type="button"
                    disabled={isUnlocking}
                    onClick={() => onUnlockHint && onUnlockHint(nextHint.level)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-extrabold text-white shadow-[0_3px_0_#d97706] transition-all hover:bg-amber-600 active:translate-y-[2px] active:shadow-none disabled:opacity-50"
                  >
                    <Unlock className="h-3.5 w-3.5" />
                    <span>
                      {isUnlocking
                        ? "Unlocking..."
                        : `Reveal Hint ${nextHint.level}`}
                    </span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
