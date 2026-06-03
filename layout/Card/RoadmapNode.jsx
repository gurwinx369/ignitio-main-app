import React from 'react';
import { Lock, Check } from 'lucide-react';

const RoadmapNode = ({ level, index, status, theme, onClick }) => {
    // status: 'completed', 'unlocked', 'locked'
    const isLocked = status === 'locked';
    const isCompleted = status === 'completed';
    const isUnlocked = status === 'unlocked';
    
    // Core base styles with responsive sizes and strict flex constraints to prevent squashing
    let baseStyles = `
        relative w-14 h-14 md:w-[72px] md:h-[72px] min-w-[56px] min-h-[56px] md:min-w-[72px] md:min-h-[72px]
        aspect-square rounded-full shrink-0 flex-none flex items-center justify-center border-4 transition-all duration-300 shadow-md 
    `.trim();
    
    let stateStyles = "";
    if (isLocked) {
        stateStyles = "bg-gray-200 border-gray-300 text-gray-400 opacity-60 grayscale cursor-pointer hover:scale-105 active:scale-95";
    } else if (isCompleted) {
        stateStyles = "bg-[var(--color-primary)] text-white hover:scale-105 active:scale-95 cursor-pointer";
    } else if (isUnlocked) {
        stateStyles = "bg-white text-gray-900 cursor-pointer animate-pulse hover:animate-none hover:scale-110 active:scale-95";
    }

    // Nodes are always circles now, so no inner rotation needed
    const innerRotation = "";

    return (
        <div className="relative group flex flex-col items-center">
            {/* The Node */}
            <div 
                className={`${baseStyles} ${stateStyles}`}
                style={{ 
                    borderColor: (isCompleted || isUnlocked) ? theme.accent : undefined,
                    backgroundColor: isCompleted ? theme.accent : undefined,
                    boxShadow: (isCompleted || isUnlocked) ? `0 0 20px ${theme.glow}` : undefined
                }}
                onClick={() => onClick(level)}
            >
                <div className={`flex items-center justify-center transition-transform duration-300 ${innerRotation} ${isCompleted ? 'group-hover:-translate-y-1' : ''}`}>
                    {isLocked ? (
                        <Lock className="w-5 h-5 md:w-6 md:h-6" />
                    ) : isCompleted ? (
                        <Check className="w-6 h-6 md:w-8 md:h-8 font-bold" />
                    ) : (
                        <span className="text-lg md:text-xl font-extrabold text-gray-800">{index + 1}</span>
                    )}
                </div>
            </div>
            
            {/* Title floating below node */}
            <div className="absolute top-16 md:top-20 w-32 md:w-40 text-center opacity-80 group-hover:opacity-100 transition-opacity pointer-events-none">
                <span className={`text-xs md:text-sm font-bold uppercase tracking-wider ${isLocked ? 'text-gray-400' : 'text-gray-700'}`}>
                    {level.title}
                </span>
            </div>
        </div>
    );
};

export default RoadmapNode;
