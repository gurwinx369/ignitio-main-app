"use client";
import React from "react";
import { ChevronDown, ChevronUp, Lock } from "lucide-react";
import GitHubProgressGrid from "./Card/GitHubProgressGrid";
import Image from "next/image";

const LockedProgressCard = ({
    name,
    color,
    image,
    levels,
    completedLevels,
    isExpanded,
    onToggle,
    isLocked = false,
}) => {
    return (
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pb-8">
            <div
                className={`relative px-4 sm:px-8 lg:px-12 py-8 sm:py-12 lg:py-16 cursor-pointer transition-all duration-700 overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] lg:rounded-[3rem] shadow-2xl border-2 border-dashed ${isLocked ? 'opacity-90 grayscale-[0.3]' : 'opacity-100 grayscale-0 scale-[1.01] shadow-white/10'}`}
                style={{
                    backgroundColor: color,
                    borderColor: isLocked ? 'rgba(255,255,255,0.3)' : 'white',
                    animation: !isLocked ? 'unlock-pulse 2s infinite ease-in-out' : 'none'
                }}
                onClick={onToggle}
            >
                {!isLocked && (
                    <style jsx="true">{`
                        @keyframes unlock-pulse {
                            0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4); }
                            70% { box-shadow: 0 0 0 20px rgba(255, 255, 255, 0); }
                            100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
                        }
                    `}</style>
                )}
            {/* Full Card Mosaic Pattern Overlay */}
            {image && (
                <div className="absolute inset-0 w-full h-full opacity-100 pointer-events-none">
                    <Image
                        fill
                        src={image}
                        alt="Card pattern"
                        className="object-cover"
                        loading="eager"
                        style={{ mixBlendMode: "overlay" }}
                    />
                </div>
            )}

            {/* Blackish Overlay for "Cool" effect */}
            <div className="absolute inset-0 bg-black/20 pointer-events-none z-15" />

            {/* Lock Icon - Top Right */}
            {isLocked && (
                <div className="absolute top-4 right-4 sm:top-6 sm:right-6 md:top-8 md:right-8 z-30">
                    <div className="bg-black/40 backdrop-blur-sm rounded-full p-2 sm:p-3 md:p-4 border border-white/10 shadow-xl">
                        <Lock
                            className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white"
                            strokeWidth={2.5}
                        />
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="relative z-10">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 lg:mb-8 pr-12 leading-tight">
                    {name}
                </h2>

                {/* GitHub-style Progress Grid or Locked Status */}
                {isLocked ? (
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="flex gap-2 sm:gap-3">
                            {[...Array(levels)].map((_, index) => (
                                <div
                                    key={index}
                                    className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 rounded-sm border-2 border-white/60"
                                />
                            ))}
                        </div>
                        <span className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-white/90">
                            locked
                        </span>
                    </div>
                ) : (
                    <GitHubProgressGrid
                        levels={levels}
                        completedLevels={completedLevels}
                    />
                )}
            </div>

            {/* Expand/Collapse Button - Only show if not locked */}
            {!isLocked && (
                <button
                    className="absolute top-3 right-3 sm:top-4 sm:right-4 text-white hover:scale-110 transition-transform duration-200 p-1 rounded-full hover:bg-white/20 z-20"
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggle();
                    }}
                >
                    {isExpanded ? (
                        <ChevronUp className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
                    ) : (
                        <ChevronDown className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
                    )}
                </button>
            )}
        </div>
        </div>
    );
};

export default LockedProgressCard;
