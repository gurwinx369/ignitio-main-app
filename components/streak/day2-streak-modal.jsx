"use client";

import React, { useState, useRef, useMemo } from "react";
import Image from "next/image";
import {
  Flame,
  Trophy,
  ShieldAlert,
  Check,
  ArrowRight,
  X,
  Sparkles,
} from "lucide-react";
import KiboBody from "@/features/kyle/pet/KiboBody";
import { useKiboEyeTracking } from "@/features/kyle/pet/useKiboEyeTracking";

const GOAL_OPTIONS = [
  {
    days: 7,
    title: "7-Day Sprint",
    subtitle: "Build initial momentum",
    badge: "Quick Win",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  },
  {
    days: 14,
    title: "14-Day Habit",
    subtitle: "Lock in daily coding consistency",
    badge: "Recommended ⭐",
    badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    popular: true,
  },
  {
    days: 24,
    title: "24-Day Mastery",
    subtitle: "Placement & interview ready",
    badge: "Pro Sprint",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  },
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Day2StreakModal({
  user,
  streak,
  onClose,
  onSuccess,
}) {
  const [selectedGoal, setSelectedGoal] = useState(streak?.targetGoal || 14);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stage, setStage] = useState("quiz"); // "quiz" | "timeline"

  const eyesRef = useRef(null);
  const wrapperRef = useRef(null);
  useKiboEyeTracking({
    eyesRef,
    wrapperRef,
    active: true,
    trackFullPage: true,
  });

  const isTodayCompleted = Boolean(
    streak?.todayCompleted ||
    streak?.status === "completed_today" ||
    streak?.status === "completed" ||
    streak?.week?.some((d) => d.isToday && (d.status === "completed_today" || d.status === "completed"))
  );

  // Calculate 7-day timeline adapting to whether today's lesson is already finished
  const timelineDays = useMemo(() => {
    const today = new Date();
    const todayIndex = today.getDay();
    return Array.from({ length: 7 }, (_, i) => {
      const dayOffset = isTodayCompleted ? i : i - 1;
      const dayIndex = (todayIndex + dayOffset + 70) % 7;
      return {
        label: DAY_NAMES[dayIndex],
        isDone: i === 0,
        isNext: i === 1,
        isToday: isTodayCompleted ? i === 0 : i === 1,
        dayNumber: i + 1,
      };
    });
  }, [isTodayCompleted]);

  const handleCommitGoal = async () => {
    setIsSubmitting(true);
    try {
      if (user) {
        const idToken = await user.getIdToken();
        const res = await fetch("/api/v2/user/streak/goal", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ targetGoal: selectedGoal }),
        });
        if (res.ok) {
          const data = await res.json();
          if (onSuccess) onSuccess(data.streak);
        }
      }
    } catch (err) {
      console.error("Failed to set streak goal:", err);
    } finally {
      setIsSubmitting(false);
      setStage("timeline");
    }
  };

  const handleStartLesson = () => {
    if (onClose) onClose();
    // Smooth scroll down to the roadmap on dashboard
    const roadmapEl = document.querySelector("#roadmap-worlds-carousel") || document.querySelector(".roadmap-card");
    if (roadmapEl) {
      roadmapEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div className="fixed inset-0 z-[200] isolate flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[#0e1027] text-white shadow-[0_24px_70px_rgba(0,0,0,0.7)] animate-in zoom-in-95 duration-300"
        style={{
          boxShadow: "0 0 60px -15px rgba(0, 169, 255, 0.2), 0 20px 40px rgba(0,0,0,0.8)",
        }}
      >
        {/* Subtle background glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 size-64 rounded-full bg-[#00A9FF]/15 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-20 -bottom-20 size-56 rounded-full bg-amber-500/10 blur-3xl"
        />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute right-4 top-4 z-20 flex size-8 items-center justify-center rounded-full bg-white/5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X className="size-4" />
        </button>

        {/* ── STAGE 1: QUIZ BOX (STREAK GOAL SELECTION) ── */}
        {stage === "quiz" && (
          <div className="flex flex-col p-6 sm:p-7">
            {/* Header with Kibo Avatar */}
            <div className="flex items-center gap-4 mb-4">
              <div
                ref={wrapperRef}
                className="relative flex-shrink-0"
                style={{ width: 68, height: 68 }}
              >
                <KiboBody
                  visualState="speaking"
                  petSize={68}
                  wrapperRef={wrapperRef}
                  eyesRef={eyesRef}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-bold text-amber-300 border border-amber-500/30 mb-1">
                  <Flame className="size-3.5 fill-amber-400 text-amber-400" />
                  Day 2 Unlocked
                </div>
                <h2 className="text-xl font-extrabold tracking-tight text-white">
                  Set Your Streak Target
                </h2>
                <p className="text-xs sm:text-sm text-white/60">
                  You conquered Day 1! How many days will you keep the flame alive?
                </p>
              </div>
            </div>

            {/* Goal Options */}
            <div className="flex flex-col gap-2.5 my-3">
              {GOAL_OPTIONS.map((opt) => {
                const isSelected = selectedGoal === opt.days;
                return (
                  <button
                    key={opt.days}
                    type="button"
                    onClick={() => setSelectedGoal(opt.days)}
                    className={`relative flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                      isSelected
                        ? "border-[#00A9FF] bg-[#00A9FF]/10 shadow-[0_0_20px_rgba(0,169,255,0.25)]"
                        : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex size-10 items-center justify-center rounded-xl font-extrabold text-sm ${
                          isSelected
                            ? "bg-[#00A9FF] text-white shadow-[0_2px_8px_rgba(0,169,255,0.4)]"
                            : "bg-white/10 text-white/70"
                        }`}
                      >
                        {opt.days}d
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm sm:text-base text-white">
                            {opt.title}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${opt.badgeColor}`}
                          >
                            {opt.badge}
                          </span>
                        </div>
                        <p className="text-xs text-white/50">{opt.subtitle}</p>
                      </div>
                    </div>

                    <div
                      className={`flex size-5 items-center justify-center rounded-full border-2 transition-colors ${
                        isSelected
                          ? "border-[#00A9FF] bg-[#00A9FF] text-white"
                          : "border-white/20"
                      }`}
                    >
                      {isSelected && <Check className="size-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Commit CTA */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleCommitGoal}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#00A9FF] px-6 py-4 text-base font-extrabold text-white shadow-[0_4px_0_#007bcc] hover:bg-[#0096e6] hover:-translate-y-px active:translate-y-[2px] active:shadow-none transition-all duration-150 cursor-pointer"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Saving Target...
                </span>
              ) : (
                <>
                  <span>Commit to {selectedGoal}-Day Streak</span>
                  <ArrowRight className="size-5" />
                </>
              )}
            </button>
          </div>
        )}

        {/* ── STAGE 2: 7-DAY CONTINUITY & STREAK BREAK ANIMATION ── */}
        {stage === "timeline" && (
          <div className="flex flex-col p-6 sm:p-7 animate-in fade-in zoom-in-95 duration-300">
            {/* Celebration Header */}
            <div className="flex items-center gap-3.5 mb-5">
              <div
                ref={wrapperRef}
                className="relative flex-shrink-0"
                style={{ width: 64, height: 64 }}
              >
                <KiboBody
                  visualState="celebrating"
                  petSize={64}
                  wrapperRef={wrapperRef}
                  eyesRef={eyesRef}
                />
              </div>

              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-300 border border-emerald-500/30 mb-1">
                  <Sparkles className="size-3.5 text-emerald-300" />
                  Goal Locked: {selectedGoal} Days!
                </div>
                <h3 className="text-xl font-extrabold text-white">
                  Your 7-Day Flame Runway
                </h3>
              </div>
            </div>

            {/* 7-Day Visual Sequence */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 mb-4">
              <div className="flex items-center justify-between text-xs font-bold text-white/50 mb-3 px-1">
                <span>PROGRESSION TIMELINE</span>
                <span className="text-[#00A9FF]">
                  {isTodayCompleted ? "Day 1 Complete • Next: Day 2" : "Day 2 Active"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-1 sm:gap-2">
                {timelineDays.map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center flex-1">
                    <span
                      className={`text-[11px] font-bold mb-1.5 ${
                        item.isToday
                          ? "text-[#00A9FF]"
                          : item.isDone
                            ? "text-emerald-400"
                            : "text-white/40"
                      }`}
                    >
                      {item.label}
                    </span>

                    {/* Day Cup Display */}
                    <div className="relative flex size-10 items-center justify-center">
                      {item.isDone ? (
                        <div className="relative">
                          <Image
                            src="/streak/streak_done.png"
                            alt="Day Complete"
                            width={32}
                            height={32}
                            className="size-8 object-contain drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                          />
                          <span className="absolute -bottom-1 -right-1 flex size-3.5 items-center justify-center rounded-full bg-emerald-500 text-white text-[9px] font-bold">
                            ✓
                          </span>
                        </div>
                      ) : item.isNext ? (
                        <div className="relative flex items-center justify-center">
                          {/* Pulsing glow aura */}
                          <span className="absolute inset-0 rounded-full bg-[#00A9FF]/40 animate-ping opacity-75" />
                          <Image
                            src="/streak/streak_pending_or_skipped.png"
                            alt={isTodayCompleted ? "Next Brew" : "Today Active"}
                            width={32}
                            height={32}
                            className="relative size-8 object-contain drop-shadow-[0_0_10px_rgba(0,169,255,0.7)] animate-bounce"
                            style={{ animationDuration: "2s" }}
                          />
                        </div>
                      ) : idx === 6 ? (
                        <div className="flex size-8 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300">
                          <Trophy className="size-4" />
                        </div>
                      ) : (
                        <div className="flex size-8 items-center justify-center rounded-xl border border-dashed border-white/20 text-white/20 text-xs font-mono">
                          {item.dayNumber}
                        </div>
                      )}
                    </div>

                    {/* Tag underneath */}
                    <span
                      className={`text-[9px] font-extrabold uppercase mt-1 tracking-wider ${
                        item.isDone
                          ? "text-emerald-400"
                          : item.isNext
                            ? "text-[#00A9FF]"
                            : "text-transparent"
                      }`}
                    >
                      {item.isDone
                        ? (item.isToday ? "TODAY" : "DONE")
                        : item.isNext
                          ? (isTodayCompleted ? "NEXT" : "TODAY")
                          : "·"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Streak Break Prevention Card */}
            <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 mb-5">
              <ShieldAlert className="size-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed text-amber-200">
                <strong className="block text-amber-300 font-bold mb-0.5">
                  Protect Your Streak Flame!
                </strong>
                {isTodayCompleted
                  ? "Awesome job finishing today! Keep your flame alive by coming back tomorrow for Day 2 before midnight."
                  : "If you don't complete your 5-minute lesson before midnight, your 2-day flame resets back to 0. Keep the momentum going!"}
              </div>
            </div>

            {/* Start Lesson CTA */}
            <button
              type="button"
              onClick={handleStartLesson}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#00A9FF] px-6 py-4 text-base font-extrabold text-white shadow-[0_4px_0_#007bcc] hover:bg-[#0096e6] hover:-translate-y-px active:translate-y-[2px] active:shadow-none transition-all duration-150 cursor-pointer"
            >
              <span>{isTodayCompleted ? "Continue Learning" : "Start Day 2 Lesson Now"}</span>
              <ArrowRight className="size-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
