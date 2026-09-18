"use client";

import React from "react";
import { Lock } from "lucide-react";

/*
 * Tier hero animations intentionally contain no learning/business state.
 *
 * They are purely visual representations of each canonical GenAI tier:
 *
 * Beginner:
 * Prompt -> Python -> Files/Git -> LangChain -> Roastify
 *
 * Intermediate:
 * Documents -> Chunks -> Vector DB -> RAG -> API -> Structured Output
 *
 * Advanced:
 * Goal -> Agent -> Decision -> Tool -> Observation -> Trace
 */

const ANIMATION_STYLES = `
/* =========================================================
   SHARED
========================================================= */

@keyframes _tier_signal {
    0% {
        left: 4%;
        opacity: 0;
    }

    8% {
        opacity: 1;
    }

    88% {
        opacity: 1;
    }

    100% {
        left: calc(96% - 7px);
        opacity: 0;
    }
}

@keyframes _tier_soft_float {
    0%, 100% {
        transform: translateY(0);
    }

    50% {
        transform: translateY(-3px);
    }
}

@keyframes _tier_glow {
    0%, 100% {
        opacity: 0.38;
        transform: scale(0.96);
    }

    50% {
        opacity: 0.85;
        transform: scale(1.04);
    }
}

/* =========================================================
   BEGINNER
========================================================= */

@keyframes _beginner_prompt {
    0%, 4% {
        opacity: 0.35;
        transform: translateY(3px) scale(0.96);
    }

    10%, 24% {
        opacity: 1;
        transform: translateY(0) scale(1.03);
    }

    30%, 100% {
        opacity: 0.68;
        transform: translateY(0) scale(1);
    }
}

@keyframes _beginner_python {
    0%, 20% {
        opacity: 0.32;
        transform: translateY(3px) scale(0.96);
    }

    28%, 42% {
        opacity: 1;
        transform: translateY(0) scale(1.04);
    }

    48%, 100% {
        opacity: 0.7;
        transform: scale(1);
    }
}

@keyframes _beginner_files {
    0%, 39% {
        opacity: 0.28;
        transform: translateY(4px) scale(0.94);
    }

    47%, 61% {
        opacity: 1;
        transform: translateY(0) scale(1.04);
    }

    68%, 100% {
        opacity: 0.7;
        transform: scale(1);
    }
}

@keyframes _beginner_chain {
    0%, 58% {
        opacity: 0.28;
        transform: translateY(4px) scale(0.94);
    }

    66%, 79% {
        opacity: 1;
        transform: translateY(0) scale(1.05);
    }

    86%, 100% {
        opacity: 0.72;
        transform: scale(1);
    }
}

@keyframes _beginner_roastify {
    0%, 74% {
        opacity: 0;
        transform: translateY(6px) scale(0.86);
    }

    82%, 92% {
        opacity: 1;
        transform: translateY(0) scale(1.06);
    }

    100% {
        opacity: 0;
        transform: translateY(-2px) scale(1);
    }
}

@keyframes _beginner_type_one {
    0%, 6% {
        width: 0;
        opacity: 0;
    }

    12%, 25% {
        width: 100%;
        opacity: 1;
    }

    30%, 100% {
        opacity: 0.45;
    }
}

@keyframes _beginner_type_two {
    0%, 10% {
        width: 0;
        opacity: 0;
    }

    17%, 26% {
        width: 72%;
        opacity: 1;
    }

    31%, 100% {
        opacity: 0.35;
    }
}

/* =========================================================
   INTERMEDIATE
========================================================= */

@keyframes _rag_documents {
    0%, 5% {
        opacity: 0;
        transform: translateX(-9px) rotate(-5deg);
    }

    12%, 24% {
        opacity: 1;
        transform: translateX(0) rotate(-2deg);
    }

    32%, 100% {
        opacity: 0.58;
    }
}

@keyframes _rag_chunks {
    0%, 20% {
        opacity: 0;
        transform: scale(0.7);
    }

    28%, 40% {
        opacity: 1;
        transform: scale(1.06);
    }

    47%, 100% {
        opacity: 0.6;
        transform: scale(1);
    }
}

@keyframes _rag_vector {
    0%, 34% {
        opacity: 0.3;
        transform: scale(0.92);
    }

    42%, 54% {
        opacity: 1;
        transform: scale(1.07);
        box-shadow:
            0 0 0 6px rgba(245,158,11,0.08),
            0 0 22px rgba(245,158,11,0.22);
    }

    60%, 100% {
        opacity: 0.72;
        transform: scale(1);
    }
}

@keyframes _rag_core {
    0%, 48% {
        opacity: 0.32;
        transform: scale(0.92);
    }

    56%, 67% {
        opacity: 1;
        transform: scale(1.08);
        box-shadow:
            0 0 0 7px rgba(245,158,11,0.08),
            0 0 28px rgba(245,158,11,0.28);
    }

    74%, 100% {
        opacity: 0.76;
        transform: scale(1);
    }
}

@keyframes _rag_api {
    0%, 62% {
        opacity: 0.28;
        transform: translateY(4px) scale(0.93);
    }

    69%, 81% {
        opacity: 1;
        transform: translateY(0) scale(1.05);
    }

    88%, 100% {
        opacity: 0.72;
        transform: scale(1);
    }
}

@keyframes _rag_json {
    0%, 77% {
        opacity: 0;
        transform: translateX(8px) scale(0.9);
    }

    84%, 94% {
        opacity: 1;
        transform: translateX(0) scale(1.04);
    }

    100% {
        opacity: 0;
        transform: translateX(2px) scale(1);
    }
}

@keyframes _json_line {
    0%, 80% {
        width: 0;
        opacity: 0;
    }

    87%, 95% {
        opacity: 1;
        width: 100%;
    }

    100% {
        opacity: 0;
    }
}

/* =========================================================
   ADVANCED
========================================================= */

@keyframes _agent_goal {
    0%, 5% {
        opacity: 0.35;
        transform: translateX(-5px) scale(0.95);
    }

    12%, 26% {
        opacity: 1;
        transform: translateX(0) scale(1.04);
    }

    34%, 100% {
        opacity: 0.58;
        transform: scale(1);
    }
}

@keyframes _agent_core {
    0%, 22% {
        transform: scale(0.92);
        opacity: 0.4;
    }

    31%, 47% {
        transform: scale(1.08);
        opacity: 1;
        box-shadow:
            0 0 0 7px rgba(139,92,246,0.08),
            0 0 28px rgba(139,92,246,0.30);
    }

    55%, 100% {
        transform: scale(1);
        opacity: 0.82;
    }
}

@keyframes _agent_search {
    0%, 39% {
        opacity: 0.25;
        transform: scale(0.94);
    }

    48%, 60% {
        opacity: 1;
        transform: scale(1.08);
    }

    69%, 100% {
        opacity: 0.45;
        transform: scale(1);
    }
}

@keyframes _agent_answer {
    0%, 45% {
        opacity: 0.2;
        transform: scale(0.94);
    }

    59%, 70% {
        opacity: 1;
        transform: scale(1.08);
    }

    78%, 100% {
        opacity: 0.45;
        transform: scale(1);
    }
}

@keyframes _agent_observation {
    0%, 61% {
        opacity: 0;
        transform: translateX(6px);
    }

    68%, 81% {
        opacity: 1;
        transform: translateX(0);
    }

    88%, 100% {
        opacity: 0;
        transform: translateX(-3px);
    }
}

@keyframes _agent_trace {
    0%, 69% {
        opacity: 0.18;
        transform: scaleX(0.25);
    }

    77%, 92% {
        opacity: 1;
        transform: scaleX(1);
    }

    100% {
        opacity: 0.18;
        transform: scaleX(0.4);
    }
}

@keyframes _agent_loop {
    0%, 58% {
        stroke-dashoffset: 130;
        opacity: 0;
    }

    65% {
        opacity: 0.65;
    }

    86% {
        stroke-dashoffset: 0;
        opacity: 0.8;
    }

    100% {
        opacity: 0;
    }
}

/* =========================================================
   ACCESSIBILITY
========================================================= */

@media (prefers-reduced-motion: reduce) {
    [data-ignitio-anim] *,
    [data-ignitio-anim] *::before,
    [data-ignitio-anim] *::after {
        animation: none !important;
        transition: none !important;
    }
}
`;

