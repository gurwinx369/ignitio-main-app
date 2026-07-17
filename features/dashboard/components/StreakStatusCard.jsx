import { Flame, CheckCircle2, Shield, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function StreakStatusCard({ streak, isLoadingProfile }) {
  const [shouldPulse, setShouldPulse] = useState(false);

  useEffect(() => {
    if (streak?.status === 'completed' || streak?.status === 'today_done') {
      setShouldPulse(true);
      const timer = setTimeout(() => setShouldPulse(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [streak?.status]);

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-sm border border-slate-200 h-full flex flex-col justify-between">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" /> Your Streak
        </h3>
        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
          streak?.status === 'completed' || streak?.status === 'today_done' ? 'bg-green-100 text-green-700' :
          streak?.status === 'at_risk' ? 'bg-orange-100 text-orange-700' : 'bg-slate-200 text-slate-700'
        } ${shouldPulse ? 'animate-pulse' : ''}`}>
          {streak?.status === 'completed' || streak?.status === 'today_done' ? 'Done' :
           streak?.status === 'at_risk' ? 'At Risk' : 'Pending'}
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        {isLoadingProfile ? (
          <div className="animate-pulse flex gap-2 h-16 bg-slate-100 rounded-2xl w-full mb-4"></div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3 text-center mb-6">
              <div className="bg-orange-50/50 py-4 px-2 rounded-2xl border border-orange-100 shadow-sm flex flex-col items-center justify-center">
                <p className="text-2xl sm:text-3xl font-black text-slate-900 leading-none mb-1">
                  {streak?.currentCount || 0}
                </p>
                <p className="text-[10px] sm:text-xs font-bold text-orange-600 uppercase tracking-wide">Current</p>
              </div>
              <div className="bg-slate-50 py-4 px-2 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center">
                <p className="text-2xl sm:text-3xl font-black text-slate-900 leading-none mb-1">
                  {streak?.longestCount || 0}
                </p>
                <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wide">Longest</p>
              </div>
              <div className="bg-blue-50/50 py-4 px-2 rounded-2xl border border-blue-100 shadow-sm flex flex-col items-center justify-center">
                <p className="text-2xl sm:text-3xl font-black text-slate-900 leading-none mb-1">
                  {streak?.freezeBank || 0}
                </p>
                <p className="text-[10px] sm:text-xs font-bold text-blue-500 uppercase tracking-wide">Freezes</p>
              </div>
            </div>

            {streak?.week ? (
              <div className="flex justify-between w-full pb-2">
                {streak.week.map((day, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2 shrink-0">
                    <span className={`text-xs font-bold ${day.isToday ? 'text-slate-900' : 'text-slate-400'}`}>
                      {day.dayLabel}
                    </span>
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors
                      ${day.status === 'today_done' || day.status === 'completed' ? 'bg-green-100 text-green-600' :
                        day.status === 'today_pending' ? 'bg-white border-2 border-slate-200 text-slate-300' :
                        day.status === 'freeze_used' ? 'bg-blue-100 text-blue-500' :
                        day.status === 'missed' ? 'bg-slate-100 text-slate-300' :
                        'bg-slate-50 text-slate-200'}`}
                    >
                      {day.status === 'today_done' || day.status === 'completed' ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" /> :
                       day.status === 'freeze_used' ? <Shield className="w-4 h-4 sm:w-5 sm:h-5" /> :
                       <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-current"></div>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-12 flex items-center justify-center text-slate-500 text-sm italic mb-4">
                Start learning to build your streak.
              </div>
            )}

            {streak?.earnBack?.active && streak.earnBack.countAtRisk > 0 && (() => {
              const lessonsLeft = typeof streak.earnBack.lessonsRemaining === "number"
                ? streak.earnBack.lessonsRemaining
                : Math.max(0, 2 - (streak.earnBack.lessonsCompletedInWindow || 0));
              const msg = lessonsLeft === 1
                ? `Complete 1 more lesson to restore your ${streak.earnBack.countAtRisk}-day streak.`
                : `Complete ${lessonsLeft} lessons in the next 48 hours to restore your ${streak.earnBack.countAtRisk}-day streak.`;
              return (
                <div className="mt-4 rounded-2xl border border-orange-200 bg-orange-50 p-3 text-sm font-medium text-orange-700 flex gap-3 items-start animate-in fade-in">
                  <Flame className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>{msg}</p>
                </div>
              );
            })()}
          </>
        )}
      </div>

      <Link href="/home/profile" className="text-sm font-bold text-[#06b6d4] hover:text-[#0891b2] transition-colors flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
        View full history <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
