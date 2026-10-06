"use client";

import { useState, useCallback } from "react";
import {
  GitBranch,
  Code2,
  Rocket,
  Check,
  ChevronLeft,
  ArrowRight,
  Github,
} from "lucide-react";

// Design tokens
var BG       = "#07131D";
var ACCENT   = "#00A9FF";
var CARD_BG  = "#0D1E2C";
var GLOW     = "rgba(0,169,255,0.35)";

// Week plan data
var WEEK_PLAN = [
  {
    id: "week1",
    weekLabel: "Week 1",
    badge: "01",
    skillId: "git",
    title: "Git & GitHub",
    icon: GitBranch,
    concepts: ["Commits", "Branching", "Pull Requests", "Remote Repos"],
    outcome: "Push your first repo live",
    color: "#00A9FF",
  },
  {
    id: "week23",
    weekLabel: "Weeks 2-3",
    badge: "02",
    skillId: "python",
    title: "Python",
    icon: Code2,
    concepts: ["Variables & Types", "Functions", "Lists & Dicts", "File I/O"],
    outcome: "Write 3 working scripts",
    color: "#10B981",
  },
  {
    id: "week4",
    weekLabel: "Week 4",
    badge: "03",
    skillId: "ship",
    title: "Ship It",
    icon: Rocket,
    concepts: ["Project structure", "README", "GitHub Pages", "Live deploy"],
    outcome: "Ship a live project to GitHub",
    color: "#F59E0B",
  },
];

var EXTRA_WEEKS = [
  {
    id: "month2",
    weekLabel: "Month 2",
    badge: "04",
    skillId: "prompt",
    title: "Prompt Engineering",
    icon: Code2,
    concepts: ["Output format", "Context", "Few-shot", "Chain-of-thought"],
    outcome: "Build an AI-powered tool",
    color: "#8B5CF6",
  },
  {
    id: "month3",
    weekLabel: "Month 3",
    badge: "05",
    skillId: "system_design",
    title: "System Design",
    icon: GitBranch,
    concepts: ["Scalability", "Databases", "Trade-offs", "Architecture"],
    outcome: "Design a system from scratch",
    color: "#EC4899",
  },
];

var CSS = `
@keyframes mrr-fade-up {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes mrr-scale-in {
  from { opacity: 0; transform: scale(0.82); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes mrr-glow-pulse {
  0%,100% { box-shadow: 0 0 0 0 rgba(0,169,255,0.35); }
  50%      { box-shadow: 0 0 0 8px rgba(0,169,255,0.35); }
}
@keyframes mrr-bar-fill {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}
.mrr-fade-up  { animation: mrr-fade-up  380ms cubic-bezier(0.22,1,0.36,1) both; }
.mrr-scale-in { animation: mrr-scale-in 420ms cubic-bezier(0.34,1.56,0.64,1) both; }
.mrr-node-active { animation: mrr-glow-pulse 2.4s ease-in-out infinite; }
.mrr-bar-fill {
  transform-origin: left center;
  animation: mrr-bar-fill 700ms cubic-bezier(0.22,1,0.36,1) 300ms both;
}
.mrr-scroll-row {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.mrr-scroll-row::-webkit-scrollbar { display: none; }
.mrr-snap-card { scroll-snap-align: start; }
@media (hover: hover) {
  .mrr-stage-card { transition: transform 150ms ease-out, box-shadow 150ms ease-out; }
  .mrr-stage-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.32); }
}
@media (prefers-reduced-motion: reduce) {
  .mrr-fade-up,.mrr-scale-in,.mrr-bar-fill {
    animation: none !important; opacity: 1 !important; transform: none !important;
  }
  .mrr-node-active { animation: none !important; }
}
`;

// ConceptPill
function ConceptPill({ label, accentColor }) {
  return (
    <span
      className="inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold leading-none border whitespace-nowrap"
      style={{
        borderColor: accentColor + "40",
        color: accentColor,
        backgroundColor: accentColor + "12",
      }}
    >
      {label}
    </span>
  );
}

// StageCard
function StageCard({ week, delay, isActive }) {
  var Icon = week.icon;
  return (
    <div
      className="mrr-stage-card mrr-snap-card mrr-fade-up flex-shrink-0 relative rounded-2xl p-5 overflow-hidden"
      style={{
        width: "min(260px, 70vw)",
        backgroundColor: CARD_BG,
        border: "1.5px solid " + (isActive ? week.color + "60" : "rgba(255,255,255,0.07)"),
        animationDelay: delay + "ms",
        boxShadow: isActive
          ? "0 0 0 1px " + week.color + "20, 0 4px 20px rgba(0,0,0,0.25)"
          : "0 4px 20px rgba(0,0,0,0.2)",
      }}
    >
      <Icon
        aria-hidden="true"
        size={72}
        strokeWidth={1.5}
        className="absolute -top-2 -right-2 pointer-events-none"
        style={{ color: week.color, opacity: 0.07 }}
      />
      <div
        className="inline-flex items-center justify-center w-8 h-8 rounded-xl font-black text-[13px] mb-3 text-white"
        style={{ background: "linear-gradient(135deg," + week.color + "cc," + week.color + ")" }}
      >
        {week.badge}
      </div>
      <h3 className="font-extrabold text-[15px] leading-snug mb-3" style={{ color: "#EEF4F8" }}>
        {week.title}
      </h3>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {week.concepts.map(function(c) {
          return <ConceptPill key={c} label={c} accentColor={week.color} />;
        })}
      </div>
      <p className="text-[11px] leading-snug font-medium" style={{ color: week.color + "cc" }}>
        {week.outcome}
      </p>
    </div>
  );
}