/* =========================================================
   BEGINNER HERO
========================================================= */

function BeginnerHero() {
  const cyan = "#00B8E6";

  return (
    <div
      data-ignitio-anim
      className="relative h-[158px] w-full overflow-hidden"
      aria-hidden="true"
    >
      <style dangerouslySetInnerHTML={{ __html: ANIMATION_STYLES }} />

      {/* Ambient world glow */}
      <div
        className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(0,184,230,0.15), rgba(0,184,230,0))",
        }}
      />

      {/* Base learning track */}
      <div className="absolute left-[8%] right-[8%] top-[68px] h-px bg-cyan-300/20" />

      {/* Traveling energy */}
      <div
        className="absolute top-[64px] h-[8px] w-[8px] rounded-full bg-[#00D5FF]"
        style={{
          boxShadow: "0 0 15px rgba(0,213,255,0.85)",
          animation: "_tier_signal 6.4s ease-in-out infinite",
        }}
      />

      {/* Prompt */}
      <div
        className="absolute left-[3%] top-[38px] w-[48px] rounded-xl border border-cyan-400/50 bg-[#071B27]/90 p-2"
        style={{
          animation: "_beginner_prompt 6.4s ease-in-out infinite",
        }}
      >
        <span className="block text-[6px] font-black uppercase tracking-wider text-cyan-300">
          Prompt
        </span>

        <div className="mt-1.5 h-[2px] overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-cyan-300"
            style={{
              animation:
                "_beginner_type_one 6.4s ease-in-out infinite",
            }}
          />
        </div>

        <div className="mt-1 h-[2px] overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-cyan-300/70"
            style={{
              animation:
                "_beginner_type_two 6.4s ease-in-out infinite",
            }}
          />
        </div>
      </div>

      {/* Python */}
      <div
        className="absolute left-[27%] top-[43px] flex h-[45px] w-[45px] flex-col items-center justify-center rounded-xl border border-cyan-400/45 bg-[#071B27]"
        style={{
          animation: "_beginner_python 6.4s ease-in-out infinite",
        }}
      >
        <span className="font-mono text-[12px] font-black text-cyan-300">
          Py
        </span>

        <span className="mt-0.5 font-mono text-[6px] text-white/35">
          {">_"}
        </span>
      </div>

      {/* Files / Git */}
      <div
        className="absolute left-[51%] top-[41px] flex h-[50px] w-[46px] items-center justify-center"
        style={{
          animation: "_beginner_files 6.4s ease-in-out infinite",
        }}
      >
        <div className="absolute left-[4px] top-[8px] h-[32px] w-[34px] rotate-[-6deg] rounded-lg border border-cyan-400/30 bg-[#071B27]" />

        <div className="absolute left-[9px] top-[4px] flex h-[34px] w-[34px] items-center justify-center rounded-lg border border-cyan-300/55 bg-[#0B2736]">
          <span className="text-[7px] font-black text-cyan-300">
            JSON
          </span>
        </div>

        <span className="absolute -bottom-1 text-[6px] font-bold text-cyan-200/55">
          Git
        </span>
      </div>

      {/* LangChain */}
      <div
        className="absolute left-[75%] top-[42px] flex h-[48px] w-[48px] items-center justify-center"
        style={{
          animation: "_beginner_chain 6.4s ease-in-out infinite",
        }}
      >
        <div className="absolute h-[26px] w-[18px] -translate-x-[6px] rotate-[-32deg] rounded-full border-2 border-cyan-300/70" />

        <div className="absolute h-[26px] w-[18px] translate-x-[6px] rotate-[32deg] rounded-full border-2 border-cyan-300/70" />

        <span className="absolute -bottom-1 text-[6px] font-bold text-cyan-200/55">
          Chain
        </span>
      </div>

      {/* Stage labels */}
      <div className="absolute bottom-[12px] left-[5%] right-[5%] flex items-center justify-between text-[6px] font-black uppercase tracking-[0.12em] text-white/30">
        <span>Prompt</span>
        <span>Python</span>
        <span>Files</span>
        <span>LangChain</span>
      </div>

      {/* Final project spark */}
      <div
        className="absolute right-[4%] top-[13px] flex items-center gap-1 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-2 py-1"
        style={{
          animation:
            "_beginner_roastify 6.4s ease-in-out infinite",
        }}
      >
        <span className="text-[8px] text-cyan-200">✦</span>

        <span className="text-[6px] font-black uppercase tracking-wider text-cyan-200">
          Roastify
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   INTERMEDIATE HERO
========================================================= */

