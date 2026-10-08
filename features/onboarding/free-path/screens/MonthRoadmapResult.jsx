"use client";

/**
 * MonthRoadmapResult — diagonal cascade layout (drawing spec)
 *
 * - Week label sits ABOVE each card
 * - Cards step right+down: Week1=left, Weeks2-3=center, Week4=right
 * - Dashed SVG S-curve connectors + filled dot nodes at junctions
 * - No left-rail timeline column
 * - No Month Coverage progress bar
 * - Colors from globals.css tokens
 */

import { useCallback, useState, useRef, useEffect } from "react";
import KiboBody from "@/features/kyle/pet/KiboBody";
import TextType from "@/components/ui/TextType";
import { useKiboEyeTracking } from "@/features/kyle/pet/useKiboEyeTracking";
import { ChevronLeft, GitBranch, Code2, Rocket } from "lucide-react";

// ── Design tokens (globals.css) ──────────────────────────────────────────────
var BG        = "#19183b"; // --color-secondary-900
var BG_CARD   = "#222054"; // --color-secondary-800
var ACCENT    = "#00a9ff"; // --color-accent-500
var ACCENT_DIM = "#007bcc"; // --color-accent-700
var SUCCESS   = "#10b981"; // --color-success-500
var WARNING   = "#f59e0b"; // --color-warning-500

// ── Week data (3 cards only) ──────────────────────────────────────────────────
var WEEKS = [
  {
    id: "week1",
    weekLabel: "Week 1",
    badge: "01",
    title: "Git & GitHub",
    Icon: GitBranch,
    concepts: ["Commits", "Branching", "Pull Requests", "Remote Repos"],
    outcome: "Push your first repo live",
    color: ACCENT,
  },
  {
    id: "week23",
    weekLabel: "Weeks 2-3",
    badge: "02",
    title: "Python",
    Icon: Code2,
    concepts: ["Variables & Types", "Functions", "Lists & Dicts", "File I/O"],
    outcome: "Write 3 working scripts",
    color: SUCCESS,
  },
  {
    id: "week4",
    weekLabel: "Week 4",
    badge: "03",
    title: "Ship It",
    Icon: Rocket,
    concepts: ["Project structure", "README", "GitHub Pages", "Live deploy"],
    outcome: "Ship a live project to GitHub",
    color: WARNING,
  },
];

// ── Geometry constants ────────────────────────────────────────────────────────
var CARD_W  = 252;
var CARD_H  = 196;
var LABEL_H = 28;
var STEP_X  = 80;
var STEP_Y  = 232;
var TOTAL_W = CARD_W + STEP_X * (WEEKS.length - 1) + 32;
var TOTAL_H = STEP_Y * (WEEKS.length - 1) + CARD_H + LABEL_H + 32;

// ── Design constants ──────────────────────────────────────────────────────────
var TOTAL_STEPS = 8;
var STEP_INDEX  = 7; // Roadmap Result = step 7
var FILL_PCT    = Math.round((STEP_INDEX / TOTAL_STEPS) * 100);

// ── Inline keyframes (no external dep) ───────────────────────────────────────
var CSS = `
@keyframes mrr-fade-up {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes mrr-scale-in {
  from { opacity: 0; transform: scale(0.82); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes mrr-dash-draw {
  from { stroke-dashoffset: 600; opacity: 0; }
  to   { stroke-dashoffset: 0;   opacity: 1; }
}
@keyframes mrr-row-in {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes mrr-bubble-pop {
  0%   { opacity: 0; transform: scale(0.88) translateX(6px); }
  100% { opacity: 1; transform: scale(1) translateX(0); }
}
.mrr-fade-up  { animation: mrr-fade-up  380ms cubic-bezier(0.22,1,0.36,1) both; }
.mrr-scale-in { animation: mrr-scale-in 420ms cubic-bezier(0.34,1.56,0.64,1) both; }
.mrr-dash-path {
  stroke-dasharray: 7 5;
  stroke-dashoffset: 600;
  animation: mrr-dash-draw 680ms cubic-bezier(0.22,1,0.36,1) both;
}
.mrr-row-in    { animation: mrr-row-in    380ms cubic-bezier(0.22,1,0.36,1) both; }
.mrr-bubble-pop { animation: mrr-bubble-pop 480ms cubic-bezier(0.34,1.56,0.64,1) both; animation-delay: 60ms; }

/* Dark-mode bubble tail pointing left */
.mrr-bubble::before {
  content: '';
  position: absolute;
  top: 50%; left: -12px;
  transform: translateY(-50%);
  border: 11px solid transparent;
  border-right-color: ${ACCENT};
  border-left: 0;
}
.mrr-bubble::after {
  content: '';
  position: absolute;
  top: 50%; left: -9px;
  transform: translateY(-50%);
  border: 10px solid transparent;
  border-right-color: ${BG_CARD};
  border-left: 0;
}

@media (hover: hover) {
  .mrr-card { transition: transform 130ms ease-out, box-shadow 130ms ease-out; }
  .mrr-card:hover { transform: translateY(-3px); box-shadow: 0 14px 36px rgba(0,0,0,0.5) !important; }
}
@media (prefers-reduced-motion: reduce) {
  .mrr-fade-up, .mrr-scale-in, .mrr-row-in, .mrr-bubble-pop { animation: none !important; opacity: 1 !important; transform: none !important; }
  .mrr-dash-path { stroke-dashoffset: 0 !important; animation: none !important; opacity: 1 !important; }
}
`;

