"use client";

import React from "react";
import { Plus, Compass, Sparkles } from "lucide-react";

/**
 * AddRoadmapCard
 * High-performance, zero-blur action card placed at the first position in the Roadmap Worlds carousel.
 * Styled with Ignitio light blue dotted border, centered plus sign, and 60-FPS compositor-friendly CSS.
 */
export default function AddRoadmapCard({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Add New Roadmap World"
      className="
        group
        relative
        flex
        h-full
        w-full
        flex-col
        items-center
        justify-between
        rounded-[28px]
        border-2
        border-[#00A9FF]/35
        bg-[#FBFDFF]
        p-7
        text-left
        transition-[transform,border-color,box-shadow]
        duration-150
        hover:-translate-y-1
        hover:border-[#00A9FF]
        hover:bg-white
        hover:shadow-[0_12px_24px_rgba(0,169,255,0.12)]
        active:translate-y-0
        active:scale-[0.99]
      "
    >
      {/* Top Badge: "Explore New Worlds" */}
      <div className="flex w-full items-center justify-between">
        <div
          className="
            inline-flex
            items-center
            gap-1.5
            rounded-full
            border
            border-[#00A9FF]/25
            bg-[#00A9FF]/10
            px-3
            py-1
            text-[11px]
            font-bold
            text-[#0077B6]
            transition-colors
            group-hover:border-[#00A9FF]/40
            group-hover:bg-[#00A9FF]/15
          "
        >
          <Sparkles className="h-3 w-3 text-[#00A9FF]" />
          <span>Catalog</span>
        </div>

        <div className="flex items-center gap-1 text-[11px] font-semibold text-[#19183B]/50">
          <Compass className="h-3.5 w-3.5 text-[#00A9FF]" />
          <span>7 Worlds</span>
        </div>
      </div>

      {/* Center Hero: Glowing Light Blue Plus Sign & Wording */}
      <div className="my-auto flex flex-col items-center text-center">
        {/* Crisp Light Blue Plus Button */}
        <div
          className="
            relative
            flex
            h-20
            w-20
            items-center
            justify-center
            rounded-full
            border-2
            border-[#00A9FF]/30
            bg-white
            shadow-[0_6px_20px_rgba(0,169,255,0.12)]
            transition-all
            duration-200
            group-hover:scale-110
            group-hover:border-[#00A9FF]
            group-hover:shadow-[0_10px_28px_rgba(0,169,255,0.25)]
          "
        >
          <Plus
            className="
              relative
              h-9
              w-9
              text-[#00A9FF]
              transition-transform
              duration-200
              group-hover:rotate-90
            "
            strokeWidth={2.8}
          />
        </div>

        {/* Text Details */}
        <h3
          className="
            mt-6
            text-xl
            font-black
            tracking-tight
            text-[#19183B]
            transition-colors
            group-hover:text-[#0077B6]
          "
        >
          Add New World
        </h3>

        <p className="mt-2 max-w-[210px] text-xs font-semibold leading-relaxed text-[#19183B]/65">
          Discover your next skill journey and expand your stack.
        </p>
      </div>

      {/* Bottom Action Pill */}
      <div className="w-full">
        <div
          className="
            flex
            w-full
            items-center
            justify-center
            gap-2
            rounded-2xl
            border
            border-[#00A9FF]/30
            bg-[#00A9FF]/10
            py-3
            text-xs
            font-extrabold
            text-[#0077B6]
            shadow-sm
            transition-all
            duration-200
            group-hover:border-[#00A9FF]
            group-hover:bg-[#00A9FF]
            group-hover:text-white
            group-hover:shadow-[0_6px_18px_rgba(0,169,255,0.30)]
          "
        >
          <span>Explore Catalog</span>
          <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
        </div>
      </div>
    </button>
  );
}
