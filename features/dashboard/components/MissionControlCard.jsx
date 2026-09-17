import { Target, Zap } from "lucide-react";

export default function MissionControlCard({
  activeRoadmap,
  isClient,
  isNavigating,
  onNavigate
}) {
  const progress = isClient && activeRoadmap ? activeRoadmap.progressPercent : 0;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 flex flex-col relative overflow-hidden transition-shadow hover:shadow-md animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Background ambient glow for desktop */}
      <div className="hidden md:block absolute -right-24 -top-24 w-64 h-64 bg-[#06b6d4]/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex-1 w-full">
          <span className="text-xs md:text-sm font-bold text-[#06b6d4] tracking-widest uppercase mb-2 flex items-center gap-2">
            <Target className="w-4 h-4" />
            MISSION CONTROL
          </span>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4 leading-tight">
            {activeRoadmap ? `Continue ${activeRoadmap.title}` : "Start Your Learning Journey"}
          </h2>
          <div className="flex items-center gap-4 w-full">
            <div className="flex-1 max-w-md h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#06b6d4] rounded-full shadow-sm transition-all duration-1000 ease-out relative overflow-hidden"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]" style={{ transform: 'translateX(-100%)' }}></div>
              </div>
            </div>
            <span className="text-sm font-semibold text-slate-500 shrink-0">
              {progress}%
            </span>
          </div>
          <button
            onClick={onNavigate}
            disabled={isNavigating}
            className={`mt-6 w-full md:w-auto px-8 py-3.5 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-md active:scale-95 shrink-0 ${isNavigating ? "opacity-75 cursor-not-allowed" : ""
              }`}
          >
            {isNavigating ? "Loading..." : (activeRoadmap ? "Continue Learning" : "Explore Roadmaps")}
          </button>
        </div>

        {/* Desktop-only XP Energy Core */}
        <div className="hidden md:flex flex-col items-center justify-center relative shrink-0 w-32 h-32 mr-4">
          {/* Outer rotating dashed ring */}
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#06b6d4]/30 animate-[spin_10s_linear_infinite]"></div>
          {/* Inner pulsating glow */}
          <div className="absolute inset-4 rounded-full bg-[#06b6d4]/10 animate-pulse"></div>
          {/* Core ring based on progress */}
          <svg className="absolute inset-0 w-full h-full transform -rotate-90">
            <circle cx="64" cy="64" r="56" fill="none" stroke="#f1f5f9" strokeWidth="6" />
            <circle
              cx="64" cy="64" r="56" fill="none" stroke="#06b6d4" strokeWidth="6"
              strokeDasharray="351.86"
              strokeDashoffset={351.86 - (351.86 * progress) / 100}
              className="transition-all duration-1000 ease-out"
              strokeLinecap="round"
            />
          </svg>
          <div className="relative z-10 flex flex-col items-center justify-center mt-1">
            <Zap className="w-6 h-6 text-[#06b6d4] mb-1 animate-pulse" />
            <span className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Energy</span>
          </div>

          {/* Orbiting particle */}
          <div className="absolute inset-0 animate-[spin_4s_linear_infinite]">
            <div className="w-2.5 h-2.5 bg-[#0891b2] rounded-full absolute -top-1.5 left-1/2 -translate-x-1/2 shadow-[0_0_8px_rgba(8,145,178,0.8)]"></div>
          </div>
        </div>
      </div>

      {/* New Desktop-only Mission Energy Trail */}
      <div className="hidden lg:block mt-8 pt-6 border-t border-slate-100 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-bold text-slate-900">Mission Energy</span>
        </div>
        <div className="relative w-full h-8">
          {/* Background Track */}
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-slate-100 rounded-full"></div>

          {/* Active Track */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1/2 h-[2px] bg-[#06b6d4] rounded-full"></div>

          {/* Animated dot moving across the full track */}
          <div className="absolute left-0 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 bg-[#06b6d4] rounded-full shadow-[0_0_10px_rgba(6,182,212,1)] animate-[slide_4s_ease-in-out_infinite_alternate] z-20"></div>

          {/* Nodes */}
          <div className="absolute left-0 top-1/2 flex flex-col items-center -translate-x-1/2 -translate-y-1/2">
            <div className="w-4 h-4 rounded-full bg-white border-2 border-[#06b6d4] shadow-[0_0_10px_rgba(6,182,212,0.4)] z-10"></div>
            <span className="absolute top-6 text-xs font-bold text-[#06b6d4]">Learn</span>
          </div>

          <div className="absolute left-1/2 top-1/2 flex flex-col items-center -translate-x-1/2 -translate-y-1/2">
            <div className="w-4 h-4 rounded-full bg-white border-2 border-[#06b6d4] z-10"></div>
            <span className="absolute top-6 text-xs font-bold text-slate-500">Practice</span>
          </div>

          <div className="absolute left-full top-1/2 flex flex-col items-center -translate-x-1/2 -translate-y-1/2">
            <div className="w-4 h-4 rounded-full bg-slate-100 border-2 border-slate-200 z-10"></div>
            <span className="absolute top-6 text-xs font-bold text-slate-300">Unlock</span>
          </div>
        </div>
        <style jsx>{`
          @keyframes slide {
            0% { left: 0%; opacity: 0.5; }
            50% { opacity: 1; }
            100% { left: 100%; opacity: 0.5; }
          }
        `}</style>
      </div>

    </div>
  );
}