function IntermediateHero() {
  return (
    <div
      data-ignitio-anim
      className="relative h-[158px] w-full overflow-hidden"
      aria-hidden="true"
    >
      <style dangerouslySetInnerHTML={{ __html: ANIMATION_STYLES }} />

      <div
        className="absolute left-1/2 top-1/2 h-36 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(245,158,11,0.13), transparent 70%)",
        }}
      />

      <div className="absolute left-[5%] right-[5%] top-[72px] h-px bg-amber-300/20" />

      <div
        className="absolute top-[68px] h-[8px] w-[8px] rounded-full bg-amber-400"
        style={{
          boxShadow: "0 0 15px rgba(245,158,11,0.90)",
          animation: "_tier_signal 7s ease-in-out infinite",
        }}
      />

      {/* Documents */}
      <div
        className="absolute left-[3%] top-[42px] h-[56px] w-[42px]"
        style={{
          animation: "_rag_documents 7s ease-in-out infinite",
        }}
      >
        <div className="absolute left-1 top-2 h-10 w-8 rotate-[-7deg] rounded-md border border-amber-300/25 bg-[#211900]" />

        <div className="absolute left-2 top-0 h-10 w-8 rotate-[4deg] rounded-md border border-amber-300/50 bg-[#302200]">
          <div className="mx-1.5 mt-2 h-[2px] rounded-full bg-amber-300/60" />
          <div className="mx-1.5 mt-1 h-[2px] w-4 rounded-full bg-amber-300/30" />
        </div>

        <span className="absolute bottom-0 left-1 text-[6px] font-black uppercase text-amber-200/50">
          Docs
        </span>
      </div>

      {/* Chunks */}
      <div
        className="absolute left-[22%] top-[50px] grid grid-cols-2 gap-[3px]"
        style={{
          animation: "_rag_chunks 7s ease-in-out infinite",
        }}
      >
        {Array.from({ length: 6 }).map((_, index) => (
          <span
            key={index}
            className={[
              "block h-[8px] w-[13px] rounded-[3px] border",
              index === 2 || index === 3
                ? "border-amber-300/70 bg-amber-300/25"
                : "border-amber-300/25 bg-amber-300/5",
            ].join(" ")}
          />
        ))}

        <span className="col-span-2 mt-0.5 text-center text-[5px] font-black uppercase text-amber-200/45">
          chunks
        </span>
      </div>

      {/* Vector DB */}
      <div
        className="absolute left-[38%] top-[45px] flex h-[52px] w-[42px] flex-col items-center justify-center rounded-xl border border-amber-300/40 bg-[#241A00]"
        style={{
          animation: "_rag_vector 7s ease-in-out infinite",
        }}
      >
        <div className="grid grid-cols-3 gap-[2px]">
          {Array.from({ length: 9 }).map((_, index) => (
            <span
              key={index}
              className={[
                "h-[4px] w-[4px] rounded-full",
                index === 4
                  ? "bg-amber-300"
                  : "bg-amber-200/25",
              ].join(" ")}
            />
          ))}
        </div>

        <span className="mt-1 text-[5px] font-black uppercase text-amber-200/45">
          vectors
        </span>
      </div>

      {/* RAG core */}
      <div
        className="absolute left-[56%] top-[43px] flex h-[56px] w-[56px] flex-col items-center justify-center rounded-full border border-amber-300/60 bg-[#2B1F00]"
        style={{
          animation: "_rag_core 7s ease-in-out infinite",
        }}
      >
        <span className="text-[10px] font-black text-amber-300">
          RAG
        </span>

        <span className="mt-0.5 text-[5px] font-semibold uppercase text-amber-100/40">
          retrieve
        </span>
      </div>

      {/* API */}
      <div
        className="absolute left-[76%] top-[48px] flex h-[45px] w-[42px] flex-col items-center justify-center rounded-xl border border-amber-300/45 bg-[#211900]"
        style={{
          animation: "_rag_api 7s ease-in-out infinite",
        }}
      >
        <span className="text-[8px] font-black text-amber-300">
          API
        </span>

        <span className="mt-1 rounded bg-amber-300/10 px-1 py-[1px] font-mono text-[4px] text-amber-200/45">
          POST
        </span>
      </div>

      {/* Structured output */}
      <div
        className="absolute right-[1%] top-[21px] w-[55px] rounded-lg border border-amber-300/35 bg-[#211900] p-1.5"
        style={{
          animation: "_rag_json 7s ease-in-out infinite",
        }}
      >
        <span className="block font-mono text-[7px] font-black text-amber-300">
          {"{ }"}
        </span>

        <div className="mt-1 h-[2px] overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full rounded-full bg-amber-300/70"
            style={{
              animation:
                "_json_line 7s ease-in-out infinite",
            }}
          />
        </div>

        <div className="mt-1 h-[2px] overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full max-w-[65%] rounded-full bg-amber-300/40"
            style={{
              animation:
                "_json_line 7s .13s ease-in-out infinite",
            }}
          />
        </div>
      </div>

      <div className="absolute bottom-[12px] left-[4%] right-[4%] flex items-center justify-between text-[5px] font-black uppercase tracking-[0.1em] text-amber-100/30">
        <span>Ingest</span>
        <span>Embed</span>
        <span>Retrieve</span>
        <span>Serve</span>
        <span>Validate</span>
      </div>
    </div>
  );
}

