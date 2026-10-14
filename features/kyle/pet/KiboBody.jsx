"use client";
import React, { useEffect } from 'react';

const STATE_CLASSES = {
  idle:        'kibo-idle',
  hovered:     'kibo-hovered',
  dragging:    'kibo-dragging',
  thinking:    'kibo-thinking',
  speaking:    'kibo-speaking',
  celebrating: 'kibo-celebrating',
  celebrate:   'kibo-celebrating',
  sleeping:    'kibo-sleeping',
  bouncing:    'kibo-bouncing',
  angry:       'kibo-angry',
  sad:         'kibo-sad',
  empathetic:  'kibo-empathetic',
};

const KIBO_CSS = `
/* ── Base float (idle) ─────────────────────────────── */
@media (prefers-reduced-motion: no-preference) {
  .kibo-idle:not(.tracking-active) .kibo-eyes {
    animation:
      kibo-blink 4s var(--blink-delay, 1.2s) infinite,
      kibo-eye-idle 6s ease-in-out infinite;
  }
  .kibo-idle.tracking-active .kibo-eyes {
    animation: kibo-blink 4s var(--blink-delay, 1.2s) infinite;
  }
  .kibo-idle {
    animation: kibo-float 4s ease-in-out infinite;
  }
}

/* Float & Breathe */
@keyframes kibo-float {
  0%, 100% { transform: translateY(0px) scaleX(1) scaleY(1); }
  50%       { transform: translateY(-8px) scaleX(0.98) scaleY(1.02); }
}

/* Eye idle drift */
@keyframes kibo-eye-idle {
  0%, 100% { transform: translateX(0) translateY(0); }
  30%       { transform: translateX(-3px) translateY(-1px); }
  70%       { transform: translateX(3px) translateY(1px); }
}

/* Blink (brief hide) */
@keyframes kibo-blink {
  0%, 94%, 100% { opacity: 1; }
  96%, 98%      { opacity: 0; }
}

/* ── Hovered ────────────────────────────────────────── */
.kibo-hovered {
  animation: none !important;
  transform: scale(1.06);
  transition: transform 0.2s ease-out;
}
.kibo-hovered .kibo-eyes {
  transform: scale(1.04) translateY(-2px);
  transition: transform 0.2s ease-out;
  animation: kibo-blink-fast 2s infinite;
}
@keyframes kibo-blink-fast {
  0%, 88%, 100% { opacity: 1; }
  92%, 96%      { opacity: 0; }
}

/* ── Dragging ───────────────────────────────────────── */
.kibo-dragging {
  animation: none !important;
  transform: rotate(-5deg) scale(0.97);
  transition: transform 0.1s ease-out;
}
.kibo-dragging .kibo-eyes {
  transform: rotate(5deg) translateY(4px);
  transition: transform 0.1s ease-out;
}

/* ── Bouncing ───────────────────────────────────────── */
.kibo-bouncing {
  animation: none !important;
  transform: scaleX(1.05) scaleY(0.95);
  transition: transform 0.1s ease-out;
}
.kibo-bouncing .kibo-eyes {
  transform: translateY(4px);
  transition: transform 0.1s ease-out;
}

/* ── Thinking ───────────────────────────────────────── */
@media (prefers-reduced-motion: no-preference) {
  .kibo-thinking {
    animation: kibo-float-slow 3s ease-in-out infinite;
  }
  .kibo-thinking .kibo-eyes {
    animation: kibo-eye-think 1.4s ease-in-out infinite;
  }
}
@keyframes kibo-float-slow {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-4px); }
}
@keyframes kibo-eye-think {
  0%, 100% { transform: translate(var(--eye-track-x, 0px), calc(var(--eye-track-y, 0px) - 4px)) scale(1.02); }
  50%       { transform: translate(var(--eye-track-x, 0px), calc(var(--eye-track-y, 0px) - 6px)) scale(1.04); }
}

/* ── Speaking ───────────────────────────────────────── */
@media (prefers-reduced-motion: no-preference) {
  .kibo-speaking {
    animation: kibo-float 4s ease-in-out infinite;
  }
  .kibo-speaking .kibo-eyes {
    animation: kibo-eye-speak 0.8s ease-in-out infinite alternate,
               kibo-blink 3s 0.5s infinite;
  }
}
@keyframes kibo-eye-speak {
  0%   { transform: translate(var(--eye-track-x, 0px), var(--eye-track-y, 0px)) scale(1); }
  100% { transform: translate(var(--eye-track-x, 0px), calc(var(--eye-track-y, 0px) - 2px)) scale(1.03); }
}

/* ── Celebrating ────────────────────────────────────── */
@media (prefers-reduced-motion: no-preference) {
  .kibo-celebrating {
    animation: kibo-celebrate 0.5s ease-in-out infinite alternate;
  }
  .kibo-celebrating .kibo-eyes {
    animation: kibo-eyes-celebrate 0.4s ease-in-out infinite alternate;
  }
}
@keyframes kibo-celebrate {
  0%   { transform: translateY(0) rotate(-3deg) scale(1); }
  100% { transform: translateY(-12px) rotate(3deg) scale(1.05); }
}
@keyframes kibo-eyes-celebrate {
  0%   { transform: translate(var(--eye-track-x, 0px), var(--eye-track-y, 0px)) scale(1); }
  100% { transform: translate(var(--eye-track-x, 0px), calc(var(--eye-track-y, 0px) - 3px)) scale(1.08); }
}

/* ── Angry ──────────────────────────────────────────── */
@media (prefers-reduced-motion: no-preference) {
  .kibo-angry {
    animation: kibo-shake 0.3s ease-in-out infinite;
  }
  .kibo-angry .kibo-eyes {
    transform: scaleY(0.4) translateY(4px);
    transition: transform 0.2s ease-in-out;
  }
}
@keyframes kibo-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-2px) rotate(-1deg); }
  75% { transform: translateX(2px) rotate(1deg); }
}

/* ── Sad ────────────────────────────────────────────── */
@media (prefers-reduced-motion: no-preference) {
  .kibo-sad {
    transform: translateY(8px);
    transition: transform 0.5s ease-in-out;
  }
  .kibo-sad .kibo-eyes {
    transform: translateY(6px) scale(0.9);
    opacity: 0.7;
    transition: all 0.5s ease-in-out;
  }
}

/* ── Empathetic ─────────────────────────────────────── */
@media (prefers-reduced-motion: no-preference) {
  .kibo-empathetic {
    animation: kibo-empathetic-breathe 4s ease-in-out infinite;
  }
  .kibo-empathetic .kibo-eyes {
    animation: kibo-empathetic-eyes 4s ease-in-out infinite;
  }
}
@keyframes kibo-empathetic-breathe {
  0%, 100% { transform: translateY(2px) scaleX(1.02) scaleY(0.98); }
  50% { transform: translateY(6px) scaleX(1) scaleY(1); }
}
@keyframes kibo-empathetic-eyes {
  0%, 100% { transform: translateY(2px) scale(0.95); opacity: 0.9; }
  50% { transform: translateY(4px) scale(0.98); opacity: 1; }
}

/* ── Sleeping ───────────────────────────────────────── */
@media (prefers-reduced-motion: no-preference) {
  .kibo-sleeping {
    animation: kibo-sleep-bob 5s ease-in-out infinite;
  }
}
.kibo-sleeping .kibo-eyes {
  opacity: 0.3;
  transform: translateY(6px);
  transition: opacity 1s ease, transform 1s ease;
}
@keyframes kibo-sleep-bob {
  0%, 100% { transform: translateY(0) rotate(-1deg); }
  50%       { transform: translateY(4px) rotate(1deg); }
}

/* ── Restore button ─────────────────────────────────── */
.kibo-restore-btn {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.kibo-restore-btn:hover {
  transform: scale(1.04);
  box-shadow: 0 4px 16px rgba(99,102,241,0.25);
}
`;

export default function KiboBody({ visualState, petSize, wrapperRef, eyesRef }) {
  // Randomize blink timing on mount (CSS var injection)
  useEffect(() => {
    if (!eyesRef.current) return;
    const delay = (Math.random() * 3).toFixed(2);
    eyesRef.current.style.setProperty('--blink-delay', `${delay}s`);
  }, [eyesRef]);

  return (
    <>
      {/* Inline CSS — all animations live here */}
      <style>{KIBO_CSS}</style>

      <div
        ref={wrapperRef}
        className={`kibo-wrapper ${STATE_CLASSES[visualState] || 'kibo-idle'} w-full h-full`}
      >
        {/* Body layer — static */}
        <img
          src="/kibo/kibo_body.svg"
          alt=""
          aria-hidden="true"
          draggable={false}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'contain',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />

        {/* Eyes layer — animated */}
        <img
          ref={eyesRef}
          src="/kibo/kibo_eyes.svg"
          alt=""
          aria-hidden="true"
          draggable={false}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'contain',
            pointerEvents: 'none',
            zIndex: 2,
          }}
          className="kibo-eyes"
        />
      </div>
    </>
  );
}
