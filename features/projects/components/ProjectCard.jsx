"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Terminal, Clock, CheckCircle2, ArrowRight } from "lucide-react";
import { useCardLoader, SpinnerIcon, SuccessIcon, StatusBadge, CardInfoShimmer } from "@/components/ui/courseCards/CardLoader";

/**
 * Animated Code Terminal Window for Project Hero
 */
function ProjectTerminalVisual({ project }) {
  const isPython = project.track === "python";
  const isWeb = project.track === "web";
  const isCpp = project.track === "cpp" || project.track === "c";

  return (
    <div
      className="relative h-full w-full overflow-hidden p-3 font-mono text-[11px] leading-relaxed select-none"
      style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
        fontFamily: "'Fira Code', 'Fira Mono', monospace",
      }}
    >
      {/* Background Dot Grid */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(148,163,184,0.25) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      {/* Mini Window Bar */}
      <div className="relative z-10 flex items-center justify-between border-b border-slate-700/60 pb-2 mb-2.5">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <div className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
          <div className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          <span className="ml-2 text-[10px] font-semibold text-slate-400">
            {isPython ? "main.py" : isCpp ? "main.cpp" : "index.js"}
          </span>
        </div>
        <span className="text-[9px] font-bold uppercase tracking-wider text-cyan-400/80">
          ● Live Sandbox
        </span>
      </div>

      {/* Simulated Code Lines */}
      <div className="relative z-10 space-y-1 text-slate-300">
        <div>
          <span className="text-purple-400">import </span>
          <span className="text-blue-300">random</span>
        </div>
        <div>
          <span className="text-purple-400">def </span>
          <span className="text-yellow-300">play</span>
          <span className="text-slate-400">():</span>
        </div>
        <div className="pl-3">
          <span className="text-slate-400">target = </span>
          <span className="text-blue-300">random</span>
          <span className="text-slate-400">.</span>
          <span className="text-yellow-300">randint</span>
          <span className="text-slate-400">(</span>
          <span className="text-emerald-400">1</span>
          <span className="text-slate-400">, </span>
          <span className="text-emerald-400">100</span>
          <span className="text-slate-400">)</span>
        </div>
      </div>

      {/* Mini Terminal Output Box */}
      <div className="relative z-10 mt-3 rounded-lg border border-slate-700/70 bg-slate-900/90 p-2 shadow-inner">
        <div className="flex items-center justify-between text-[9px] text-slate-400 mb-1 border-b border-slate-800 pb-1">
          <span>TERMINAL</span>
          <span className="text-emerald-400">READY</span>
        </div>
        <div className="text-[10.5px] text-emerald-400 flex items-center gap-1.5">
          <span className="text-cyan-400">❯</span>
          <span>Guess (1-100): 42</span>
        </div>
        <div className="text-[10px] text-amber-300/90 pl-3">
          ▲ Too low! Higher...
        </div>
      </div>
    </div>
  );
}

export default function ProjectCard({ project, onClick }) {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);

  const progress = project.progress;
  const completedCount = progress?.completedMilestones?.length || 0;
  const totalMilestones = project.milestones?.length || 3;
  const percent = progress?.percentComplete || 0;
  const isFinished = progress?.isCompleted;
  const isStarted = completedCount > 0;

  const statusLabel = isFinished
    ? "Completed"
    : isStarted
    ? "In Progress"
    : "Not Started";

  const handleNavigate = () => {
    if (onClick) {
      onClick();
    } else {
      router.push(`/home/projects/${project.slug}`);
    }
  };

  const {
    state,
    handleClick,
    isLocked,
    isLoading,
    isSuccess,
    isPressing,
  } = useCardLoader(handleNavigate, 600);

  const isActive = isLoading || isSuccess;

  const transform = isPressing
    ? "translateY(2px) scale(0.985)"
    : hovered
    ? "translateY(-2px)"
    : "translateY(0)";

  const cardShadow = isActive
    ? "drop-shadow(0 7px 12px rgba(25,24,59,0.09))"
    : hovered
    ? "drop-shadow(0 10px 15px rgba(25,24,59,0.12))"
    : "drop-shadow(0 5px 10px rgba(25,24,59,0.07))";

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative flex flex-col w-full overflow-hidden select-none cursor-pointer"
      style={{
        borderRadius: 24,
        minHeight: 520,
        transform,
        filter: cardShadow,
        transition: "transform 160ms ease, filter 160ms ease",
        background: "#F2E0D0",
      }}
    >
      {/* ── TOP HERO (ANIMATED TERMINAL) ── */}
      <div className="px-3 pt-3">
        <div
          className="relative overflow-hidden shrink-0 rounded-[18px]"
          style={{
            height: 250,
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
          }}
        >
          <ProjectTerminalVisual project={project} />
          <StatusBadge state={state} status={statusLabel} />
        </div>
      </div>

      {/* ── BOTTOM INFO ── */}
      <div className="relative px-6 pt-5 pb-6 flex-grow flex flex-col">
        <CardInfoShimmer state={state} />

        {/* Duration & Difficulty Tag */}
        <div className="flex items-center justify-between gap-1.5 mb-2.5">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#19183B]/55 flex-shrink-0" />
            <span className="text-[11px] font-bold tracking-widest uppercase text-[#19183B]/70">
              {project.estimatedMinutes || 25} Mins
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-extrabold text-[#19183B] bg-white/60 px-2.5 py-0.5 rounded-full border border-[#DFC8B5]/60 shadow-2xs">
            <span className="capitalize">{project.difficulty || "Beginner"}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-[18px] font-extrabold leading-tight text-[#19183B] mb-1.5 group-hover:text-[#0085C7] transition-colors">
          {project.title}
        </h3>

        {/* Description */}
        <p className="text-[13.5px] font-medium leading-[1.5] text-[#19183B]/80 mb-3 line-clamp-2">
          {project.description}
          <span className="text-[#00A9FF] font-bold ml-1">...more</span>
        </p>

        {/* Milestones Progress */}
        <div className="mt-auto pt-2">
          <div className="flex items-center justify-between text-[11px] font-semibold text-[#19183B]/60 mb-1.5">
            <span>
              {completedCount}/{totalMilestones} Milestones
            </span>
            <span>{percent}%</span>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-[#19183B]/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#00A9FF] to-cyan-400 transition-all duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* Tactile Push Button */}
        <div className="flex justify-center mt-4">
          <div
            className="
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-full
              bg-[#00A9FF]
              text-[#19183B]
              shadow-[0_4px_0_#0085C7]
              transition-[transform,box-shadow]
              duration-150
              ease-out
              group-hover:-translate-y-px
              group-active:translate-y-[2px]
              group-active:scale-[0.98]
              group-active:shadow-[0_1px_0_#0085C7]
            "
          >
            {isLoading && <SpinnerIcon size={16} color="#19183B" />}
            {isSuccess && <SuccessIcon size={16} color="#19183B" />}
            {!isLoading && !isSuccess && (
              <ArrowRight className="w-5 h-5 text-white transition-transform group-hover:translate-x-0.5" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
