"use client";

import React, { useRef, useState, useEffect } from "react";
import KiboBody from "@/features/kyle/pet/KiboBody";
import TextType from "@/components/ui/TextType";
import { useKiboEyeTracking } from "@/features/kyle/pet/useKiboEyeTracking";

const CSS = `
@keyframes ob-header-in {
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.ob-header-in {
  animation: ob-header-in 360ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes ob-bubble-pop {
  0%   { opacity: 0; transform: scale(0.88) translateX(6px); }
  100% { opacity: 1; transform: scale(1) translateX(0); }
}
.ob-bubble-pop {
  animation: ob-bubble-pop 480ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

.ob-bubble-kibo::before {
  content: '';
  position: absolute;
  top: 50%;
  left: -12px;
  transform: translateY(-50%);
  border: 11px solid transparent;
  border-right-color: #00A9FF;
  border-left: 0;
}
.ob-bubble-kibo::after {
  content: '';
  position: absolute;
  top: 50%;
  left: -9px;
  transform: translateY(-50%);
  border: 10px solid transparent;
  border-right-color: #F0F9FF;
  border-left: 0;
}

@media (prefers-reduced-motion: reduce) {
  .ob-header-in, .ob-bubble-pop {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
`;

/**
 * OnboardingKiboHeader
 * Shared top bar across Free Path & Diagnostic screens:
 * - Persistent back button
 * - Animated progress bar
 * - Kibo avatar with eye-tracking & speaking animation
 * - Conversational speech bubble with typewriter text
 */
export default function OnboardingKiboHeader({
  currentStep = 1,
  totalSteps = 8,
  onBack,
  backDisabled = false,
  kiboMessage = "Let's calibrate your learning path!",
  petSize = 76,
  showKibo = true,
}) {
  const [isTyping, setIsTyping] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [textKey, setTextKey] = useState(0);

  const wrapperRef = useRef(null);
  const eyesRef = useRef(null);

  useKiboEyeTracking({
    eyesRef,
    wrapperRef,
    active: true,
    trackFullPage: true,
  });

  // Whenever the message changes, trigger speaking animation
  useEffect(() => {
    setIsTyping(true);
    setTextKey((k) => k + 1);
  }, [kiboMessage]);

  const fillPct = Math.min(
    100,
    Math.max(4, Math.round((currentStep / Math.max(totalSteps, 1)) * 100))
  );

  return (
    <header className="flex-shrink-0 w-full px-4 sm:px-6 pt-4 pb-2 ob-header-in">
      <style>{CSS}</style>

      {/* Top row: Back button + Progress bar */}
      <div className="w-full max-w-[500px] mx-auto flex items-center gap-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            disabled={backDisabled}
            aria-label="Go back"
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 active:bg-black/10 transition-colors text-[#001D32] flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
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
        )}

        <div
          className="relative h-[12px] sm:h-[14px] w-full rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={currentStep}
          aria-valuemin={0}
          aria-valuemax={totalSteps}
          aria-label={`Step ${currentStep} of ${totalSteps}`}
          style={{ backgroundColor: "rgba(0,169,255,0.13)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${fillPct}%`,
              background:
                "linear-gradient(90deg, #29b6f6 0%, #039be5 55%, #0277bd 100%)",
            }}
          />
        </div>
      </div>

      {/* Second row: Kibo Avatar + Speech Bubble */}
      {showKibo && (
        <div className="w-full max-w-[500px] mx-auto flex items-center gap-3 sm:gap-4 pt-3 pb-1">
          <div
            className="relative flex-shrink-0 select-none cursor-pointer"
            style={{
              width: petSize,
              height: petSize,
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
              petSize={petSize}
              wrapperRef={wrapperRef}
              eyesRef={eyesRef}
            />
          </div>

          <div className="ob-bubble-pop relative flex-1 min-w-0">
            <div
              className="ob-bubble-kibo relative bg-[#F0F9FF] rounded-2xl border-2 border-[#00A9FF] shadow-[0_4px_20px_rgba(0,169,255,0.12)] px-4 py-2.5 sm:py-3"
              role="status"
              aria-live="polite"
            >
              <p
                className="text-[14px] sm:text-[15px] leading-snug font-bold text-[#001D32]"
              >
                <TextType
                  key={textKey}
                  text={kiboMessage}
                  typingSpeed={20}
                  showCursor={false}
                  loop={false}
                  onSentenceComplete={() => setIsTyping(false)}
                />
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
