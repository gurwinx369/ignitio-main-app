"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home, Compass, Sparkles } from "lucide-react";
import { usePostHog } from "posthog-js/react";
import { useKiboEyeTracking } from "@/features/kyle/pet/useKiboEyeTracking";
import KiboParticles from "@/features/kyle/pet/KiboParticles";

const KIBO_404_CSS = `
@media (prefers-reduced-motion: no-preference) {
  .kibo-404-float {
    animation: kibo-404-floating 4s ease-in-out infinite;
  }
  .kibo-404-eyes-blink {
    animation: kibo-404-blink 4s 1.2s infinite;
  }
}

@keyframes kibo-404-floating {
  0%, 100% {
    transform: translateY(0px) scale(1);
  }
  50% {
    transform: translateY(-12px) scale(1.02);
  }
}

@keyframes kibo-404-blink {
  0%, 94%, 100% { opacity: 1; }
  96%, 98%      { opacity: 0; }
}

.kibo-404-pulse {
  animation: kibo-glow 3s ease-in-out infinite alternate;
}

@keyframes kibo-glow {
  0% {
    filter: drop-shadow(0 0 16px rgba(6, 182, 212, 0.25));
  }
  100% {
    filter: drop-shadow(0 0 28px rgba(6, 182, 212, 0.45));
  }
}
`;

const DEFAULT_MESSAGE =
  "Whoops! This coordinate drifted into deep space, or the page was moved. Don't worry, your progress is completely safe!";

const EASTER_EGG_MESSAGES = [
  "You found Kibo's secret orbital station! Click the button below to return home.",
  "Lost in the cosmos? Don't worry, every explorer takes an unexpected detour sometimes.",
  "Beep boop! Sensor scan complete: no broken code found, just an empty sector.",
  "Kibo is ready to navigate you back to your learning roadmap!",
];

