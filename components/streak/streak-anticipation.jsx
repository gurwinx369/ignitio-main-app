"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import KiboBody from "@/features/kyle/pet/KiboBody";
import { useKiboEyeTracking } from "@/features/kyle/pet/useKiboEyeTracking";
import { SpeechBubble } from "./speech-bubble";
import { PendingCup } from "./pending-cup";
import { WeekRow } from "./week-row";
import { BrewCta } from "./brew-cta";

const MESSAGE = [
  { text: "Your first brew of the coffee streak is " },
  { text: "2 min away", highlight: true },
  { text: ". Complete your " },
  { text: "first level", highlight: true },
  { text: " to have it." },
];
const MESSAGE_LENGTH = MESSAGE.reduce((n, s) => n + s.text.length, 0);

const Phase = Object.freeze({
  Dark: 0,
  Kibo: 1,
  Bubble: 2,
  Cup: 3,
  Week: 4,
  Cta: 5,
});

export function StreakAnticipation({ days = [], lessonHref }) {
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState(Phase.Dark);
  const [typing, setTyping] = useState(true);
  const [typedChars, setTypedChars] = useState(0);

  const eyesRef = useRef(null);
  const wrapperRef = useRef(null);

  useKiboEyeTracking({
    eyesRef,
    wrapperRef,
    active: phase >= Phase.Kibo,
    trackFullPage: true,
  });

  useEffect(() => {
    if (reduceMotion) {
      setPhase(Phase.Cta);
      setTyping(false);
      setTypedChars(MESSAGE_LENGTH);
      return;
    }
    const timers = [
      setTimeout(() => setPhase(Phase.Kibo), 150),
      setTimeout(() => setPhase(Phase.Bubble), 650),
      setTimeout(() => setTyping(false), 1450),
      setTimeout(() => setPhase(Phase.Cup), 2000),
      setTimeout(() => setPhase(Phase.Week), 2600),
      setTimeout(() => setPhase(Phase.Cta), 3200),
    ];
    return () => timers.forEach(clearTimeout);
  }, [reduceMotion]);

  useEffect(() => {
    if (typing || typedChars >= MESSAGE_LENGTH) return;
    const t = setTimeout(() => setTypedChars((c) => c + 1), 26);
    return () => clearTimeout(t);
  }, [typing, typedChars]);

  return (
    <main className="relative flex h-dvh flex-col items-center justify-center gap-[clamp(12px,3dvh,28px)] overflow-hidden bg-canvas px-4 py-[clamp(12px,3dvh,32px)] text-ink md:px-8">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(rgba(125,150,180,0.12)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
        <motion.div
          className="absolute -right-32 top-0 size-[460px] rounded-full bg-kibo/15 blur-[120px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase >= Phase.Kibo ? 1 : 0 }}
          transition={{ duration: 1.2 }}
        />
        <motion.div
          className="absolute left-[10%] top-[30%] size-[340px] rounded-full bg-brew/10 blur-[110px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase >= Phase.Cup ? 1 : 0 }}
          transition={{ duration: 1.2 }}
        />
      </div>

      <section
        aria-label="Your first streak"
        className="relative z-10 flex w-full max-w-3xl items-center gap-3 md:gap-6"
      >
        {/* Kibo — eye-tracking only, no jump */}
        <motion.div
          className="relative flex-shrink-0"
          style={{
            width: "clamp(84px,18dvh,140px)",
            height: "clamp(84px,18dvh,140px)",
          }}
          initial={{ opacity: 0, y: 30, scale: 0.7 }}
          animate={
            phase >= Phase.Kibo
              ? { opacity: 1, y: 0, scale: 1 }
              : { opacity: 0, y: 30, scale: 0.7 }
          }
          transition={{ type: "spring", stiffness: 220, damping: 18 }}
        >
          <KiboBody
            visualState={typing ? "speaking" : "idle"}
            petSize={140}
            wrapperRef={wrapperRef}
            eyesRef={eyesRef}
          />
        </motion.div>

        {/* Speech bubble — onboarding style */}
        <div className="min-w-0 flex-1">
          <SpeechBubble
            visible={phase >= Phase.Bubble}
            typing={typing}
            segments={MESSAGE}
            typedChars={typedChars}
          />
        </div>
      </section>

      <div className="relative z-10 mt-[clamp(8px,3dvh,24px)] flex justify-center">
        <PendingCup
          visible={phase >= Phase.Cup}
          peeking={false}
          eager={false}
          onPeekStart={() => {}}
          onPeekEnd={() => {}}
        />
      </div>

      <motion.section
        aria-labelledby="week-heading"
        className="relative z-10 w-full max-w-2xl rounded-3xl border-2 border-line bg-surface/70 px-4 py-3 backdrop-blur md:px-6 md:py-4"
        initial={{ opacity: 0, y: 24 }}
        animate={phase >= Phase.Week ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="mb-3">
          <h2
            id="week-heading"
            className="font-display text-lg font-bold md:text-xl"
          >
            <span className="text-muted-ink/50">0</span>
            <span className="mx-1.5 text-muted-ink/50">{"→"}</span>
            <span className="text-brew">1</span>
            <span>{" day streak"}</span>
          </h2>
          <p className="text-xs font-semibold text-muted-ink">
            {"Your first cup brews today. The rest are waiting for you."}
          </p>
        </div>
        <WeekRow days={days} visible={phase >= Phase.Week} />
      </motion.section>

      <div className="relative z-10 w-full">
        <BrewCta
          visible={phase >= Phase.Cta}
          onHoverStart={() => {}}
          onHoverEnd={() => {}}
          onStart={() => {}}
          href={lessonHref}
        />
      </div>
    </main>
  );
}
