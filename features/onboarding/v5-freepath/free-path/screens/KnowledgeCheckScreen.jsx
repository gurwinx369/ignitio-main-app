"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import KiboBody from "@/features/kyle/pet/KiboBody";
import TextType from "@/components/ui/TextType";
import { useKiboEyeTracking } from "@/features/kyle/pet/useKiboEyeTracking";

const BG = "#FCF5EE";
const HEADING = "#001D32";

const TOTAL_STEPS = 8;
const STEP_INDEX  = 3; // Knowledge Check = step 3
const FILL_PCT    = Math.round((STEP_INDEX / TOTAL_STEPS) * 100);

const CSS = `
@keyframes ob-chip-in {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
.ob-chip-in { animation: ob-chip-in 360ms cubic-bezier(0.22,1,0.36,1) both; }

@keyframes ob-row-in {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
.ob-row-in { animation: ob-row-in 380ms cubic-bezier(0.22,1,0.36,1) both; }

@keyframes ob-bubble-pop {
  0%   { opacity: 0; transform: scale(0.88) translateX(6px); }
  100% { opacity: 1; transform: scale(1) translateX(0); }
}
.ob-bubble-pop { animation: ob-bubble-pop 480ms cubic-bezier(0.34,1.56,0.64,1) both; animation-delay: 60ms; }

/* Bubble tail */
.ob-bubble::before {
  content: '';
  position: absolute;
  top: 50%; left: -12px;
  transform: translateY(-50%);
  border: 11px solid transparent;
  border-right-color: #00A9FF;
  border-left: 0;
}
.ob-bubble::after {
  content: '';
  position: absolute;
  top: 50%; left: -9px;
  transform: translateY(-50%);
  border: 10px solid transparent;
  border-right-color: #F0F9FF;
  border-left: 0;
}

@media (prefers-reduced-motion: reduce) {
  .ob-chip-in, .ob-row-in, .ob-bubble-pop { animation: none; opacity: 1; }
}
`;

