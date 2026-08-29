import { BookOpen, PlayCircle, Loader2 } from "lucide-react";

export default function ActiveRoadmapCard({ activeRoadmap, isClient, onNavigate, isNavigating }) {
  if (!activeRoadmap) {
    // This branch is kept for safety but Dashboard's Home tab
    // handles the new-user empty state before rendering this card.
    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 h-full flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-4">
          <BookOpen className="w-6 h-6 text-slate-300" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">No Active Roadmap</h3>
        <p className="text-sm text-slate-500 mb-6">Start a roadmap to track your specific progress here.</p>
        <button
          onClick={onNavigate}
          className="px-6 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors text-sm"
        >
          Explore Roadmaps
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 flex flex-col gap-5">
      {/* Eyebrow */}
      <p className="text-[11px] font-bold text-[#0891b2] uppercase tracking-widest">
        Current Roadmap
      </p>

      {/* Title */}
      <h3 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight -mt-2">
        {activeRoadmap.title}
      </h3>

      {/* Level count */}
      <p className="text-sm text-slate-500 -mt-3">
        {isClient ? activeRoadmap.completedLevels : 0} of {activeRoadmap.totalLevels} levels
      </p>

      {/* Progress bar + percentage */}
      <div className="flex items-center gap-3 w-full">
        <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#06b6d4] rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${isClient ? activeRoadmap.progressPercent : 0}%` }}
          />
        </div>
        <span className="text-sm font-bold text-slate-700 shrink-0 w-10 text-right">
          {isClient ? activeRoadmap.progressPercent : 0}%
        </span>
      </div>

      {/* CTA */}
      <button
        onClick={onNavigate}
        disabled={isNavigating}
        className={[
          "w-full flex items-center justify-center gap-2",
          "px-4 py-3.5",
          "rounded-xl",
          "text-sm font-bold",
          "transition-all duration-200",
          isNavigating
            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
            : "bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.98]",
        ].join(" ")}
      >
        {isNavigating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            Loading…
          </>
        ) : (
          <>
            <PlayCircle className="w-4 h-4 shrink-0" />
            Continue Learning
          </>
        )}
      </button>
    </div>
  );
}