// WeekNode
function WeekNode({ week, status, isLast, index }) {
  var isActive    = status === "active";
  var isCompleted = status === "completed";
  var nodeColor   = isCompleted ? "#10B981" : isActive ? "#00A9FF" : "rgba(255,255,255,0.15)";

  return (
    <div
      className="mrr-fade-up flex flex-col items-center"
      style={{ animationDelay: (80 + index * 120) + "ms" }}
    >
      <div
        className={"relative flex items-center justify-center rounded-full z-10" + (isActive ? " mrr-node-active" : "")}
        style={{
          width: 36, height: 36,
          backgroundColor: (isCompleted || isActive) ? nodeColor : "transparent",
          border: "2px solid " + nodeColor,
          flexShrink: 0,
        }}
      >
        {isCompleted ? (
          <Check size={16} strokeWidth={2.5} color="#fff" />
        ) : (
          <div
            className="rounded-full"
            style={{
              width: 10, height: 10,
              backgroundColor: isActive ? "#fff" : nodeColor,
              opacity: isActive ? 0.9 : 0.5,
            }}
          />
        )}
      </div>

      <span
        className="text-[10px] font-bold uppercase tracking-widest mt-1.5 whitespace-nowrap"
        style={{ color: isActive ? "#00A9FF" : isCompleted ? "#10B981" : "rgba(255,255,255,0.3)" }}
      >
        {week.weekLabel}
      </span>

      {!isLast && (
        <div
          className="mrr-fade-up mt-1"
          style={{
            width: 2,
            height: 52,
            background:
              "repeating-linear-gradient(to bottom," +
              (isCompleted ? "#10B981" : "rgba(255,255,255,0.15)") +
              " 0px," +
              (isCompleted ? "#10B981" : "rgba(255,255,255,0.15)") +
              " 5px,transparent 5px,transparent 10px)",
            animationDelay: (200 + index * 120) + "ms",
          }}
        />
      )}
    </div>
  );
}

// RoadmapTimeline
function RoadmapTimeline({ weeks, activeIndex }) {
  return (
    <div className="flex flex-col items-center pt-2 pb-4 mr-3 flex-shrink-0" style={{ minWidth: 68 }}>
      {weeks.map(function(week, i) {
        return (
          <WeekNode
            key={week.id}
            week={week}
            index={i}
            isLast={i === weeks.length - 1}
            status={i < activeIndex ? "completed" : i === activeIndex ? "active" : "upcoming"}
          />
        );
      })}
    </div>
  );
}

// OutcomeHeader
function OutcomeHeader({ onBack }) {
  return (
    <div className="mrr-fade-up flex-shrink-0 px-4 pt-5 pb-3" style={{ animationDelay: "0ms" }}>
      <div className="flex items-center gap-3 mb-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Go back"
          className="flex items-center justify-center rounded-full border transition-all active:scale-95"
          style={{
            width: 36, height: 36,
            borderColor: "rgba(255,255,255,0.12)",
            backgroundColor: "rgba(255,255,255,0.06)",
            color: "rgba(255,255,255,0.6)",
            flexShrink: 0,
          }}
        >
          <ChevronLeft size={18} strokeWidth={2} />
        </button>

        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{ backgroundColor: "#00A9FF18", border: "1px solid #00A9FF40" }}
        >
          <Github size={13} color="#00A9FF" strokeWidth={2} />
          <span className="text-[12px] font-bold uppercase tracking-widest" style={{ color: "#00A9FF" }}>
            Month Roadmap
          </span>
        </div>
      </div>

      <p
        className="mrr-fade-up text-[13px] leading-snug font-semibold"
        style={{ color: "rgba(255,255,255,0.5)", animationDelay: "80ms" }}
      >
        By day 30, you will ship a live project on GitHub.
      </p>
    </div>
  );
}

// ProgressCoverage
function ProgressCoverage({ covered, total }) {
  var pct = Math.round((covered / total) * 100);
  return (
    <div className="mrr-fade-up flex-shrink-0 px-4 pb-4" style={{ animationDelay: "60ms" }}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>
          Month coverage
        </span>
        <span className="text-[11px] font-extrabold" style={{ color: "#00A9FF" }}>
          {pct}%
        </span>
      </div>
      <div
        className="relative h-1.5 w-full rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Month coverage"
        style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
      >
        <div
          className="mrr-bar-fill absolute inset-y-0 left-0 rounded-full"
          style={{
            width: pct + "%",
            background: "linear-gradient(90deg,#00A9FF,#0EA5E9)",
          }}
        />
      </div>
    </div>
  );
}