export default function KiboNotFound() {
  const router = useRouter();
  const posthog = usePostHog();

  const [activeMessage, setActiveMessage] = useState(DEFAULT_MESSAGE);
  const [retroText, setRetroText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [celebrate, setCelebrate] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const wrapperRef = useRef(null);
  const eyesRef = useRef(null);

  // Check reduced motion preference
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);

    const handler = (e) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // PostHog Telemetry on mount
  useEffect(() => {
    try {
      if (posthog) {
        posthog.capture("page_not_found_viewed", {
          path: typeof window !== "undefined" ? window.location.pathname : "",
          referrer: typeof document !== "undefined" ? document.referrer : "",
          timestamp: new Date().toISOString(),
        });
      }
    } catch {
      // Telemetry failure should never break UI
    }
  }, [posthog]);

  // Activate eye tracking
  useKiboEyeTracking({
    eyesRef,
    wrapperRef,
    active: !reducedMotion,
    trackFullPage: true,
  });

  // Typewriter effect for speech bubble
  useEffect(() => {
    if (reducedMotion) {
      setRetroText(activeMessage);
      setIsTyping(false);
      return;
    }

    let i = 0;
    setRetroText("");
    setIsTyping(true);

    const interval = setInterval(() => {
      i++;
      setRetroText(activeMessage.slice(0, i));
      if (i >= activeMessage.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 28);

    return () => clearInterval(interval);
  }, [activeMessage, reducedMotion]);

  // Easter egg click on Kibo
  const handleKiboClick = useCallback(() => {
    setCelebrate(true);
    const nextMsg =
      EASTER_EGG_MESSAGES[
        Math.floor(Math.random() * EASTER_EGG_MESSAGES.length)
      ];
    setActiveMessage(nextMsg);

    setTimeout(() => {
      setCelebrate(false);
    }, 1500);
  }, []);

  return (
    <main className="relative flex min-h-[100dvh] w-full flex-col items-center justify-center overflow-hidden bg-[#0A0D18] px-4 py-12 text-slate-100 select-none">
      <style>{KIBO_404_CSS}</style>

      {/* Ambient background glows */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[120px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 h-[350px] w-[600px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[140px]"
        aria-hidden="true"
      />

      {/* Subtle Star Dust / Grid Background */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25"
        aria-hidden="true"
      />

      {/* Main Container */}
      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center text-center">
        {/* Background 404 Watermark */}
        <div
          className="pointer-events-none absolute -top-12 md:-top-16 left-1/2 -translate-x-1/2 text-8xl md:text-9xl font-black tracking-widest text-slate-800/30 select-none"
          aria-hidden="true"
        >
          404
        </div>

        {/* Status Pill */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-cyan-300 backdrop-blur-md shadow-sm shadow-cyan-900/30">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500" />
          </span>
          ORBIT LOST · STATUS 404
        </div>

        {/* Kibo Mascot Presentation */}
        <div className="relative my-4 flex items-center justify-center">
          <KiboParticles active={celebrate} />

          <button
            type="button"
            onClick={handleKiboClick}
            className={`group relative h-36 w-36 cursor-pointer md:h-44 md:w-44 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-4 focus-visible:ring-offset-[#0A0D18] rounded-full transition-transform duration-300 hover:scale-105 active:scale-95 ${
              reducedMotion ? "" : "kibo-404-float kibo-404-pulse"
            }`}
            aria-label="Kibo AI Companion. Click to inspect or cheer Kibo up."
          >
            <div
              ref={wrapperRef}
              className="kibo-wrapper relative h-full w-full"
            >
              {/* Body */}
              <img
                src="/kibo/kibo_body.svg"
                alt=""
                aria-hidden="true"
                draggable={false}
                className="absolute inset-0 h-full w-full object-contain pointer-events-none z-[1]"
              />

              {/* Animated Eyes */}
              <img
                ref={eyesRef}
                src="/kibo/kibo_eyes.svg"
                alt=""
                aria-hidden="true"
                draggable={false}
                className={`kibo-eyes absolute inset-0 h-full w-full object-contain pointer-events-none z-[2] ${
                  reducedMotion ? "" : "kibo-404-eyes-blink"
                }`}
              />
            </div>
          </button>
        </div>

        {/* Kibo Speech Bubble */}
        <div className="relative mt-2 mb-8 w-full max-w-lg">
          <div className="relative rounded-2xl border border-cyan-500/20 bg-slate-900/85 p-5 shadow-2xl shadow-cyan-950/40 backdrop-blur-md">
            {/* Speech bubble pointer arrow */}
            <div
              className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-t border-l border-cyan-500/20 bg-slate-900/90"
              aria-hidden="true"
            />

            <div className="flex items-start gap-3 text-left">
              <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-400">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
              <p
                className="font-mono text-sm md:text-[15px] font-medium leading-relaxed text-slate-200"
                aria-live="polite"
              >
                {retroText}
                {isTyping && (
                  <span className="inline-block animate-pulse text-cyan-400 font-bold ml-0.5">
                    |
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Action Buttons */}
        <div className="flex w-full flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Link
            href="/home"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] hover:shadow-cyan-500/40 active:scale-[0.98] sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0D18]"
          >
            <Home className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <button
            type="button"
            onClick={() => router.back()}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700/80 bg-slate-800/60 px-5 py-3.5 text-sm font-medium text-slate-300 backdrop-blur-sm transition-all hover:border-slate-600 hover:bg-slate-800 hover:text-white hover:scale-[1.02] active:scale-[0.98] sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0D18]"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </div>

        {/* Quick Recovery Links */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
          <span>Looking for something specific?</span>
          <Link
            href="/home"
            className="inline-flex items-center gap-1 text-cyan-400 transition-colors hover:text-cyan-300 hover:underline"
          >
            <Compass className="h-3.5 w-3.5" />
            My Roadmaps
          </Link>
          <span className="text-slate-600">·</span>
          <Link
            href="/welcome"
            className="text-cyan-400 transition-colors hover:text-cyan-300 hover:underline"
          >
            Explore Platform
          </Link>
        </div>
      </div>
    </main>
  );
}
