"use client";

import { useState, useRef, useCallback } from "react";
import KiboBody from "@/features/kyle/pet/KiboBody";
import TextType from "@/components/ui/TextType";
import { useKiboEyeTracking } from "@/features/kyle/pet/useKiboEyeTracking";

const BG = "#FCF5EE";
const HEADING = "#001D32";

const SHORTCUT_CSS = `
@keyframes sc-in {
  from { opacity: 0; transform: translateY(16px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
.sc-in {
  animation: sc-in 460ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes sc-bubble-pop {
  0%   { opacity: 0; transform: translateY(12px) scale(0.94); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}
.sc-bubble-pop {
  animation: sc-bubble-pop 480ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

@keyframes sc-perk-in {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
.sc-perk-in {
  animation: sc-perk-in 380ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

/* Kibo speech bubble tail pointing downwards to Kibo */
.kibo-bubble::before {
  content: '';
  position: absolute;
  bottom: -12px;
  left: 50%;
  transform: translateX(-50%);
  border: 11px solid transparent;
  border-top-color: #00A9FF;
  border-bottom: 0;
}
.kibo-bubble::after {
  content: '';
  position: absolute;
  bottom: -9px;
  left: 50%;
  transform: translateX(-50%);
  border: 10px solid transparent;
  border-top-color: #F0F9FF;
  border-bottom: 0;
}

@media (prefers-reduced-motion: reduce) {
  .sc-in, .sc-bubble-pop, .sc-perk-in {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
`;