// ── Sub-components ────────────────────────────────────────────────────────────

function ConceptPill({ label, color }) {
  return (
    <span
      className="inline-block px-2.5 py-[5px] rounded-full text-[11px] font-semibold leading-none whitespace-nowrap border"
      style={{
        borderColor: color + "50",
        color: color,
        backgroundColor: color + "14",
      }}
    >
      {label}
    </span>
  );
}

function StageCard({ week, delay }) {
  var Icon = week.Icon;
  return (
    <div
      className="mrr-card mrr-fade-up relative rounded-2xl p-5 overflow-hidden"
      style={{
        width: CARD_W,
        backgroundColor: BG_CARD,
        border: "1.5px solid " + week.color + "45",
        boxShadow:
          "0 0 0 1px " + week.color + "12, inset 0 1px 0 rgba(255,255,255,0.055), 0 8px 28px rgba(0,0,0,0.35)",
        animationDelay: delay + "ms",
      }}
    >
      <Icon
        aria-hidden="true"
        size={76}
        strokeWidth={1.1}
        className="absolute -top-2 -right-2 pointer-events-none"
        style={{ color: week.color, opacity: 0.07 }}
      />

      <div
        className="mrr-scale-in inline-flex items-center justify-center w-8 h-8 rounded-xl font-black text-[13px] mb-3 text-white"
        style={{
          background: "linear-gradient(135deg," + week.color + "cc," + week.color + ")",
          animationDelay: (delay + 50) + "ms",
        }}
      >
        {week.badge}
      </div>

      <h3 className="font-extrabold text-[15px] leading-snug mb-3" style={{ color: "#dde2f5" }}>
        {week.title}
      </h3>

      <div className="flex flex-wrap gap-1.5 mb-3.5">
        {week.concepts.map(function (c) {
          return <ConceptPill key={c} label={c} color={week.color} />;
        })}
      </div>

      <p className="text-[11px] leading-snug font-semibold" style={{ color: week.color + "a8" }}>
        {week.outcome}
      </p>
    </div>
  );
}

function CascadeConnectors() {
  return (
    <svg
      aria-hidden="true"
      className="absolute top-0 left-0 pointer-events-none"
      style={{ width: TOTAL_W, height: TOTAL_H, overflow: "visible", zIndex: 0 }}
    >
      {WEEKS.slice(0, -1).map(function (week, i) {
        var nextWeek = WEEKS[i + 1];

        var fromX = i * STEP_X + CARD_W - 30;
        var fromY = LABEL_H + i * STEP_Y + CARD_H - 10;

        var toX = (i + 1) * STEP_X + 30;
        var toY = LABEL_H + (i + 1) * STEP_Y + 12;

        var midY = (fromY + toY) / 2;

        var d =
          "M " + fromX + " " + fromY +
          " C " + fromX + " " + midY +
          " " + toX + " " + midY +
          " " + toX + " " + toY;

        return (
          <g key={week.id}>
            <path d={d} fill="none" stroke={week.color + "20"} strokeWidth="5" strokeLinecap="round" />
            <path
              d={d}
              fill="none"
              stroke={week.color + "80"}
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeDasharray="7 5"
              className="mrr-dash-path"
              style={{ animationDelay: (200 + i * 130) + "ms" }}
            />
            <circle cx={fromX} cy={fromY} r="5" fill={week.color} stroke={BG} strokeWidth="2" opacity="0.95" />
            <circle cx={toX} cy={toY} r="5" fill={nextWeek.color} stroke={BG} strokeWidth="2" opacity="0.95" />
          </g>
        );
      })}
    </svg>
  );
}

