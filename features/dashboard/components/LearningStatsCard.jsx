import { Trophy, Star, Award, Zap } from "lucide-react";

export default function LearningStatsCard({ profileData, roadmapsData }) {
  // Aggregate basic stats
  const totalCompletedLevels = roadmapsData?.reduce((acc, r) => acc + (r.completedLevels || 0), 0) || 0;
  const startedRoadmaps = roadmapsData?.filter(r => (r.completedLevels || 0) > 0).length || 0;
  const totalPossibleLevels = roadmapsData?.filter(r => (r.completedLevels || 0) > 0).reduce((acc, r) => acc + (r.totalLevels || 0), 0) || 0;
  const overallProgress = totalPossibleLevels > 0 ? Math.round((totalCompletedLevels / totalPossibleLevels) * 100) : 0;
  
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="w-5 h-5 text-yellow-500" />
        <h3 className="text-lg font-bold text-slate-900">Learning Stats</h3>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 flex-1">
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-500 uppercase">Levels</span>
          </div>
          <span className="text-2xl font-black text-slate-900">{totalCompletedLevels}</span>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-500 uppercase">Roadmaps</span>
          </div>
          <span className="text-2xl font-black text-slate-900">{startedRoadmaps}</span>
        </div>
        
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col justify-center col-span-2 sm:col-span-1">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-500 uppercase">Progress</span>
          </div>
          <span className="text-2xl font-black text-slate-900">{overallProgress}%</span>
        </div>
      </div>
    </div>
  );
}