export default function ShortcutScreen({ onFastTrack, onSeeBasics, onBack }) {
  const [visualState, setVisualState] = useState("speaking");
  const [isHovered, setIsHovered] = useState(false);

  const eyesRef = useRef(null);
  const wrapperRef = useRef(null);

  // Kibo eye tracking tracks user cursor/pointer across the screen
  useKiboEyeTracking({ eyesRef, wrapperRef, active: true, trackFullPage: true });

  const handleTypingDone = useCallback(() => {
    // When Kibo finishes speaking the proposal, trigger a happy reaction before settling to idle
    setVisualState("celebrating");
    const timer = setTimeout(() => {
      setVisualState("idle");
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleKiboTap = () => {
    // Playful micro-hop when user interacts with Kibo
    if (wrapperRef.current) {
      wrapperRef.current.style.transition = "transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1)";
      wrapperRef.current.style.transform = "translateY(-12px) scale(1.06)";
      setTimeout(() => {
        if (wrapperRef.current) {
          wrapperRef.current.style.transform = "translateY(0) scale(1)";
        }
      }, 200);
    }
  };

  return (
    <main
      className="min-h-dvh flex flex-col justify-between items-center px-5 py-6 sm:py-8 overflow-y-auto"
      style={{ backgroundColor: BG }}
    >
      <style>{SHORTCUT_CSS}</style>

      {/* ── Top Header / Navigation ── */}
      <div className="w-full max-w-[460px] flex items-center justify-between min-h-[40px]">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            aria-label="Go back"
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 active:scale-95 transition-all text-[#001D32] -ml-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
        ) : (
          <div className="w-10 h-10" />
        )}

        {/* Smart recognition pill badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E0F2FE] border border-[#BAE6FD] text-[#0284C7] text-[11px] font-extrabold uppercase tracking-wider shadow-sm">
          <span>⚡</span>
          <span>Fast-Track Recommended</span>
        </div>

        <div className="w-10 h-10" />
      </div>

      {/* ── Center Content: Chat Bubble + Kibo Tutor + Value Badges ── */}
      <div className="w-full max-w-[460px] flex flex-col items-center my-auto py-4">
        {/* Chat Bubble with persuasive AI tutor copy */}
        <div className="sc-bubble-pop w-full relative mb-7 flex justify-center">
          <div
            className="kibo-bubble relative w-full bg-[#F0F9FF] rounded-3xl border-2 border-[#00A9FF] shadow-[0_8px_30px_rgba(0,169,255,0.15)] px-6 py-5 text-center"
            role="status"
            aria-live="polite"
          >
            <h1
              className="text-[20px] sm:text-[22px] font-black leading-tight tracking-tight mb-2"
              style={{ color: HEADING }}
            >
              You&apos;re closer to internship-ready than you think.
            </h1>

            <p className="text-[14px] sm:text-[15px] font-semibold text-[#334E68] leading-relaxed">
              <TextType
                text="Want the fast track? We'll drop you straight into our Gen AI module — the most in-demand skill hiring managers look for right now."
                typingSpeed={22}
                loop={false}
                showCursor={false}
                onSentenceComplete={handleTypingDone}
              />
            </p>
          </div>
        </div>

        {/* AI Tutor Kibo Mascot */}
        <div className="sc-in flex flex-col items-center mb-6" style={{ animationDelay: "100ms" }}>
          <div
            className="relative select-none cursor-pointer rounded-full transition-[filter] duration-300"
            style={{
              width: 104,
              height: 104,
              filter: isHovered
                ? "drop-shadow(0 0 16px rgba(0, 169, 255, 0.45))"
                : "drop-shadow(0 6px 14px rgba(0, 169, 255, 0.18))",
            }}
            aria-label="Kibo, your AI tutor"
            onPointerEnter={() => setIsHovered(true)}
            onPointerLeave={() => setIsHovered(false)}
            onClick={handleKiboTap}
          >
            <KiboBody
              visualState={visualState}
              petSize={104}
              wrapperRef={wrapperRef}
              eyesRef={eyesRef}
            />
          </div>
          <span className="text-[12px] font-bold tracking-wide text-[#7C8B99] mt-2 select-none">
            Kibo • AI Tutor
          </span>
        </div>

        {/* Persuasive Value Highlights */}
        <div
          className="sc-perk-in w-full bg-white/80 backdrop-blur-sm border border-[#E5D5C5] rounded-2xl p-3.5 sm:p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col gap-2.5"
          style={{ animationDelay: "160ms" }}
        >
          <div className="flex items-center gap-3 text-left">
            <div className="w-7 h-7 rounded-lg bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center text-sm font-bold flex-shrink-0">
              ⚡
            </div>
            <p className="text-[13.5px] font-semibold text-[#001D32] leading-snug">
              Skip ~4 weeks of repetitive beginner syntax drills
            </p>
          </div>

          <div className="flex items-center gap-3 text-left">
            <div className="w-7 h-7 rounded-lg bg-[#FEF3C7] text-[#D97706] flex items-center justify-center text-sm font-bold flex-shrink-0">
              🚀
            </div>
            <p className="text-[13.5px] font-semibold text-[#001D32] leading-snug">
              Jump straight to building real-world Gen AI applications
            </p>
          </div>
        </div>
      </div>

      {/* ── Bottom Actions (Consistent with Free Path Design System) ── */}
      <div
        className="sc-in w-full max-w-[460px] flex flex-col gap-3 mt-4"
        style={{ animationDelay: "220ms" }}
      >
        {/* Primary CTA — Onboarding Free Path Continue Style */}
        <button
          type="button"
          onClick={onFastTrack}
          className="w-full py-4 rounded-2xl text-white font-extrabold text-[16px] uppercase tracking-wide bg-[#00A9FF] hover:bg-[#0096e6] shadow-[0_4px_0_#007bcc] hover:shadow-[0_4px_0_#007bcc] hover:-translate-y-[1px] active:translate-y-[2px] active:shadow-[0_0px_0_#007bcc] transition-all focus-visible:outline-none"
        >
          Continue with Fast-Track
        </button>

        {/* Secondary CTA — Fallback to basics knowledge check */}
        <button
          type="button"
          onClick={onSeeBasics}
          className="w-full py-3.5 rounded-2xl font-bold text-[15px] text-[#4B6375] bg-white border-2 border-[#E5D5C5] hover:border-[#00A9FF]/40 hover:bg-[#FAF8F5] shadow-[0_3px_0_#E8DDD4] active:translate-y-[2px] active:shadow-none transition-all focus-visible:outline-none"
        >
          No, show me the basics
        </button>
      </div>
    </main>
  );
}
