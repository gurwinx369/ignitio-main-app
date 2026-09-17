"use client";
import React from "react";
import {
  Brain,
  Code2,
  Database,
  GitBranch,
  Terminal,
  Cpu,
  MonitorPlay,
  Braces
} from "lucide-react";
import { cn } from "@/lib/utils";

const roadmaps = [
  {
    id: "gen-ai",
    title: "Generative AI",
    icon: Brain,
    color: "text-purple-500",
    shadow: "shadow-purple-200",
    border: "border-purple-200",
    hoverBorder: "hover:border-purple-400",
    bgHover: "hover:bg-purple-50/50",
  },
  {
    id: "dsa",
    title: "Data Structures",
    icon: Database,
    color: "text-blue-500",
    shadow: "shadow-blue-200",
    border: "border-blue-200",
    hoverBorder: "hover:border-blue-400",
    bgHover: "hover:bg-blue-50/50",
  },
  {
    id: "prompt-engineering",
    title: "Prompt Engineering",
    icon: Terminal,
    color: "text-emerald-500",
    shadow: "shadow-emerald-200",
    border: "border-emerald-200",
    hoverBorder: "hover:border-emerald-400",
    bgHover: "hover:bg-emerald-50/50",
  },
  {
    id: "cpp",
    title: "C++",
    icon: Braces,
    color: "text-indigo-500",
    shadow: "shadow-indigo-200",
    border: "border-indigo-200",
    hoverBorder: "hover:border-indigo-400",
    bgHover: "hover:bg-indigo-50/50",
  },
  {
    id: "python-beginner",
    title: "Python",
    icon: Code2,
    color: "text-yellow-500",
    shadow: "shadow-yellow-200",
    border: "border-yellow-200",
    hoverBorder: "hover:border-yellow-400",
    bgHover: "hover:bg-yellow-50/50",
  },
  {
    id: "system-design-fundamentals",
    title: "System Design",
    icon: Cpu,
    color: "text-rose-500",
    shadow: "shadow-rose-200",
    border: "border-rose-200",
    hoverBorder: "hover:border-rose-400",
    bgHover: "hover:bg-rose-50/50",
  },
  {
    id: "git-github",
    title: "Git & GitHub",
    icon: GitBranch,
    color: "text-orange-500",
    shadow: "shadow-orange-200",
    border: "border-orange-200",
    hoverBorder: "hover:border-orange-400",
    bgHover: "hover:bg-orange-50/50",
  },
  {
    id: "c-beginner",
    title: "C Language",
    icon: MonitorPlay,
    color: "text-cyan-500",
    shadow: "shadow-cyan-200",
    border: "border-cyan-200",
    hoverBorder: "hover:border-cyan-400",
    bgHover: "hover:bg-cyan-50/50",
  },
];

export default function RoadmapSelectionGrid({ onSelect }) {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-4 tracking-tight">
          What do you want to learn?
        </h1>
        <p className="text-lg text-slate-500 font-medium">
          Choose a path to start your interactive journey
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {roadmaps.map((roadmap, index) => {
          const Icon = roadmap.icon;
          return (
            <button
              key={roadmap.id}
              onClick={() => onSelect(roadmap.id)}
              className={cn(
                "group relative w-full rounded-2xl bg-white",
                "border-2 transition-all duration-200 ease-in-out",
                "flex flex-col items-center justify-center p-6 gap-4",
                "active:translate-y-1 active:shadow-none",
                roadmap.border,
                roadmap.hoverBorder,
                roadmap.bgHover,
                "hover:-translate-y-1 hover:shadow-lg",
                // Initial shadow for the Duolingo push-down effect
                `shadow-[0_4px_0_0_var(--tw-shadow-color)]`,
                roadmap.shadow,
                "overflow-hidden animate-in fade-in zoom-in duration-500 fill-mode-both"
              )}
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              {/* Shimmer Effect */}
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className={cn("p-4 rounded-xl bg-slate-50 transition-transform duration-300 group-hover:scale-110", roadmap.color)}>
                <Icon size={40} strokeWidth={1.5} />
              </div>
              <span className="font-bold text-slate-700 text-[15px] leading-tight text-center">
                {roadmap.title}
              </span>
            </button>
          );
        })}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}} />
    </div>
  );
}
