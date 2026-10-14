import React from 'react';
import { Lock, Check } from 'lucide-react';

const RoadmapNode = ({ level, index, status, theme, onClick, showStartHint }) => {
    const isLocked = status === 'locked';
    const isCompleted = status === 'completed';
    const isUnlocked = status === 'unlocked';

    if (isUnlocked) {
        return (
            <div 
                className="relative group flex flex-col items-center cursor-pointer"
                onClick={(e) => onClick(level, e)}
            >

                {/* Start hint tooltip — shown once until user clicks */}
                {showStartHint && (
                    <div
                        className="absolute pointer-events-none z-50"
                        style={{
                            bottom: 'calc(100% + 14px)',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            animation: 'ignitio-bounce 1.2s ease-in-out infinite',
                        }}
                    >
                        <div
                            className="relative flex items-center gap-1.5 rounded-2xl px-3.5 py-2 text-xs font-bold whitespace-nowrap shadow-lg"
                            style={{
                                backgroundColor: theme.accent,
                                color: '#fff',
                                letterSpacing: '0.03em',
                            }}
                        >
                            {/* Finger tap emoji */}
                            <span aria-hidden="true" className="text-sm leading-none">👆</span>
                            Tap here to start!
                            {/* Downward arrow notch */}
                            <div
                                className="absolute -bottom-[7px] left-1/2 -translate-x-1/2 w-3.5 h-3.5 rotate-45"
                                style={{ backgroundColor: theme.accent }}
                            />
                        </div>
                        <style>{`
                            @keyframes ignitio-bounce {
                                0%, 100% { transform: translateX(-50%) translateY(0px); }
                                50%       { transform: translateX(-50%) translateY(-6px); }
                            }
                        `}</style>
                    </div>
                )}

                {/* Outer glow pulse ring */}
                <div
                    className="absolute inset-0 rounded-full animate-ping opacity-30 pointer-events-none"
                    style={{
                        backgroundColor: theme.accent,
                        width: '80px',
                        height: '80px',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                    }}
                />

                {/* 3D Button wrapper — the "depth" layer sits behind */}
                <div
                    className="relative flex-none shrink-0"
                    style={{ width: '80px', height: '80px' }}
                >
                    {/* Bottom depth shadow — gives the 3D raised effect */}
                    <div
                        className="absolute inset-0 rounded-full"
                        style={{
                            backgroundColor: theme.accent,
                            filter: 'brightness(0.55)',
                            transform: 'translateY(6px)',
                            borderRadius: '50%',
                        }}
                    />

                    {/* The actual pressable button face */}
                    <button
                        onClick={(e) => onClick(level, e)}
                        aria-label={`Start level: ${level.title}`}
                        className="
                            absolute inset-0 rounded-full
                            flex items-center justify-center
                            transition-all duration-100 ease-in-out
                            active:translate-y-[5px] active:shadow-none
                            focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/60
                            cursor-pointer
                        "
                        style={{
                            backgroundColor: theme.accent,
                            boxShadow: `0 5px 0 ${theme.accent}`,
                            border: `3px solid rgba(255,255,255,0.25)`,
                        }}
                    >
                        {/* Play icon */}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="white"
                            className="w-9 h-9 md:w-10 md:h-10 translate-x-[2px]"
                            aria-hidden="true"
                        >
                            <path d="M8 5.14v14l11-7-11-7z" />
                        </svg>
                    </button>
                </div>

                {/* Level title below */}
                <div className="absolute pointer-events-none text-center"
                    style={{ top: '88px', width: '120px', left: '50%', transform: 'translateX(-50%)' }}
                >
                    <span className="block text-[11px] md:text-xs font-extrabold uppercase tracking-widest text-gray-700 leading-tight">
                        {level.title}
                    </span>
                </div>
            </div>
        );
    }

    // ── Completed & Locked nodes (unchanged visual weight / size) ──────────────
    const baseStyles = `
        relative w-14 h-14 md:w-[72px] md:h-[72px] min-w-[56px] min-h-[56px] md:min-w-[72px] md:min-h-[72px]
        aspect-square rounded-full shrink-0 flex-none flex items-center justify-center border-4
        transition-all duration-300 shadow-md
    `.trim();

    const stateStyles = isLocked
        ? 'bg-gray-200 border-gray-300 text-gray-400 opacity-60 grayscale cursor-pointer hover:scale-105 active:scale-95'
        : 'bg-[var(--color-primary)] text-white hover:scale-105 active:scale-95 cursor-pointer';

    return (
        <div className="relative group flex flex-col items-center">
            {showStartHint && (
                <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 pointer-events-none z-50 animate-in fade-in zoom-in duration-500">
                    <div className="relative bg-white/95 backdrop-blur shadow-md border border-slate-200 rounded-2xl px-3 py-2 text-xs sm:text-sm text-slate-700 font-medium whitespace-nowrap">
                        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-slate-200 rotate-45" />
                        <span className="relative z-10">Start here — click or tap this circle.</span>
                    </div>
                </div>
            )}

            <div
                className={`${baseStyles} ${stateStyles}`}
                style={{
                    borderColor: isCompleted ? theme.accent : undefined,
                    backgroundColor: isCompleted ? theme.accent : undefined,
                    boxShadow: isCompleted ? `0 0 20px ${theme.glow}` : undefined,
                }}
                onClick={(e) => onClick(level, e)}
            >
                <div className={`flex items-center justify-center transition-transform duration-300 ${isCompleted ? 'group-hover:-translate-y-1' : ''}`}>
                    {isLocked ? (
                        <Lock className="w-5 h-5 md:w-6 md:h-6" />
                    ) : (
                        <Check className="w-6 h-6 md:w-8 md:h-8 font-bold" />
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