function Header({ onBack }) {
  var [isTyping, setIsTyping] = useState(true);
  var [isHovered, setIsHovered] = useState(false);
  var [barWidth, setBarWidth] = useState(0);

  var eyesRef = useRef(null);
  var wrapperRef = useRef(null);

  useKiboEyeTracking({ eyesRef, wrapperRef, active: true, trackFullPage: false });

  useEffect(function () {
    var id = requestAnimationFrame(function () { setBarWidth(FILL_PCT); });
    return function () { cancelAnimationFrame(id); };
  }, []);

  var handleTypingDone = useCallback(function () { setIsTyping(false); }, []);

  return (
    <div className="flex-shrink-0 px-4 pt-5 pb-3">

      {/* Progress bar row with back button */}
      <div className="w-full max-w-[500px] mx-auto flex items-center gap-3 mb-4">
        <button
          type="button"
          onClick={onBack}
          aria-label="Go back"
          className="flex-shrink-0 flex items-center justify-center rounded-full transition-all active:scale-95"
          style={{
            width: 36,
            height: 36,
            border: "1.5px solid rgba(255,255,255,0.12)",
            backgroundColor: "rgba(255,255,255,0.06)",
            color: "rgba(255,255,255,0.5)",
          }}
        >
          <ChevronLeft size={18} strokeWidth={2} />
        </button>

        <div
          className="relative h-[14px] w-full rounded-full"
          role="progressbar"
          aria-valuenow={STEP_INDEX}
          aria-valuemin={0}
          aria-valuemax={TOTAL_STEPS}
          aria-label={`Step ${STEP_INDEX}`}
          style={{ backgroundColor: "rgba(0,169,255,0.15)" }}
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

      {/* Kibo + speech bubble */}
      <div className="w-full max-w-[500px] mx-auto flex items-center gap-4 mrr-row-in mb-3" style={{ animationDelay: "80ms" }}>
        <div
          className="relative flex-shrink-0 select-none cursor-pointer"
          style={{
            width: 76, height: 76,
            filter: isHovered
              ? "drop-shadow(0 0 14px rgba(0,169,255,0.55))"
              : "drop-shadow(0 4px 10px rgba(0,0,0,0.35))",
            transition: "filter 300ms",
          }}
          onPointerEnter={function () { setIsHovered(true); }}
          onPointerLeave={function () { setIsHovered(false); }}
          aria-label="Kibo"
          ref={wrapperRef}
        >
          <KiboBody
            visualState={isTyping ? "speaking" : "idle"}
            petSize={76}
            wrapperRef={wrapperRef}
            eyesRef={eyesRef}
          />
        </div>

        <div className="mrr-bubble-pop relative flex-1 min-w-0">
          <div
            className="mrr-bubble relative rounded-2xl border-2 px-4 py-3"
            role="status"
            aria-live="polite"
            style={{
              backgroundColor: BG_CARD,
              borderColor: ACCENT,
              boxShadow: "0 4px 20px rgba(0,169,255,0.10)",
            }}
          >
            <p className="text-[14px] leading-snug font-bold" style={{ color: "#dde2f5" }}>
              <TextType
                text="Here's your 3-month plan — built around real projects you'll actually ship."
                typingSpeed={24}
                showCursor={false}
                loop={false}
                onSentenceComplete={handleTypingDone}
              />
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function MonthRoadmapResult({ roadmap, path, onContinue, onBack }) {
  var handleBack = useCallback(function () { if (onBack) onBack(); }, [onBack]);
  var handleContinue = useCallback(function () { if (onContinue) onContinue(); }, [onContinue]);

  return (
    <main className="min-h-dvh flex flex-col" style={{ backgroundColor: BG }}>
      <style>{CSS}</style>

      <Header onBack={handleBack} />

      {/* Scrollable cascade */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-6">
        <div className="flex justify-center px-4">
        <div
          className="relative"
          style={{ width: TOTAL_W, height: TOTAL_H }}
        >
          <CascadeConnectors />

          <div className="relative" style={{ zIndex: 1 }}>
            {WEEKS.map(function (week, i) {
              return (
                <div
                  key={week.id}
                  className="absolute"
                  style={{ left: i * STEP_X, top: i * STEP_Y }}
                >
                  {/* Week label above card */}
                  <div
                    className="mrr-fade-up mb-2"
                    style={{ animationDelay: (60 + i * 110) + "ms" }}
                  >
                    <span
                      className="text-[10px] font-bold uppercase tracking-[0.14em]"
                      style={{ color: week.color + "cc" }}
                    >
                      {week.weekLabel}
                    </span>
                  </div>

                  <StageCard week={week} delay={90 + i * 110} />
                </div>
              );
            })}
          </div>
        </div>
        </div>
      </div>

      {/* Sticky CTA footer */}
      <div
        className="flex-shrink-0 px-4 py-4 border-t"
        style={{ backgroundColor: BG, borderColor: "rgba(255,255,255,0.07)" }}
      >
        <button
          type="button"
          id="mrr-create-account-btn"
          onClick={handleContinue}
          className="w-full py-4 rounded-2xl font-extrabold text-[15px] uppercase tracking-widest text-white transition-all active:scale-[0.98] active:translate-y-[2px]"
          style={{
            background: "linear-gradient(90deg," + ACCENT + "," + ACCENT_DIM + ")",
            boxShadow: "0 4px 0 " + ACCENT_DIM + ", 0 0 24px " + ACCENT + "20",
          }}
        >
          Create My Account
        </button>
        <p
          className="mrr-fade-up text-center text-[11px] mt-2.5"
          style={{ color: "rgba(255,255,255,0.25)", animationDelay: "500ms" }}
        >
          Free to start · No credit card needed
        </p>
      </div>
    </main>
  );
}