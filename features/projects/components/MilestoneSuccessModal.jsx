"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, Trophy, BookOpenCheck, CheckCircle } from "lucide-react";

export default function MilestoneSuccessModal({
  isOpen,
  milestone,
  isProjectComplete = false,
  onProceed,
  isSubmitting = false,
}) {
  const [reflectionAnswer, setReflectionAnswer] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onProceed) {
      onProceed(reflectionAnswer);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-[#19183B]/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-[#DFC8B5] bg-white p-6 shadow-2xl"
        >
          {/* Top Decorative Sparkles */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#00A9FF] to-cyan-300 text-white shadow-lg shadow-[#00A9FF]/30">
            {isProjectComplete ? (
              <Trophy className="h-8 w-8 animate-bounce" />
            ) : (
              <CheckCircle className="h-8 w-8" />
            )}
          </div>

          <div className="mt-4 text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800">
              <CheckCircle className="h-3.5 w-3.5" />
              <span>{isProjectComplete ? "Project Completed" : "Milestone Verified"}</span>
            </div>

            <h2 className="mt-3 text-xl font-black text-[#19183B]">
              {isProjectComplete
                ? "🎉 Project Mastered!"
                : `Milestone ${milestone?.milestoneId || 1} Complete!`}
            </h2>

            <p className="mt-1 text-xs font-medium text-slate-600">
              {isProjectComplete
                ? "Incredible work! You built a complete, working software project from scratch."
                : "Tests passed cleanly! You've conquered this milestone."}
            </p>
          </div>

          {/* Metacognitive Reflection Question */}
          {milestone?.reflectionPrompt && (
            <form onSubmit={handleSubmit} className="mt-5 space-y-3">
              <div className="rounded-2xl border border-[#DFC8B5]/80 bg-[#FCF5EE] p-3.5 text-left">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#19183B]">
                  <BookOpenCheck className="h-4 w-4 text-[#00A9FF]" />
                  <span>Metacognitive Check-in:</span>
                </div>
                <p className="mt-1 text-xs font-medium text-slate-700">
                  {milestone.reflectionPrompt}
                </p>
                <textarea
                  value={reflectionAnswer}
                  onChange={(e) => setReflectionAnswer(e.target.value)}
                  placeholder="In a sentence or two, what is the core reason? (Optional)"
                  rows={3}
                  className="mt-2.5 w-full rounded-xl border border-[#DFC8B5] bg-white p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-[#00A9FF] focus:outline-none focus:ring-1 focus:ring-[#00A9FF]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#00A9FF] py-3 text-sm font-extrabold text-white shadow-[0_4px_0_#0085C7] transition-all hover:bg-[#0098e6] active:translate-y-[2px] active:shadow-none disabled:opacity-50"
              >
                <span>{isSubmitting ? "Saving..." : isProjectComplete ? "Complete & Return to Catalog" : "Next Milestone"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}

          {!milestone?.reflectionPrompt && (
            <div className="mt-6">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#00A9FF] py-3 text-sm font-extrabold text-white shadow-[0_4px_0_#0085C7] transition-all hover:bg-[#0098e6] active:translate-y-[2px] active:shadow-none disabled:opacity-50"
              >
                <span>{isSubmitting ? "Saving..." : isProjectComplete ? "Return to Catalog" : "Next Milestone"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
