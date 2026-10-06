"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import KiboBody from "@/features/kyle/pet/KiboBody";
import TextType from "@/components/ui/TextType";
import { useKiboEyeTracking } from "@/features/kyle/pet/useKiboEyeTracking";

const BG = "#FCF5EE";
const HEADING = "#001D32";

const TOTAL_STEPS = 8;
const STEP_INDEX  = 6; // Notification Screen = step 6
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

@keyframes float-arrow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}
.arrow-bounce { animation: float-arrow 1.5s ease-in-out infinite; }

@media (prefers-reduced-motion: reduce) {
  .ob-chip-in, .ob-row-in, .ob-bubble-pop, .arrow-bounce { animation: none; opacity: 1; transform: none; }
}
`;

export default function NotificationScreen({ onAllow, onSkip }) {
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
    if (!selected) {
      onAllow(); // Default to triggering the prompt if they click continue without selecting
      return;
    }
    if (selected === "allow") onAllow();
    else onSkip();
  };

  return (
    <main className="h-dvh flex flex-col overflow-hidden" style={{ backgroundColor: BG }}>
      <style>{CSS}</style>

      {/* Progress Bar row */}
      <div className="flex-shrink-0 w-full px-5 sm:px-6 pt-5 pb-3">
        <div className="w-full max-w-[500px] mx-auto flex items-center gap-3">
          <div
            className="relative h-[14px] w-full rounded-full"
            role="progressbar"
            aria-valuenow={STEP_INDEX}
            aria-valuemin={0}
            aria-valuemax={TOTAL_STEPS}
            aria-label="Step 6"
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
                  text="I'll remind you to practice so it becomes a habit!"
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

      {/* Options - Duolingo fake prompt */}
      <div className="flex-1 overflow-y-auto px-5 sm:px-6 pb-6 pt-4 flex flex-col items-center">
        <div className="ob-chip-in relative w-full max-w-[340px] mx-auto bg-[#FFFAF6] border border-[#E8DDD4] rounded-xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.10)] flex flex-col gap-2" style={{ animationDelay: "150ms" }}>
          <div className="absolute top-3 right-3 text-[#9E9086] hover:text-[#001D32] cursor-pointer transition-colors" onClick={() => { handleSelect("block"); onSkip(); }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </div>
          <p className="text-[#001D32] text-[15px] font-medium leading-tight">ignitio.com wants to</p>
          <div className="flex items-center gap-3 mt-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#001D32">
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/>
            </svg>
            <span className="text-[#001D32] font-medium text-[15px]">Show notifications</span>
          </div>
          <div className="flex justify-end gap-2 mt-5">
            <button 
              type="button"
              className="px-4 py-2 rounded-lg font-extrabold text-[14px] text-[#9E9086] hover:bg-[#F0E8E0] transition-colors focus:outline-none"
              onClick={() => { handleSelect("block"); onSkip(); }}
            >
              BLOCK
            </button>
            <button 
              type="button"
              className="px-4 py-2 rounded-lg font-extrabold text-[14px] text-[#1CB0F6] hover:bg-[#EAF6FF] transition-colors focus:outline-none"
              onClick={() => { handleSelect("allow"); onAllow(); }}
            >
              ALLOW
            </button>
          </div>
          
          {/* Arrow pointing to ALLOW */}
          <div className="absolute -bottom-10 right-8 text-[#1CB0F6] text-2xl font-bold arrow-bounce pointer-events-none">
            ↑
          </div>
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
            className="w-full py-4 rounded-2xl text-white font-extrabold text-[16px] uppercase tracking-wide bg-[#00A9FF] hover:bg-[#0096e6] shadow-[0_4px_0_#007bcc] hover:shadow-[0_4px_0_#007bcc] hover:-translate-y-[1px] active:translate-y-[2px] active:shadow-[0_0px_0_#007bcc] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-[0_4px_0_#007bcc]"
          >
            Continue
          </button>
        </div>
      </div>
    </main>
  );
}
              
