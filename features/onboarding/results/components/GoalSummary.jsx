import { Target } from "lucide-react";

export default function GoalSummary({ goal }) {
  if (!goal) return null;

  return (
    <div className="bg-white text-[#001D32] border-2 border-[#FFDCBC] p-5 rounded-2xl shadow-sm flex flex-col h-full hover:border-[#4EC3FF] transition-colors">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-[#FCF5EE] rounded-lg">
          <Target className="w-5 h-5 text-[#00A9FF]" />
        </div>
        <h3 className="font-bold text-lg text-[#001D32]">Primary Goal</h3>
      </div>
      <p className="font-semibold mb-2">{goal.label}</p>
      <p className="text-sm text-slate-600 flex-grow">
        {goal.recommendation}
      </p>
    </div>
  );
}