export default function KnowledgeCheckScreen({ onKnowsSomething, onBeginner, onBack }) {
  const [selected, setSelected] = useState(null);
  const [isTyping, setIsTyping] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [barWidth, setBarWidth] = useState(0);

  const eyesRef = useRef(null);
  const wrapperRef = useRef(null);

  useKiboEyeTracking({ eyesRef, wrapperRef, active: true, trackFullPage: true });

  useEffect(() => {
    const id = requestAnimationFrame(() => setBarWidth(FILL_PCT));
    return () => cancelAnimationFrame(id);
  }, []);

  const handleTypingDone = useCallback(() => setIsTyping(false), []);

  const handleSelect = (value) => {
    setSelected(value);
  };

  const handleContinue = () => {
    if (!selected) return;
    if (selected === "yes") onKnowsSomething();
    else onBeginner();
  };

  return (
    <main className="h-dvh flex flex-col overflow-hidden" style={{ backgroundColor: BG }}>
      <style>{CSS}</style>

      {/* Progress Bar with Back Button row */}
      <div className="flex-shrink-0 w-full px-5 sm:px-6 pt-5 pb-3">
        <div className="w-full max-w-[500px] mx-auto flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            aria-label="Go back"
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors text-[#001D32] flex-shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          
          <div
            className="relative h-[14px] w-full rounded-full"
            role="progressbar"
            aria-valuenow={STEP_INDEX}
            aria-valuemin={0}
            aria-valuemax={TOTAL_STEPS}
            aria-label="Step 3"
            style={{ backgroundColor: "rgba(0,169,255,0.13)" }}
          >
            <div
              className="absolute inset-y-0 left-0 rounded-full overflow-visible"
              style={{
                width: `${barWidth}%`,
                transition: "width 600ms cubic-bezier(0.22,1,0.36,1)",
                background: "linear-gradient(90deg, #29b6f6 0%, #039be5 55%, #0277bd 100%)",
              }}
            >
              {barWidth > 4 && (
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    top: "10%", left: "6%",
                    width: "clamp(18px,22%,60px)",
                    height: "55%",
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.52)",
                    filter: "blur(1px)",
                    pointerEvents: "none",
                    clipPath: "inset(0 0 0 0 round 999px)",
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Kibo + Bubble */}
      <div className="flex-shrink-0 px-5 sm:px-6 pt-1 pb-5">
        <div className="w-full max-w-[500px] mx-auto flex items-center gap-4 ob-row-in">
          <div
            className="relative flex-shrink-0 select-none cursor-pointer"
            style={{
              width: 84, height: 84,
              filter: isHovered
                ? "drop-shadow(0 0 14px rgba(6,182,212,0.5))"
                : "drop-shadow(0 4px 8px rgba(0,0,0,0.10))",
              transition: "filter 300ms",
            }}
            onPointerEnter={() => setIsHovered(true)}
            onPointerLeave={() => setIsHovered(false)}
            aria-label="Kibo"
          >
            <KiboBody
              visualState={isTyping ? "speaking" : "idle"}
              petSize={84}
              wrapperRef={wrapperRef}
              eyesRef={eyesRef}
            />
          </div>

          <div className="ob-bubble-pop relative flex-1 min-w-0">
            <div
              className="ob-bubble relative bg-[#F0F9FF] rounded-2xl border-2 border-[#00A9FF] shadow-[0_4px_20px_rgba(0,169,255,0.12)] px-4 py-3"
              role="status"
              aria-live="polite"
            >
              <div className="text-[15px] leading-snug font-bold" style={{ color: HEADING }}>
                <TextType
                  text="Do you already know how to code at all? This just changes whether we run a quick check first."
                  typingSpeed={26}
                  showCursor={false}
                  loop={false}
                  onSentenceComplete={handleTypingDone}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Options */}
      <div className="flex-1 overflow-y-auto px-5 sm:px-6 pb-6">
        <div className="w-full max-w-[500px] mx-auto flex flex-col gap-3">
          <button
            type="button"
            onClick={() => handleSelect("yes")}
            aria-pressed={selected === "yes"}
            className={[
              "ob-chip-in w-full text-left px-5 py-4 rounded-2xl border-2 select-none cursor-pointer",
              "font-semibold text-[15px] leading-snug focus-visible:outline-none",
              "transition-[border-color,background-color,box-shadow,transform] duration-100",
              "active:translate-y-[3px] active:shadow-none",
              selected === "yes"
                ? "border-[#00a9ff] bg-[#ddf2ff] text-[#001d32] shadow-[0_3px_0_#3081AD]"
                : "border-[#e5d5c5] bg-white text-[#1a2a3a] shadow-[0_3px_0_#FFDCBC]",
            ].join(" ")}
            style={{ animationDelay: "100ms" }}
          >
            Yes, I know something
          </button>

          <button
            type="button"
            onClick={() => handleSelect("no")}
            aria-pressed={selected === "no"}
            className={[
              "ob-chip-in w-full text-left px-5 py-4 rounded-2xl border-2 select-none cursor-pointer",
              "font-semibold text-[15px] leading-snug focus-visible:outline-none",
              "transition-[border-color,background-color,box-shadow,transform] duration-100",
              "active:translate-y-[3px] active:shadow-none",
              selected === "no"
                ? "border-[#00a9ff] bg-[#ddf2ff] text-[#001d32] shadow-[0_3px_0_#3081AD]"
                : "border-[#e5d5c5] bg-white text-[#1a2a3a] shadow-[0_3px_0_#FFDCBC]",
            ].join(" ")}
            style={{ animationDelay: "150ms" }}
          >
            No, I&apos;m a complete beginner
          </button>
        </div>
      </div>

      {/* Sticky footer */}
      <div
        className="flex-shrink-0 w-full border-t border-[#e8ddd4]"
        style={{ backgroundColor: BG }}
      >
        <div className="w-full max-w-[500px] mx-auto px-5 sm:px-6 py-4">
          <button
            onClick={handleContinue}
            disabled={!selected}
            className="w-full py-4 rounded-2xl text-white font-extrabold text-[16px] uppercase tracking-wide bg-[#00A9FF] hover:bg-[#0096e6] shadow-[0_4px_0_#007bcc] hover:shadow-[0_4px_0_#007bcc] hover:-translate-y-[1px] active:translate-y-[2px] active:shadow-[0_0px_0_#007bcc] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-[0_4px_0_#007bcc]"
          >
            Continue
          </button>
        </div>
      </div>
    </main>
  );
}
