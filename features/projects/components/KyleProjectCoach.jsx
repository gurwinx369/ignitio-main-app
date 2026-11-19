"use client";

import React from "react";
import Image from "next/image";
import { Sparkles, MessageSquareQuote } from "lucide-react";

export default function KyleProjectCoach({
  message = "You've got this! Decompose the problem step by step.",
  tip = null,
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#DFC8B5] bg-gradient-to-br from-[#FCF5EE] to-[#F2E0D0] p-3.5 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-start gap-3">
        {/* Kyle / Kibo Pet Avatar */}
        <div className="relative flex-shrink-0">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#00A9FF]/15 border border-[#00A9FF]/30 text-xl shadow-inner">
            🐾
          </div>
          <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#10b981] ring-2 ring-white">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
          </span>
        </div>

        {/* Coach Speech */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#19183B]">
            <span>Kyle AI Coach</span>
            <span className="flex items-center gap-0.5 rounded-full bg-[#00A9FF]/10 px-1.5 py-0.5 text-[9px] font-bold text-[#0085C7]">
              <Sparkles className="h-2.5 w-2.5" />
              Live Mentor
            </span>
          </div>

          <p className="mt-1 text-xs font-medium leading-relaxed text-slate-700">
            {message}
          </p>

          {tip && (
            <div className="mt-2 flex items-center gap-1.5 rounded-xl bg-white/70 px-2.5 py-1.5 text-[11px] font-semibold text-[#19183B] border border-[#DFC8B5]/50">
              <MessageSquareQuote className="h-3.5 w-3.5 text-[#00A9FF] flex-shrink-0" />
              <span className="truncate">{tip}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