/* =========================================================
   ADVANCED HERO
========================================================= */

function AdvancedHero() {
  return (
    <div
      data-ignitio-anim
      className="relative h-[158px] w-full overflow-hidden"
      aria-hidden="true"
    >
      <style dangerouslySetInnerHTML={{ __html: ANIMATION_STYLES }} />

      <div
        className="absolute left-[49%] top-[46%] h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(139,92,246,0.16), transparent 70%)",
        }}
      />

      {/* Decision graph */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 250 158"
        fill="none"
      >
        <path
          d="M54 78 L101 78"
          stroke="rgba(196,181,253,0.28)"
          strokeWidth="1.4"
        />

        <path
          d="M143 69 C164 58 170 45 184 38"
          stroke="rgba(196,181,253,0.38)"
          strokeWidth="1.3"
        />

        <path
          d="M143 84 C165 92 170 105 184 112"
          stroke="rgba(196,181,253,0.38)"
          strokeWidth="1.3"
        />

        {/* Observation loop */}
        <path
          d="M202 46 C230 58 228 105 203 114 C175 126 142 112 130 94"
          stroke="#8b5cf6"
          strokeWidth="1.4"
          strokeDasharray="5 5"
          style={{
            animation:
              "_agent_loop 7.2s ease-in-out infinite",
          }}
        />
      </svg>

      {/* Goal */}
      <div
        className="absolute left-[3%] top-[51px] w-[48px] rounded-xl border border-violet-300/35 bg-[#15092D] p-2"
        style={{
          animation: "_agent_goal 7.2s ease-in-out infinite",
        }}
      >
        <span className="block text-[5px] font-black uppercase tracking-wider text-violet-300/55">
          Goal
        </span>

        <div className="mt-1.5 h-[2px] rounded-full bg-violet-300/60" />
        <div className="mt-1 h-[2px] w-[70%] rounded-full bg-violet-300/25" />
      </div>

      {/* Agent */}
      <div
        className="absolute left-[40%] top-[45px] flex h-[64px] w-[64px] flex-col items-center justify-center rounded-[22px] border border-violet-300/55 bg-[#1A0A3C]"
        style={{
          animation: "_agent_core 7.2s ease-in-out infinite",
        }}
      >
        <span className="text-[8px] font-black uppercase tracking-wide text-violet-300">
          AI Agent
        </span>

        <span className="mt-1 text-[5px] font-semibold text-violet-200/40">
          decide next
        </span>

        <div className="mt-2 flex gap-[3px]">
          <span className="h-[4px] w-[4px] rounded-full bg-violet-300/35" />
          <span className="h-[4px] w-[4px] rounded-full bg-violet-300" />
          <span className="h-[4px] w-[4px] rounded-full bg-violet-300/35" />
        </div>
      </div>

      {/* Search branch */}
      <div
        className="absolute right-[9%] top-[24px] flex h-[42px] w-[48px] flex-col items-center justify-center rounded-xl border border-violet-300/40 bg-[#15092D]"
        style={{
          animation: "_agent_search 7.2s ease-in-out infinite",
        }}
      >
        <span className="text-[7px] font-black text-violet-300">
          SEARCH
        </span>

        <span className="mt-1 text-[5px] text-violet-200/35">
          notes
        </span>
      </div>

      {/* Direct answer branch */}
      <div
        className="absolute right-[9%] top-[92px] flex h-[42px] w-[48px] flex-col items-center justify-center rounded-xl border border-violet-300/40 bg-[#15092D]"
        style={{
          animation: "_agent_answer 7.2s ease-in-out infinite",
        }}
      >
        <span className="text-[7px] font-black text-violet-300">
          ANSWER
        </span>

        <span className="mt-1 text-[5px] text-violet-200/35">
          direct
        </span>
      </div>

      {/* Observation returning */}
      <div
        className="absolute right-[1%] top-[68px] rounded-full border border-violet-300/30 bg-violet-300/10 px-2 py-1"
        style={{
          animation:
            "_agent_observation 7.2s ease-in-out infinite",
        }}
      >
        <span className="text-[5px] font-black uppercase tracking-wide text-violet-300">
          observation
        </span>
      </div>

      {/* LangSmith / trace */}
      <div className="absolute bottom-[9px] left-[14%] right-[14%] flex items-center gap-2">
        <span className="shrink-0 text-[5px] font-black uppercase tracking-widest text-violet-200/35">
          Trace
        </span>

        <div
          className="flex h-[18px] flex-1 origin-left items-center gap-[2px]"
          style={{
            animation:
              "_agent_trace 7.2s ease-in-out infinite",
          }}
        >
          {[5, 10, 6, 15, 8, 13, 5, 11, 7, 14, 6].map(
            (height, index) => (
              <span
                key={index}
                className="block w-[3px] rounded-full bg-violet-300/65"
                style={{ height }}
              />
            ),
          )}
        </div>

        <span className="text-[5px] font-bold text-violet-300/55">
          eval
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   CONFIG
========================================================= */

const HERO_MAP = {
  BEGINNER: BeginnerHero,
  INTERMEDIATE: IntermediateHero,
  ADVANCED: AdvancedHero,
};

const TIER_THEME = {
  BEGINNER: {
    badge:
      "border-cyan-200 bg-cyan-50 text-cyan-700",
    heroBg:
      "from-[#061B27] via-[#082533] to-[#0B3040]",
    accent: "text-[#00B8E6]",
    ctaBg:
      "bg-[#08B8D4] text-white hover:bg-[#08B8D4]",
    lockedBg:
      "cursor-not-allowed bg-slate-100 text-slate-400",
    cardBg: "bg-[#F0FDFF]",
    border: "border-cyan-100",
  },

  INTERMEDIATE: {
    badge:
      "border-amber-200 bg-amber-50 text-amber-700",
    heroBg:
      "from-[#181100] via-[#241900] to-[#302200]",
    accent: "text-amber-500",
    ctaBg:
      "bg-amber-500 text-white hover:bg-amber-500",
    lockedBg:
      "cursor-not-allowed bg-amber-50 text-amber-300",
    cardBg: "bg-[#FFFBEB]",
    border: "border-amber-100",
  },

  ADVANCED: {
    badge:
      "border-violet-200 bg-violet-50 text-violet-700",
    heroBg:
      "from-[#0C041C] via-[#13072D] to-[#1C0B40]",
    accent: "text-violet-400",
    ctaBg:
      "bg-violet-600 text-white hover:bg-violet-600",
    lockedBg:
      "cursor-not-allowed bg-violet-50 text-violet-300",
    cardBg: "bg-[#FAF5FF]",
    border: "border-violet-100",
  },
};

/* =========================================================
   CARD
========================================================= */

export default function GenAiTierCard({
  tierName,
  subtitle,
  duration,
  topics,
  project,
  state,
  ctaText,
  onClick,
}) {
  const isLocked = state === "locked";

  const theme =
    TIER_THEME[tierName] ??
    TIER_THEME.BEGINNER;

  const HeroComponent =
    HERO_MAP[tierName] ??
    BeginnerHero;

  return (
    <div
      className={[
        "relative flex h-full flex-col overflow-hidden rounded-[24px] border shadow-sm",
        "transition-[transform,box-shadow] duration-200",
        theme.cardBg,
        theme.border,
        !isLocked &&
        "hover:-translate-y-[3px] hover:shadow-lg",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ minHeight: 580 }}
    >
      {/* Hero */}
      <div className="px-3 pt-3">
        <div
          className={[
            "relative overflow-hidden rounded-[18px] h-[310px]",
            "bg-gradient-to-br",
            theme.heroBg,
          ].join(" ")}
        >
        <div className="absolute left-4 right-4 top-4 z-20 flex items-center justify-between">
          <span
            className={[
              "rounded-full border px-2.5 py-1",
              "text-[10px] font-bold uppercase tracking-[0.18em]",
              theme.badge,
            ].join(" ")}
          >
            {tierName}
          </span>

          {isLocked && (
            <div className="flex items-center gap-1.5 rounded-full border border-white/5 bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white/65">
              <Lock
                size={11}
                aria-hidden="true"
              />

              Locked
            </div>
          )}
        </div>

        <div className="px-3 pb-2 pt-[42px] h-full flex items-center justify-center">
          <HeroComponent />
        </div>
        </div>
      </div>

      {/* Information */}
      <div className="flex flex-1 flex-col px-6 pt-5 pb-6">
        <p className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-400">
          {duration}
        </p>

        <h3 className="mb-0.5 text-lg font-extrabold tracking-tight text-slate-900">
          {subtitle}
        </h3>

        <div className="mb-4 mt-1.5 flex flex-wrap items-center gap-1">
          {topics.map(
            (topic, index) => (
              <React.Fragment
                key={`${topic}-${index}`}
              >
                <span className="text-[13px] font-semibold text-slate-700">
                  {topic}
                </span>

                {index <
                  topics.length -
                  1 && (
                    <span
                      className={[
                        "text-[13px] font-bold",
                        theme.accent,
                      ].join(
                        " ",
                      )}
                    >
                      →
                    </span>
                  )}
              </React.Fragment>
            ),
          )}
        </div>

        {project && (
          <div className="mb-4">
            <span className="mb-0.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Project
            </span>

            <span className="text-sm font-bold text-slate-800">
              {project}
            </span>
          </div>
        )}

        <div className="mt-auto pt-2">
          <button
            type="button"
            onClick={
              !isLocked
                ? onClick
                : undefined
            }
            disabled={isLocked}
            aria-disabled={isLocked}
            className={[
              "flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3",
              "text-[14px] font-bold",
              "transition-[transform,box-shadow] duration-150",
              isLocked
                ? theme.lockedBg
                : [
                  theme.ctaBg,
                  "shadow-sm",
                  "active:translate-y-[2px]",
                  "active:scale-[0.98]",
                  "active:shadow-none",
                ].join(
                  " ",
                ),
            ].join(" ")}
          >
            {isLocked && (
              <Lock
                size={13}
                aria-hidden="true"
              />
            )}

            {ctaText}
          </button>
        </div>
      </div>
    </div>
  );
}