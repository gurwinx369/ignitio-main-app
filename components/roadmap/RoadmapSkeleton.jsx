import React from 'react';

export default function RoadmapSkeleton({ color = '#f59e0b' }) {
    return (
        <div className="w-full min-h-[600px] bg-[#fdfbf7] rounded-[2rem] border border-gray-100 p-8 flex flex-col relative overflow-hidden animate-pulse">
            {/* Soft background glow */}
            <div 
                className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-10"
                style={{ backgroundColor: color }}
            />
            
            {/* Fake curved path line */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-64 border-b-8 border-r-8 border-gray-200/40 rounded-br-[100px] hidden md:block" />
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-64 border-t-8 border-l-8 border-gray-200/40 rounded-tl-[100px] hidden md:block" />
            <div className="absolute top-0 bottom-0 left-1/2 w-2 bg-gray-200/40 md:hidden" />

            {/* Node placeholders */}
            <div className="relative w-full h-full flex flex-col md:flex-row items-center justify-center gap-12 md:gap-24 z-10 pt-10 md:pt-24">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-4">
                        <div 
                            className="w-16 h-16 md:w-20 md:h-20 rounded-full shadow-sm"
                            style={{ backgroundColor: color, opacity: 0.2 }}
                        />
                        <div className="w-24 h-4 bg-gray-200/60 rounded-full" />
                        <div className="w-16 h-3 bg-gray-200/40 rounded-full" />
                    </div>
                ))}
            </div>
        </div>
    );
}
