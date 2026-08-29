"use client";

import React from "react";
import { Lock } from "lucide-react";

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
    
    return (
        <div className={`relative flex flex-col p-6 md:p-8 rounded-[28px] border bg-[#fffaf3] shadow-sm transition-all h-full ${isLocked ? 'border-slate-200 opacity-90' : 'border-[#f1e4d2] hover:shadow-md'}`}>
            <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-xl md:text-2xl font-extrabold tracking-tight ${isLocked ? 'text-slate-500' : 'text-slate-900'}`}>
                        {tierName}
                    </h3>
                    {isLocked && (
                        <div className="flex items-center gap-1.5 bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                            <Lock size={14} />
                            Locked
                        </div>
                    )}
                </div>
                
                <p className={`font-bold mb-1 ${isLocked ? 'text-slate-400' : 'text-[#8b5cf6]'}`}>
                    {subtitle}
                </p>
                <p className="text-sm font-semibold text-slate-500 mb-6">
                    {duration}
                </p>
                
                <div className="mb-6 flex flex-wrap gap-2 text-[15px] font-medium text-slate-700 leading-relaxed">
                    {topics.map((topic, i) => (
                        <React.Fragment key={i}>
                            <span className={isLocked ? 'text-slate-500' : 'text-slate-800'}>{topic}</span>
                            {i < topics.length - 1 && <span className="text-cyan-600 font-bold">→</span>}
                        </React.Fragment>
                    ))}
                </div>
                
                {project && (
                    <div className="mb-8">
                        <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Project</span>
                        <span className={`font-bold ${isLocked ? 'text-slate-500' : 'text-slate-900'}`}>{project}</span>
                    </div>
                )}
            </div>
            
            <div className="mt-auto pt-4">
                <button
                    onClick={!isLocked ? onClick : undefined}
                    disabled={isLocked}
                    aria-disabled={isLocked}
                    className={`w-full py-4 px-6 rounded-2xl font-bold text-[15px] transition-all flex items-center justify-center gap-2 ${
                        isLocked 
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                        : 'bg-[#06b6d4] hover:bg-[#0891b2] text-white active:scale-[0.98] shadow-sm'
                    }`}
                >
                    {ctaText}
                </button>
            </div>
        </div>
    );
}
