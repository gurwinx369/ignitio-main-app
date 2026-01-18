import React from 'react';
import {ChevronDown, ChevronUp} from 'lucide-react';
import GitHubProgressGrid from './GitHubProgressGrid';
import Image from "next/image"

const CardHeader = ({
                        name,
                        color,
                        image,
                        levels,
                        completedLevels,
                        isExpanded,
                        onToggle
                    }) => {
    return (
        <div
            className="relative px-4 sm:px-8 lg:px-12 py-8 sm:py-12 lg:py-16 cursor-pointer transition-all duration-300 hover:brightness-105 overflow-hidden"
            style={{backgroundColor: color}}
            onClick={onToggle}
        >
            {/* Background Image - Perfectly aligned to bottom right */}
            {image && (
                <div
                    className="absolute -bottom-2 -right-2 w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 xl:w-64 xl:h-64 opacity-50 pointer-events-none">
                    <Image
                        height={256}
                        width={256}
                        src={image}
                        alt="Card decoration"
                        className="w-full h-full object-contain object-bottom-right"
                        style={{ objectPosition: 'bottom right' }}
                    />
                </div>
            )}

            {/* Content */}
            <div className="relative z-10">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 lg:mb-8 pr-12 leading-tight">
                    {name}
                </h2>

                {/* GitHub-style Progress Grid */}
                <GitHubProgressGrid
                    levels={levels}
                    completedLevels={completedLevels}
                />
            </div>

            {/* Expand/Collapse Button */}
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
        </div>
    );
};

export default CardHeader;
