"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";

/**
 * AchievementForgeReveal (exported as StrandsReveal for backward compat)
 *
 * Branded Ignitio achievement-unlock reveal using SVG + CSS keyframes.
 * Sequence: roadmap nodes → XP charge → unlock badge → card forge → reward burst → complete
 *
 * @param {number}   durationMs  Total animation duration (default 2800)
 * @param {function} onComplete  Called once after the animation finishes
 */

/* ─── Palette ──────────────────────────────────────────────── */
const CYAN = "#00a9ff";
const AMBER = "#f59e0b";
const NAVY = "#19183b";

/* ─── Spark positions (12 sparks, evenly spaced around a circle) ── */
function generateSparks(count = 14) {
  const sparks = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
    const radius = 115 + (i % 3) * 22;
    sparks.push({
      id: i,
      angle,
      tx: Math.cos(angle) * radius,
      ty: Math.sin(angle) * radius,
      size: 3 + (i % 3) * 1.2,
      color: i % 4 === 0 ? AMBER : CYAN,
      delay: i * 0.022,
    });
  }
  return sparks;
}

export default function StrandsReveal({ durationMs = 2800, onComplete }) {
  const [phase, setPhase] = useState("roadmap");
  const timerRefs = useRef([]);
  const completedRef = useRef(false);
  const sparks = useMemo(() => generateSparks(14), []);

  /* ─── Reduced motion ──────────────────────────────────────── */
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  useEffect(() => {
    if (prefersReducedMotion) {
      if (!completedRef.current) {
        completedRef.current = true;
        onComplete?.();
      }
      return;
    }

    /* Timeline ratios (sum = 1.0):
     *  roadmap:  0 – 0.22       (~616ms)
     *  xp:       0.22 – 0.42    (~560ms)
     *  unlock:   0.42 – 0.58    (~448ms)
     *  card:     0.58 – 0.78    (~560ms)
     *  burst:    0.78 – 0.93    (~420ms)
     *  done:     0.93 – 1.0     (~196ms fade)
     */
    const ms = (ratio) => durationMs * ratio;

    const timers = [];
    const t = (delay, fn) => {
      const id = setTimeout(fn, delay);
      timers.push(id);
    };

    t(ms(0.22), () => setPhase("xp"));
    t(ms(0.42), () => setPhase("unlock"));
    t(ms(0.58), () => setPhase("card"));
    t(ms(0.78), () => setPhase("burst"));
    t(ms(0.96), () => {
      setPhase("done");
      if (!completedRef.current) {
        completedRef.current = true;
        onComplete?.();
      }
    });

    timerRefs.current = timers;
    return () => timers.forEach(clearTimeout);
  }, [durationMs, onComplete, prefersReducedMotion]);

  if (prefersReducedMotion) return null;

  /* ─── Phase booleans ─────────────────────────────────────── */
  const phaseOrder = ["idle", "roadmap", "xp", "unlock", "card", "burst", "done"];
  const phaseIndex = phaseOrder.indexOf(phase);
  const reached = (p) => phaseIndex >= phaseOrder.indexOf(p);

  /* ─── Node positions (3 roadmap nodes) ───────────────────── */
  const nodes = [
    { cx: 110, cy: 210 },
    { cx: 200, cy: 120 },
    { cx: 290, cy: 210 },
  ];
  const center = { cx: 200, cy: 200 };

  /* Card outline (aspect ~0.787 w/h, like a certificate card) */
  const cardW = 155;
  const cardH = cardW * 1.27;
  const cardX = center.cx - cardW / 2;
  const cardY = center.cy - cardH / 2;
  const cardPerimeter = 2 * (cardW + cardH);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative">
      {/* Scoped keyframes */}
      <style>{`
        /* ── Roadmap node pulse ── */
        @keyframes afr-nodePulse {
          0%   { r: 7; opacity: 0.3; }
          50%  { r: 11; opacity: 1; }
          100% { r: 9; opacity: 0.95; }
        }
        .afr-node-0 { animation: afr-nodePulse 0.5s ease-out 0s forwards; }
        .afr-node-1 { animation: afr-nodePulse 0.5s ease-out 0.18s forwards; }
        .afr-node-2 { animation: afr-nodePulse 0.5s ease-out 0.36s forwards; }

        /* ── Line draw ── */
        @keyframes afr-lineDraw {
          from { stroke-dashoffset: 140; }
          to   { stroke-dashoffset: 0; }
        }
        .afr-line-0 { animation: afr-lineDraw 0.4s ease-out 0.08s forwards; }
        .afr-line-1 { animation: afr-lineDraw 0.4s ease-out 0.28s forwards; }

        /* ── XP orb grow ── */
        @keyframes afr-orbGrow {
          0%   { r: 0; opacity: 0; }
          60%  { r: 32; opacity: 0.95; }
          100% { r: 26; opacity: 1; }
        }
        .afr-orb { animation: afr-orbGrow 0.5s ease-out forwards; }

        /* ── XP orb inner glow pulse ── */
        @keyframes afr-orbPulse {
          0%, 100% { opacity: 0.4; }
          50%      { opacity: 0.8; }
        }
        .afr-orb-glow { animation: afr-orbPulse 0.8s ease-in-out infinite; }

        /* ── Energy flow from nodes to center ── */
        @keyframes afr-energyFlow {
          0%   { offset-distance: 0%; opacity: 0; r: 4; }
          20%  { opacity: 1; r: 6; }
          80%  { opacity: 0.9; r: 4; }
          100% { offset-distance: 100%; opacity: 0; r: 2; }
        }
        .afr-energy-0 { animation: afr-energyFlow 0.5s ease-in 0s forwards; }
        .afr-energy-1 { animation: afr-energyFlow 0.5s ease-in 0.12s forwards; }
        .afr-energy-2 { animation: afr-energyFlow 0.5s ease-in 0.24s forwards; }

        /* ── Lock → Check transition ── */
        @keyframes afr-lockFade {
          0%   { opacity: 1; transform: scale(1); }
          50%  { opacity: 0; transform: scale(0.6); }
          100% { opacity: 0; transform: scale(0); }
        }
        @keyframes afr-checkAppear {
          0%   { opacity: 0; transform: scale(0.3) rotate(-15deg); }
          60%  { opacity: 1; transform: scale(1.15) rotate(3deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        .afr-lock-out { animation: afr-lockFade 0.35s ease-in forwards; }
        .afr-check-in { animation: afr-checkAppear 0.4s ease-out 0.2s forwards; opacity: 0; }

        /* ── Unlock glow pulse (cyan/amber) ── */
        @keyframes afr-unlockGlow {
          0%   { r: 20; opacity: 0; }
          30%  { r: 40; opacity: 0.5; }
          60%  { r: 55; opacity: 0.25; }
          100% { r: 65; opacity: 0; }
        }
        .afr-unlock-glow-cyan  { animation: afr-unlockGlow 0.55s ease-out 0.1s forwards; }
        .afr-unlock-glow-amber { animation: afr-unlockGlow 0.55s ease-out 0.2s forwards; }

        /* ── Card outline draw ── */
        @keyframes afr-cardDraw {
          from { stroke-dashoffset: ${cardPerimeter}; }
          to   { stroke-dashoffset: 0; }
        }
        .afr-card-outline {
          stroke-dasharray: ${cardPerimeter};
          stroke-dashoffset: ${cardPerimeter};
          animation: afr-cardDraw 0.52s ease-in-out forwards;
        }

        /* ── Card inner glow ── */
        @keyframes afr-cardGlow {
          0%   { opacity: 0; }
          50%  { opacity: 0.15; }
          100% { opacity: 0.08; }
        }
        .afr-card-fill { animation: afr-cardGlow 0.5s ease-out 0.2s forwards; opacity: 0; }

        /* ── Spark burst ── */
        @keyframes afr-spark {
          0%   { transform: translate(0,0) scale(1); opacity: 1; }
          70%  { opacity: 0.8; }
          100% { transform: translate(var(--tx), var(--ty)) scale(0.2); opacity: 0; }
        }
        .afr-spark {
          animation: afr-spark 0.55s ease-out forwards;
        }

        /* ── Shockwave ring ── */
        @keyframes afr-ring {
          0%   { r: 14; opacity: 0.7; stroke-width: 3.5; }
          100% { r: 145; opacity: 0; stroke-width: 0.5; }
        }
        .afr-ring { animation: afr-ring 0.55s ease-out forwards; }

        /* ── Status text fade ── */
        @keyframes afr-textFade {
          0%   { opacity: 0; transform: translateY(6px); }
          30%  { opacity: 1; transform: translateY(0); }
          80%  { opacity: 1; }
          100% { opacity: 0.7; }
        }
        .afr-status { animation: afr-textFade 0.6s ease-out forwards; }

        /* ── Overall container fade out ── */
        @keyframes afr-fadeOut {
          from { opacity: 1; }
          to   { opacity: 0; }
        }
        .afr-done { animation: afr-fadeOut 0.3s ease-out forwards; }

        @media(prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-delay: 0ms !important;
          }
        }
      `}</style>

      <div className={`flex flex-col items-center justify-center w-full h-full ${phase === "done" ? "afr-done" : ""}`}>
        <svg
          viewBox="0 0 400 400"
          className="block mx-auto"
          aria-hidden="true"
          style={{ width: "min(92vw, 520px)", height: "min(62dvh, 520px)", maxWidth: "520px", maxHeight: "520px" }}
        >
          <defs>
            {/* Glow filters */}
            <filter id="afr-glow-cyan" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="afr-glow-amber" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="afr-glow-strong" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Radial gradient for orb */}
            <radialGradient id="afr-orbGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={CYAN} stopOpacity="0.9" />
              <stop offset="70%" stopColor={CYAN} stopOpacity="0.4" />
              <stop offset="100%" stopColor={NAVY} stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* ── Phase 1: Roadmap nodes + connecting lines ──────── */}
          {reached("roadmap") && (
            <g filter="url(#afr-glow-cyan)">
              {/* Connecting lines */}
              <line
                x1={nodes[0].cx} y1={nodes[0].cy}
                x2={nodes[1].cx} y2={nodes[1].cy}
                stroke={CYAN} strokeWidth="2" strokeLinecap="round"
                strokeDasharray="140" strokeDashoffset="140"
                className="afr-line-0"
                opacity="0.85"
              />
              <line
                x1={nodes[1].cx} y1={nodes[1].cy}
                x2={nodes[2].cx} y2={nodes[2].cy}
                stroke={CYAN} strokeWidth="2" strokeLinecap="round"
                strokeDasharray="140" strokeDashoffset="140"
                className="afr-line-1"
                opacity="0.85"
              />
              {/* Nodes */}
              {nodes.map((n, i) => (
                <circle
                  key={i}
                  cx={n.cx} cy={n.cy} r="7"
                  fill={CYAN}
                  opacity="0.3"
                  className={`afr-node-${i}`}
                />
              ))}
              {/* Small milestone diamonds on nodes */}
              {nodes.map((n, i) => (
                <rect
                  key={`d${i}`}
                  x={n.cx - 4.5} y={n.cy - 4.5}
                  width="9" height="9"
                  fill="none" stroke={AMBER} strokeWidth="1.2"
                  opacity="0"
                  transform={`rotate(45 ${n.cx} ${n.cy})`}
                  className={`afr-node-${i}`}
                />
              ))}
            </g>
          )}

          {/* ── Phase 2: XP charge – energy flows + orb ────────── */}
          {reached("xp") && (
            <g>
              {/* Energy particles flowing from each node to center */}
              {nodes.map((n, i) => (
                <circle
                  key={`e${i}`}
                  r="4"
                  fill={i === 1 ? AMBER : CYAN}
                  filter="url(#afr-glow-cyan)"
                  className={`afr-energy-${i}`}
                  style={{
                    offsetPath: `path('M ${n.cx} ${n.cy} Q ${(n.cx + center.cx) / 2} ${Math.min(n.cy, center.cy) - 40} ${center.cx} ${center.cy}')`,
                  }}
                />
              ))}
              {/* Central XP orb */}
              <circle
                cx={center.cx} cy={center.cy} r="0"
                fill="url(#afr-orbGrad)"
                filter="url(#afr-glow-strong)"
                className="afr-orb"
              />
              {/* Inner glow ring */}
              <circle
                cx={center.cx} cy={center.cy} r="18"
                fill="none" stroke={CYAN} strokeWidth="1.5"
                opacity="0.5"
                className="afr-orb afr-orb-glow"
              />
              {/* Outer ambient ring */}
              <circle
                cx={center.cx} cy={center.cy} r="30"
                fill="none" stroke={CYAN} strokeWidth="0.5"
                opacity="0"
                className="afr-orb afr-orb-glow"
                style={{ animationDelay: "0.15s" }}
              />
              {/* XP text */}
              <text
                x={center.cx} y={center.cy + 1}
                textAnchor="middle" dominantBaseline="central"
                fill="white" fontSize="14" fontWeight="700"
                letterSpacing="1.5"
                opacity="0"
                className="afr-orb"
              >
                XP
              </text>
            </g>
          )}

          {/* ── Phase 3: Unlock – lock → check ─────────────────── */}
          {reached("unlock") && (
            <g>
              {/* Lock icon (fades out) */}
              {/* Unlock glow pulses */}
              <circle
                cx={center.cx} cy={center.cy} r="20"
                fill="none" stroke={CYAN} strokeWidth="2"
                className="afr-unlock-glow-cyan"
              />
              <circle
                cx={center.cx} cy={center.cy} r="20"
                fill="none" stroke={AMBER} strokeWidth="1.5"
                className="afr-unlock-glow-amber"
              />
              {/* Lock icon (fades out) */}
              <g
                className="afr-lock-out"
                style={{ transformOrigin: `${center.cx}px ${center.cy}px` }}
              >
                {/* Lock body */}
                <rect
                  x={center.cx - 11} y={center.cy - 5}
                  width="22" height="18" rx="3"
                  fill={CYAN} opacity="0.9"
                />
                {/* Lock shackle */}
                <path
                  d={`M ${center.cx - 7} ${center.cy - 5} V ${center.cy - 14} A 7 7 0 0 1 ${center.cx + 7} ${center.cy - 14} V ${center.cy - 5}`}
                  fill="none" stroke={CYAN} strokeWidth="3" strokeLinecap="round"
                />
              </g>
              {/* Check badge (appears) */}
              <g
                className="afr-check-in"
                style={{ transformOrigin: `${center.cx}px ${center.cy}px` }}
              >
                <circle
                  cx={center.cx} cy={center.cy} r="22"
                  fill={CYAN} opacity="0.15"
                />
                <circle
                  cx={center.cx} cy={center.cy} r="16"
                  fill={CYAN}
                  filter="url(#afr-glow-cyan)"
                />
                {/* Checkmark */}
                <polyline
                  points={`${center.cx - 7},${center.cy} ${center.cx - 2},${center.cy + 6} ${center.cx + 8},${center.cy - 6}`}
                  fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                />
              </g>
            </g>
          )}

          {/* ── Phase 4: Card forge – outline draws ────────────── */}
          {reached("card") && (
            <g>
              {/* Card outline */}
              <rect
                x={cardX} y={cardY}
                width={cardW} height={cardH}
                rx="6"
                fill="none"
                stroke={CYAN}
                strokeWidth="2.5"
                className="afr-card-outline"
                filter="url(#afr-glow-cyan)"
              />
              {/* Amber accent border */}
              <rect
                x={cardX - 4} y={cardY - 4}
                width={cardW + 8} height={cardH + 8}
                rx="8"
                fill="none"
                stroke={AMBER}
                strokeWidth="1.2"
                className="afr-card-outline"
                opacity="0.5"
                style={{ animationDelay: "0.1s" }}
              />
              {/* Card inner fill */}
              <rect
                x={cardX} y={cardY}
                width={cardW} height={cardH}
                rx="6"
                fill={CYAN}
                className="afr-card-fill"
              />
              {/* Small certificate icon lines inside card */}
              <g className="afr-card-fill" style={{ animationDelay: "0.3s" }}>
                <line
                  x1={cardX + 20} y1={cardY + 30}
                  x2={cardX + cardW - 20} y2={cardY + 30}
                  stroke="white" strokeWidth="1.5" opacity="0.3" strokeLinecap="round"
                />
                <line
                  x1={cardX + 30} y1={cardY + 42}
                  x2={cardX + cardW - 30} y2={cardY + 42}
                  stroke="white" strokeWidth="1" opacity="0.2" strokeLinecap="round"
                />
                <circle
                  cx={center.cx} cy={cardY + cardH - 35}
                  r="10" fill="none" stroke={AMBER} strokeWidth="1" opacity="0.3"
                />
              </g>
            </g>
          )}

          {/* ── Phase 5: Reward burst – sparks + ring ──────────── */}
          {reached("burst") && (
            <g>
              {/* Shockwave ring */}
              <circle
                cx={center.cx} cy={center.cy} r="14"
                fill="none" stroke={CYAN} strokeWidth="3.5"
                className="afr-ring"
                opacity="0.7"
              />
              {/* Sparks */}
              {sparks.map((s) => (
                <circle
                  key={s.id}
                  cx={center.cx} cy={center.cy}
                  r={s.size}
                  fill={s.color}
                  filter={s.color === AMBER ? "url(#afr-glow-amber)" : "url(#afr-glow-cyan)"}
                  className="afr-spark"
                  style={{
                    "--tx": `${s.tx}px`,
                    "--ty": `${s.ty}px`,
                    animationDelay: `${s.delay}s`,
                  }}
                />
              ))}
            </g>
          )}
        </svg>

        {/* Status text */}
        <div className="relative z-10 mt-1 text-center" style={{ minHeight: "20px" }}>
          {phase === "roadmap" && (
            <p key="t1" className="text-white/50 text-[11px] tracking-wide afr-status">
              Mapping your progress…
            </p>
          )}
          {phase === "xp" && (
            <p key="t2" className="text-white/50 text-[11px] tracking-wide afr-status">
              Charging XP…
            </p>
          )}
          {phase === "unlock" && (
            <p key="t3" className="text-white/50 text-[11px] tracking-wide afr-status">
              Milestone unlocked!
            </p>
          )}
          {(phase === "card" || phase === "burst") && (
            <p key="t4" className="text-white/50 text-[11px] tracking-wide afr-status">
              Forging your achievement card…
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
