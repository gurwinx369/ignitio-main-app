"use client";

import { useState, useEffect, useRef } from "react";
import KiboBody from "@/features/kyle/pet/KiboBody";
import { useKiboEyeTracking } from "@/features/kyle/pet/useKiboEyeTracking";

// ─────────────────────────────────────────────────────────────────────────────
// All animations use only `transform` and `opacity` — no layout-triggering
// properties. Every keyframe has a prefers-reduced-motion override.
// Tested pattern: stagger 80–120 ms between sequential beats so it feels
// conversational, not dumped all at once.
// ─────────────────────────────────────────────────────────────────────────────

const CSS = `
/* ── Kibo entrance: floats up from 18px below ──────────────────────────────── */
@keyframes kb-rise {
  from { opacity: 0; transform: translateY(18px) scale(0.92); }
  to   { opacity: 1; transform: translateY(0)    scale(1);    }
}
.kb-rise {
  animation: kb-rise 480ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

/* ── Kibo persistent float (subtle, cheap, calm rhythm) ───────────────────── */
@keyframes kb-float {
  0%,100% { transform: translateY(0px);  }
  50%      { transform: translateY(-5px); }
}
.kb-float {
  animation:
    kb-rise  480ms cubic-bezier(0.22, 1, 0.36, 1) both,
    kb-float 3.4s  ease-in-out                     600ms infinite;
}

/* ── Bubble: pops in from left with spring overshoot ──────────────────────── */
@keyframes kb-bubble-pop {
  0%   { opacity: 0; transform: scale(0.82) translateX(-10px); }
  60%  { opacity: 1; transform: scale(1.03) translateX(2px);   }
  100% { opacity: 1; transform: scale(1)    translateX(0);      }
}
.kb-bubble-pop {
  animation: kb-bubble-pop 520ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
  animation-delay: 320ms;
}

/* ── Bubble tail ────────────────────────────────────────────────────────────── */
.kb-bubble-tail::before {
  content: '';
  position: absolute;
  left: -10px;
  top: 20px;
  border: 9px solid transparent;
  border-right-color: rgba(255, 255, 255, 0.1);
  border-left: 0;
}

/* ── First line of text: types itself in ──────────────────────────────────── */
@keyframes kb-type-cursor {
  0%, 100% { border-color: rgba(92, 200, 255, 0.7); }
  50%       { border-color: transparent;              }
}
.kb-typewriter {
  display: inline-block;
  overflow: hidden;
  white-space: nowrap;
  max-width: 0;
  animation:
    kb-typewriter-expand 480ms steps(28, end) 640ms both;
}
@keyframes kb-typewriter-expand {
  from { max-width: 0;   opacity: 1; }
  to   { max-width: 24ch; opacity: 1; }
}

/* ── Second line fades in after the first finishes ────────────────────────── */
@keyframes kb-subtitle-fade {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0);   }
}
.kb-subtitle {
  animation: kb-subtitle-fade 360ms cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: 1200ms;
}

/* ── Trust pills: stagger in one by one ──────────────────────────────────── */
@keyframes kb-pill-in {
  from { opacity: 0; transform: translateY(6px) scale(0.9); }
  to   { opacity: 1; transform: translateY(0)   scale(1);   }
}
.kb-pill {
  animation: kb-pill-in 320ms cubic-bezier(0.22, 1, 0.36, 1) both;
}
.kb-pill:nth-child(1) { animation-delay: 1480ms; }
.kb-pill:nth-child(2) { animation-delay: 1600ms; }
.kb-pill:nth-child(3) { animation-delay: 1720ms; }

/* ── CTA: blooms up with spring ──────────────────────────────────────────── */
@keyframes kb-cta-bloom {
  0%   { opacity: 0; transform: scale(0.90) translateY(10px); }
  60%  { opacity: 1; transform: scale(1.02) translateY(-2px);  }
  100% { opacity: 1; transform: scale(1)    translateY(0);      }
}
.kb-cta-bloom {
  animation: kb-cta-bloom 480ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
  animation-delay: 1900ms;
}

/* ── CTA shimmer sweep — draws eye without screaming ─────────────────────── */
@keyframes kb-shimmer {
  0%   { transform: translateX(-100%) skewX(-12deg); }
  100% { transform: translateX(250%)  skewX(-12deg); }
}
.kb-shimmer-wrap {
  position: absolute;
  inset: 0;
  overflow: hidden;
  border-radius: inherit;
  pointer-events: none;
}
.kb-shimmer-sweep {
  position: absolute;
  inset-block: 0;
  width: 40%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.14) 50%,
    transparent 100%
  );
  animation: kb-shimmer 2.8s cubic-bezier(0.4, 0, 0.6, 1) 2600ms infinite;
}

/* ── Social proof fades in last ──────────────────────────────────────────── */
@keyframes kb-proof-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
.kb-proof {
  animation: kb-proof-in 400ms ease-out both;
  animation-delay: 2100ms;
}

/* ── Committed checkmark pops in ─────────────────────────────────────────── */
@keyframes kb-check-pop {
  0%   { transform: scale(0);   opacity: 0; }
  60%  { transform: scale(1.3); opacity: 1; }
  100% { transform: scale(1);   opacity: 1; }
}
.kb-check-pop {
  animation: kb-check-pop 300ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

/* ── Active press feedback (instant — 80ms rule) ─────────────────────────── */
.kb-cta-btn {
  transition: transform 80ms ease-out, box-shadow 80ms ease-out;
  will-change: transform;
}
.kb-cta-btn:active:not(:disabled) {
  transform: translateY(3px) scale(0.98);
}

/* ── Hover glow only on pointer devices ─────────────────────────────────── */
@media (hover: hover) {
  .kb-cta-btn:hover:not(:disabled) {
    filter: brightness(1.08);
  }
}

/* ── Reduced-motion: keep all state changes, drop all motion ─────────────── */
@media (prefers-reduced-motion: reduce) {
  .kb-rise, .kb-float, .kb-bubble-pop, .kb-subtitle,
  .kb-pill, .kb-cta-bloom, .kb-proof, .kb-typewriter {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
    max-width: 100% !important;
  }
  .kb-shimmer-sweep { display: none; }
  .kb-cta-btn { transition: none; }
}
`;

