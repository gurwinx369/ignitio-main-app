"use client";

import React from "react";
import { CheckCircle2, Lock, PlayCircle, Terminal, HelpCircle } from "lucide-react";

export default function MilestoneCard({
  milestone,
  isActive = false,
  isCompleted = false,
  onSelect,
}) {
  const { milestoneId, title, brief, instructions = [], testCases = [] } = milestone;

  return (
    <div
      onClick={onSelect}
      className={`group relative cursor-pointer overflow-hidden rounded-2xl border p-4 transition-all duration-200 ${
        isActive
          ? "border-[#00A9FF] bg-white ring-2 ring-[#00A9FF]/20 shadow-md translate-y-[-2px]"
          : isCompleted
          ? "border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50/70 shadow-sm"
          : "border-[#DFC8B5]/60 bg-white/70 hover:bg-white opacity-85 shadow-sm"
      }`}
    >
      {/* Top Row: Milestone Number & Status */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-lg text-xs font-black ${
              isCompleted
                ? "bg-emerald-500 text-white shadow-sm"
                : isActive
                ? "bg-[#00A9FF] text-white shadow-sm animate-pulse"
                : "bg-slate-200 text-slate-600"
            }`}
          >
            {isCompleted ? "✓" : milestoneId}
          </div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
            Step {milestoneId}
          </span>
        </div>

        <div>
          {isCompleted ? (
            <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
              <CheckCircle2 className="h-3 w-3" />
              Completed
            </span>
          ) : isActive ? (
            <span className="flex items-center gap-1 rounded-full bg-[#00A9FF]/15 px-2 py-0.5 text-[10px] font-extrabold text-[#0085C7]">
              <PlayCircle className="h-3 w-3" />
              In Progress
            </span>
          ) : (
            <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
              <Lock className="h-3 w-3" />
              Locked
            </span>
          )}
        </div>
      </div>

      {/* Milestone Title & Summary */}
      <h3 className="mt-2 text-sm font-extrabold text-[#19183B] leading-snug">
        {title}
      </h3>
      <p className="mt-1 text-xs font-medium text-slate-600 leading-relaxed">
        {brief}
      </p>

      {/* If Active: Show Detailed Checklist & Tests */}
      {isActive && (
        <div className="mt-3.5 space-y-3 pt-3 border-t border-slate-100 animate-in fade-in duration-300">
          {/* Instructions */}
          {instructions.length > 0 && (
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Action Checklist
              </span>
              <ul className="mt-1.5 space-y-1.5">
                {instructions.map((inst, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-xs font-medium text-slate-700 leading-relaxed"
                  >
                    <span className="mt-0.5 flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded-full bg-slate-200 text-[9px] font-bold text-slate-600">
                      {idx + 1}
                    </span>
                    <span>{inst}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Test Expectations */}
          {testCases.length > 0 && (
            <div className="rounded-xl bg-[#FCF5EE] p-2.5 border border-[#DFC8B5]/60">
              <div className="flex items-center gap-1 text-[10px] font-extrabold text-[#19183B]">
                <Terminal className="h-3 w-3 text-[#00A9FF]" />
                <span>Verification Expectations:</span>
              </div>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {testCases.map((tc, idx) => (
                  <span
                    key={idx}
                    className="rounded-lg bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-700 border border-[#DFC8B5]/40 shadow-2xs"
                  >
                    {tc.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