// ShipCTACard
function ShipCTACard({ onContinue, delay }) {
  var [pressed, setPressed] = useState(false);
  return (
    <button
      type="button"
      onClick={onContinue}
      onMouseDown={function() { setPressed(true); }}
      onMouseUp={function() { setPressed(false); }}
      onMouseLeave={function() { setPressed(false); }}
      className="mrr-snap-card mrr-fade-up flex-shrink-0 rounded-2xl p-5 text-left relative overflow-hidden cursor-pointer"
      style={{
        width: "min(240px, 70vw)",
        background: "linear-gradient(135deg,#00A9FF22,#0EA5E920)",
        border: "1.5px solid #00A9FF50",
        animationDelay: delay + "ms",
        transform: pressed ? "scale(0.97)" : "scale(1)",
        transition: "transform 120ms ease-out",
      }}
      aria-label="Sign up to ship to GitHub"
    >
      <Github
        aria-hidden="true"
        size={72}
        strokeWidth={1.5}
        className="absolute -top-2 -right-2 pointer-events-none"
        style={{ color: "#00A9FF", opacity: 0.1 }}
      />
      <div
        className="mrr-scale-in inline-flex items-center justify-center w-8 h-8 rounded-xl mb-3"
        style={{
          background: "linear-gradient(135deg,#00A9FFcc,#0EA5E9)",
          animationDelay: (delay + 80) + "ms",
        }}
      >
        <Rocket size={15} color="#fff" strokeWidth={2} />
      </div>
      <p className="font-extrabold text-[14px] leading-snug mb-2" style={{ color: "#EEF4F8" }}>
        Ship to GitHub
      </p>
      <p className="text-[11px] leading-snug mb-4" style={{ color: "#00A9FF99" }}>
        This is your finish line. Create an account to lock in your progress.
      </p>
      <div
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold"
        style={{ backgroundColor: "#00A9FF", color: "#fff" }}
      >
        Sign up free
        <ArrowRight size={12} strokeWidth={2.5} />
      </div>
    </button>
  );
}

// Main export
export default function MonthRoadmapResult({ roadmap, path, onContinue, onBack }) {
  var planWeeks  = WEEK_PLAN.filter(function(w) { return w.skillId === "ship" || roadmap.includes(w.skillId); });
  var extraWeeks = EXTRA_WEEKS.filter(function(w) { return roadmap.includes(w.skillId); });
  var allWeeks   = planWeeks.concat(extraWeeks);
  var activeIndex = 0;
  var covered = planWeeks.length;
  var total   = planWeeks.length;

  var handleBack     = useCallback(function() { if (onBack) onBack(); }, [onBack]);
  var handleContinue = useCallback(function() { if (onContinue) onContinue(); }, [onContinue]);

  return (
    <main className="min-h-dvh flex flex-col overflow-hidden" style={{ backgroundColor: BG }}>
      <style>{CSS}</style>

      <OutcomeHeader onBack={handleBack} />
      <ProgressCoverage covered={covered} total={total} />

      <div className="flex-shrink-0 mx-4 mb-5" style={{ height: 1, backgroundColor: "rgba(255,255,255,0.07)" }} />

      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <div className="flex flex-row items-start w-full">
          <RoadmapTimeline weeks={allWeeks} activeIndex={activeIndex} />
          <div className="flex-1 flex flex-col gap-7 pt-1 min-w-0">
            {allWeeks.map(function(week, i) {
              return (
                <div key={week.id} className="flex flex-col gap-2">
                  <div className="mrr-scroll-row pr-4">
                    <StageCard week={week} delay={120 + i * 90} isActive={i === activeIndex} />
                    {i === allWeeks.length - 1 && (
                      <ShipCTACard onContinue={handleContinue} delay={120 + i * 90 + 80} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div
        className="flex-shrink-0 border-t px-4 py-4"
        style={{ backgroundColor: BG, borderColor: "rgba(255,255,255,0.07)" }}
      >
        <button
          type="button"
          onClick={handleContinue}
          className="w-full py-4 rounded-2xl font-extrabold text-[15px] uppercase tracking-wide text-white transition-all active:scale-[0.98]"
          style={{
            background: "linear-gradient(90deg,#00A9FF,#0EA5E9)",
            boxShadow: "0 4px 0 #007bcc, 0 0 24px #00A9FF30",
          }}
        >
          Create My Account
        </button>
        <p
          className="mrr-fade-up text-center text-[11px] mt-2"
          style={{ color: "rgba(255,255,255,0.3)", animationDelay: "600ms" }}
        >
          Free to start - No credit card needed
        </p>
      </div>
    </main>
  );
}