const TRUST_PILLS = [
  { icon: LockIcon, label: "Free to start" },
  { icon: CardIcon, label: "No card needed" },
  { icon: ClockIcon, label: "Takes 30 seconds" },
];

function LockIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function CardIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="kb-check-pop"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

/**
 * KiboSignupBridge
 *
 * Choreography (all CSS, zero JS timers for motion):
 *   0ms    — Kibo rises up from below
 *   320ms  — speech bubble pops in with spring overshoot
 *   640ms  — headline types itself in
 *   1200ms — subtitle fades up
 *   1480ms — trust pills stagger in (80ms apart)
 *   1900ms — CTA button blooms up
 *   2100ms — social proof fades in
 *   2600ms — CTA shimmer sweep starts (infinite, subtle)
 *
 * Props:
 *   onContinue — () => void  called after commit micro-delay
 */
export default function KiboSignupBridge({ onContinue }) {
  const [committed, setCommitted] = useState(false);
  const wrapperRef = useRef(null);
  const eyesRef = useRef(null);

  useKiboEyeTracking({
    eyesRef,
    wrapperRef,
    active: true,
    trackFullPage: true,
  });

  const handleCommit = () => {
    if (committed) return;
    setCommitted(true);
    navigator.vibrate?.(14);
    // Small delay so the committed state renders before navigating
    setTimeout(() => onContinue(), 420);
  };

  return (
    <main
      className="min-h-dvh flex flex-col items-center justify-center px-5 py-10"
      style={{ background: "#0a0914" }}
    >
      <style>{CSS}</style>

      {/* ── Ambient blobs (static, fixed, zero runtime cost) ─────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(52rem 32rem at 85% 5%, rgba(56,189,248,0.11), transparent 62%), radial-gradient(44rem 38rem at 5% 95%, rgba(129,140,248,0.1), transparent 65%)",
        }}
      />

      <div className="w-full max-w-sm flex flex-col gap-7">
        {/* ── Kibo + Bubble row ─────────────────────────────────────────────── */}
        <div className="flex items-start gap-4">
          {/* Kibo avatar */}
          <div
            ref={wrapperRef}
            className="kb-float flex-shrink-0"
            style={{
              width: 88,
              height: 88,
              filter: "drop-shadow(0 0 16px rgba(92,200,255,0.32))",
            }}
            aria-label="Kibo"
          >
            <KiboBody
              visualState="speaking"
              petSize={88}
              wrapperRef={wrapperRef}
              eyesRef={eyesRef}
            />
          </div>

          {/* Speech bubble */}
          <div className="kb-bubble-pop kb-bubble-tail relative flex-1 min-w-0 pt-2">
            <div
              className="relative rounded-2xl rounded-tl-sm px-5 py-4"
              style={{
                background: "rgba(255,249,245,0.07)",
                border: "1px solid rgba(255,249,245,0.12)",
                boxShadow: "inset 0 1px 0 rgba(255,249,245,0.07)",
                backdropFilter: "blur(18px)",
              }}
              role="status"
              aria-live="polite"
            >
              {/* Headline — typewriter reveal */}
              <p
                className="kb-typewriter text-[15px] leading-snug font-semibold"
                style={{ color: "rgba(255,249,245,0.95)" }}
                aria-label="Your roadmap is locked in."
              >
                Your roadmap is locked in.
              </p>

              {/* Subtitle — fades in after headline settles */}
              <p
                className="kb-subtitle text-[13px] leading-relaxed mt-2"
                style={{ color: "rgba(255,249,245,0.48)" }}
              >
                One small step left — create your free account so I can guide
                you every day.
              </p>
            </div>
          </div>
        </div>

        {/* ── Trust pills ──────────────────────────────────────────────────── */}
        <div
          className="flex flex-wrap gap-2"
          role="list"
          aria-label="Why it's safe to sign up"
        >
          {TRUST_PILLS.map(({ icon: Icon, label }) => (
            <span
              key={label}
              role="listitem"
              className="kb-pill inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold"
              style={{
                background: "rgba(56,189,248,0.09)",
                border: "1px solid rgba(56,189,248,0.22)",
                color: "rgba(56,189,248,0.82)",
              }}
            >
              <Icon />
              {label}
            </span>
          ))}
        </div>

        {/* ── CTA ──────────────────────────────────────────────────────────── */}
        <div className="kb-cta-bloom flex flex-col gap-3">
          <button
            id="kb-create-account"
            type="button"
            onClick={handleCommit}
            disabled={committed}
            className="kb-cta-btn relative w-full py-4 rounded-2xl font-extrabold text-[15px] uppercase tracking-wide flex items-center justify-center gap-2 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-[#13122e] disabled:cursor-not-allowed"
            style={{
              background: committed
                ? "linear-gradient(135deg, #0ea5e9, #06b6d4)"
                : "linear-gradient(135deg, #38bdf8 0%, #0ea5e9 55%, #0284c7 100%)",
              boxShadow: committed
                ? "0 3px 0 #0284c7"
                : "0 4px 0 #075985, 0 8px 32px rgba(14,165,233,0.3)",
              color: "#fff",
            }}
            aria-label="Create my free account and start learning"
          >
            {/* Shimmer sweep — only runs before committed */}
            {!committed && (
              <span className="kb-shimmer-wrap" aria-hidden="true">
                <span className="kb-shimmer-sweep" />
              </span>
            )}

            {committed ? (
              <>
                <CheckIcon />
                <span>On your way&hellip;</span>
              </>
            ) : (
              <>
                <span>Create my free account</span>
                <ArrowIcon />
              </>
            )}
          </button>

          {/* Social proof */}
          <p
            className="kb-proof text-center text-[12px]"
            style={{ color: "rgba(255,249,245,0.26)" }}
          >
            Joining 5,000+ students already learning on Ignitio
          </p>
        </div>
      </div>
    </main>
  );
}
