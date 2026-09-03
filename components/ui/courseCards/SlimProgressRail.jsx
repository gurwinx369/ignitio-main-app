import React from 'react';

/**
 * A slim, integrated progress rail for overview cards.
 * Presentation only.
 */
export default function SlimProgressRail({ current, total, className = "" }) {
  if (total === 0) return null;
  
  const percentage = Math.min(100, Math.max(0, (current / total) * 100));
  
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div 
        className="w-full h-1.5 bg-slate-200/60 rounded-full overflow-hidden" 
        aria-hidden="true"
      >
        <div 
          className="h-full bg-slate-800 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-[11px] font-semibold text-slate-500">
        {current}/{total} levels
      </div>
    </div>
  );
}
