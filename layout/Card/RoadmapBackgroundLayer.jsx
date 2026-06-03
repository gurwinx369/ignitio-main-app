import React from 'react';
import { roadmapThemes } from './theme';

export default function RoadmapBackgroundLayer({ difficulty = 'beginner' }) {
    const theme = roadmapThemes[difficulty] || roadmapThemes.beginner;
    const pattern = theme.backgroundPattern;

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-[0.08]" aria-hidden="true">
            {/* Base tint */}
            <div className="absolute inset-0" style={{ backgroundColor: theme.accent }}></div>

            {/* Beginner: Clouds & Particles */}
            {pattern === 'clouds' && (
                <>
                    <div className="absolute top-10 left-10 w-32 h-16 bg-white rounded-full blur-xl opacity-50"></div>
                    <div className="absolute top-40 right-20 w-48 h-24 bg-white rounded-full blur-2xl opacity-40"></div>
                    <div className="absolute bottom-20 left-1/4 w-24 h-12 bg-white rounded-full blur-lg opacity-60"></div>
                    {/* Stars/Particles */}
                    <div className="absolute top-1/3 left-1/2 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <div className="absolute top-2/3 right-1/3 w-1 h-1 bg-white rounded-full animate-pulse"></div>
                </>
            )}

            {/* Intermediate: Circuit / Grid */}
            {pattern === 'circuit' && (
                <div className="absolute inset-0" 
                     style={{
                         backgroundImage: `linear-gradient(${theme.secondary} 1px, transparent 1px), linear-gradient(90deg, ${theme.secondary} 1px, transparent 1px)`,
                         backgroundSize: '40px 40px',
                         opacity: 0.3
                     }}>
                </div>
            )}

            {/* Advanced: Galaxy / Nebula */}
            {pattern === 'galaxy' && (
                <>
                    <div className="absolute top-0 left-0 w-full h-full"
                         style={{
                             background: `radial-gradient(circle at 30% 30%, ${theme.accent} 0%, transparent 40%), radial-gradient(circle at 70% 60%, ${theme.secondary} 0%, transparent 50%)`,
                             opacity: 0.5
                         }}>
                    </div>
                    {/* Floating rings */}
                    <div className="absolute top-1/4 right-1/4 w-64 h-64 border-2 border-white rounded-full opacity-10 blur-[1px]"></div>
                    <div className="absolute bottom-1/4 left-1/4 w-96 h-96 border border-white rounded-full opacity-5 blur-[2px]"></div>
                </>
            )}
        </div>
    );
}
