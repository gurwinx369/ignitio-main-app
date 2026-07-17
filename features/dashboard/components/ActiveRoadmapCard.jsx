import { BookOpen, ArrowRight, PlayCircle } from "lucide-react";
import Link from "next/link";

export default function ActiveRoadmapCard({ activeRoadmap, isClient, onNavigate, isNavigating }) {
  if (!activeRoadmap) {
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
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 h-full flex flex-col justify-between group">
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="bg-[#06b6d4]/10 p-2.5 rounded-xl">
            <BookOpen className="w-5 h-5 text-[#0891b2]" />
          </div>
          <span className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-xs font-bold text-slate-500">
            Active
          </span>
        </div>
        
        <h3 className="text-xl font-bold text-slate-900 mb-1 leading-tight">{activeRoadmap.title}</h3>
        <p className="text-sm text-slate-500 mb-6">
          {activeRoadmap.completedLevels} of {activeRoadmap.totalLevels} levels completed
        </p>

        <div className="flex items-center gap-3 w-full mb-8">
          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-slate-900 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${isClient ? activeRoadmap.progressPercent : 0}%` }}
            ></div>
          </div>
          <span className="text-sm font-bold text-slate-700 shrink-0">
            {isClient ? activeRoadmap.progressPercent : 0}%
          </span>
        </div>
      </div>

      <button 
        onClick={onNavigate}
        disabled={isNavigating}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 transition-colors group-hover:border-slate-300"
      >
        <PlayCircle className="w-4 h-4" /> Open Full Roadmap
      </button>
    </div>
  );
}
