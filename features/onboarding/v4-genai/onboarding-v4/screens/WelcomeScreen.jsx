"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import KiboBody from "@/features/kyle/pet/KiboBody";
import TextType from "@/components/ui/TextType";
import { useKiboEyeTracking } from "@/features/kyle/pet/useKiboEyeTracking";

import { useOnboardingStepTracker } from "@/lib/analytics/useOnboardingStepTracker";

const BG = "#FCF5EE";
const HEADING = "#001D32";

const WELCOME_CSS = `
@keyframes bubble-enter {
  0%   { opacity: 0; transform: translateY(16px) scale(0.95) rotate(-2deg); }
  100% { opacity: 1; transform: translateY(0) scale(1) rotate(0deg);    }
}
.welcome-bubble-animate {
  animation: bubble-enter 500ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

/* Quirky Bubble tail */
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
  border-top-color: #F8FCFF;
  border-bottom: 0;
}
`;

export default function WelcomeScreen({ onContinue }) {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0 = greet, 1 = hook
  const [isTyping, setIsTyping] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const eyesRef = useRef(null);
  const wrapperRef = useRef(null);
  const kiboContainerRef = useRef(null);

  // Activate Kibo eye tracking
  useKiboEyeTracking({ eyesRef, wrapperRef, active: true, trackFullPage: true });

  // PostHog Step 1 tracking (viewed, abandoned, completed)
  const { markStepCompleted } = useOnboardingStepTracker({
    stepId: "welcome",
    stepIndex: 1,
  });

  const isLastStep = step === 1;

  const handleContinue = () => {
    if (!isLastStep) {
      setStep(1);
      setIsTyping(true);
      return;
    }
    markStepCompleted();
    if (onContinue) {
      onContinue();
    } else {
      router.push("/onboarding");
    }
  };

  const handleTypingComplete = useCallback(() => {
    setIsTyping(false);
  }, []);

  return (
    <main
      className="h-dvh flex flex-col overflow-hidden"
      style={{ backgroundColor: BG }}
    >
      <style>{WELCOME_CSS}</style>

      {/* ── Zone 1: Top spacer ──────── */}
      <div className="flex-shrink-0 w-full px-4 sm:px-6 pt-5 pb-3">
        <div className="w-full max-w-[500px] mx-auto h-6" aria-hidden="true" />
      </div>

      {/* ── Zone 2: Mascot + bubble ─────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 sm:px-6">
        <div className="w-full max-w-[420px] mx-auto flex flex-col items-center">
          {/* Chat bubble */}
          <div
            key={step}
            className="relative mb-6 w-full flex justify-center welcome-bubble-animate"
          >
            <div
              className="kibo-bubble relative bg-[#F8FCFF] rounded-3xl border-2 border-[#00A9FF] shadow-[0_6px_24px_rgba(0,169,255,0.15)] px-8 py-5 max-w-[320px] text-center transition-all duration-300"
              role="status"
              aria-live="polite"
            >
              {step === 0 ? (
                <div
                  className="text-[18px] leading-snug font-bold"
                  style={{ color: HEADING }}
                >
                  <TextType
                    text="Hi, I'm Kibo!"
                    typingSpeed={40}
                    showCursor={false}
                    loop={false}
                    onSentenceComplete={handleTypingComplete}
                  />
                </div>
              ) : (
                <div
                  className="text-[17px] leading-relaxed font-medium"
                  style={{ color: HEADING }}
                >
                  <TextType
                    text="Let's make your "
                    typingSpeed={30}
                    showCursor={false}
                    loop={false}
                    as="span"
                  />
                  <TextType
                    text='"where do I even start?"'
                    typingSpeed={30}
                    initialDelay={750}
                    showCursor={false}
                    loop={false}
                    as="span"
                    className="font-extrabold text-[#00A9FF] relative inline-block mx-1"
                  />
                  <TextType
                    text=" problem disappear."
                    typingSpeed={30}
                    initialDelay={1470}
                    showCursor={false}
                    loop={false}
                    as="span"
                    onSentenceComplete={handleTypingComplete}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Kibo mascot */}
          <div
            ref={kiboContainerRef}
            className="relative select-none mt-2 transition-all duration-300 rounded-full cursor-pointer"
            style={{
              width: 140,
              height: 140,
              filter: isHovered
                ? "drop-shadow(0 0 16px rgba(6, 182, 212, 0.4))"
                : "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))",
            }}
            aria-label="Kibo, your AI learning companion"
            onPointerEnter={() => setIsHovered(true)}
            onPointerLeave={() => setIsHovered(false)}
            onClick={() => {
              // Add a playful hop when clicked
              if (wrapperRef.current) {
                wrapperRef.current.style.transition =
                  "transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)";
                wrapperRef.current.style.transform =
                  "translateY(-12px) scale(1.05)";
                setTimeout(() => {
                  if (wrapperRef.current) {
                    wrapperRef.current.style.transform =
                      "translateY(0) scale(1)";
                  }
                }, 200);
              }
            }}
          >
            <KiboBody
              visualState={isTyping ? "speaking" : "idle"}
              petSize={140}
              wrapperRef={wrapperRef}
              eyesRef={eyesRef}
            />
          </div>
        </div>
      </div>

      {/* ── Zone 3: Sticky footer ─────────────── */}
      <div
        className="flex-shrink-0 w-full border-t border-[#e8ddd4]"
        style={{ backgroundColor: BG }}
      >
        <div className="w-full max-w-[500px] mx-auto px-5 sm:px-6 py-4">
          <button
            onClick={handleContinue}
            className="w-full py-4 rounded-2xl text-white font-extrabold text-[16px] uppercase tracking-wide bg-[#00A9FF] hover:bg-[#0096e6] shadow-[0_4px_0_#007bcc] hover:shadow-[0_4px_0_#007bcc] hover:-translate-y-[1px] active:translate-y-[2px] active:shadow-[0_0px_0_#007bcc] transition-all"
          >
            Continue
          </button>
        </div>
      </div>
    </main>
  );
}
