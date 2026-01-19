"use client"
import React from 'react';
import {ChevronDown, ChevronUp, Lock} from 'lucide-react';
import GitHubProgressGrid from './Card/GitHubProgressGrid';
import Image from "next/image"

const LockedProgressCard = ({
                        name,
                        color,
                        image,
                        levels,
                        completedLevels,
                        isExpanded,
                        onToggle,
                        isLocked = false
                    }) => {
    return (
        <div
            className="relative px-4 sm:px-6 md:px-8 lg:px-12 py-6 sm:py-8 md:py-10 lg:py-12 cursor-pointer transition-all duration-300 hover:brightness-105 overflow-hidden rounded-2xl sm:rounded-3xl"
            style={{backgroundColor: color}}
            onClick={onToggle}
        >
            {/* Full Card Mosaic Pattern Overlay */}
            {image && (
                <div className="absolute inset-0 w-full h-full opacity-100 pointer-events-none">
                    <Image
                        fill
                        src={image}
                        alt="Card pattern"
                        className="object-cover"
                        style={{ mixBlendMode: 'overlay' }}
                    />
                </div>
            )}

            {/* Lock Icon - Top Right */}
            {isLocked && (
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4 md:top-6 md:right-6 z-20">
                    <div className="rounded-full p-2 sm:p-3 md:p-4">
                        <Lock className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" fill="currentColor" strokeWidth={0}/>
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="relative z-10">
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 sm:mb-6 md:mb-8 lg:mb-10 pr-12 sm:pr-16 md:pr-20 leading-tight">
                    {name}
                </h2>

                {/* GitHub-style Progress Grid or Locked Status */}
                {isLocked ? (
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="flex gap-2 sm:gap-3">
                            {[...Array(levels)].map((_, index) => (
                                <div
                                    key={index}
                                    className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 rounded border-2 sm:border-3 border-white/60"
                                />
                            ))}
                        </div>
                        <span className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-white/90">
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
                        <ChevronUp className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8"/>
                    ) : (
                        <ChevronDown className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8"/>
                    )}
                </button>
            )}
        </div>
    );
};

export default LockedProgressCard;
