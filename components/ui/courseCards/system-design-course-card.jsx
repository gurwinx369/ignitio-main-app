'use client';

import { useState } from 'react';
import {
    useCardLoader,
    SpinnerIcon,
    SuccessIcon,
    StatusBadge,
    CardInfoShimmer,
    LevelSquaresLoading,
} from './CardLoader';
import { systemDesignRoadmapData } from '@/data/systemDesignData';

// ─── Static architecture diagram (no canvas, no rAF) ──────────────
function ArchDiagram() {
    return (
        <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none px-6">
            <svg
                viewBox="0 0 320 180"
                className="w-full max-w-xs opacity-90"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
            >
                {/* ─── Connection lines ─── */}
                {/* Client → LB */}
                <line x1="58" y1="90" x2="98" y2="90" stroke="rgba(99,179,237,0.45)" strokeWidth="1.5" strokeDasharray="4 3"/>
                {/* LB → Server A */}
                <line x1="142" y1="80" x2="182" y2="58" stroke="rgba(99,179,237,0.35)" strokeWidth="1.5" strokeDasharray="4 3"/>
                {/* LB → Server B */}
                <line x1="142" y1="100" x2="182" y2="122" stroke="rgba(99,179,237,0.35)" strokeWidth="1.5" strokeDasharray="4 3"/>
                {/* Server A → DB */}
                <line x1="226" y1="58" x2="262" y2="70" stroke="rgba(154,205,115,0.35)" strokeWidth="1.5" strokeDasharray="4 3"/>
                {/* Server B → DB */}
                <line x1="226" y1="122" x2="262" y2="110" stroke="rgba(154,205,115,0.35)" strokeWidth="1.5" strokeDasharray="4 3"/>
                {/* Cache bracket */}
                <line x1="262" y1="138" x2="204" y2="90" stroke="rgba(251,191,36,0.3)" strokeWidth="1.2" strokeDasharray="3 3"/>

                {/* ─── Client node ─── */}
                <rect x="10" y="72" width="48" height="36" rx="7" fill="rgba(30,41,59,0.9)" stroke="rgba(99,179,237,0.5)" strokeWidth="1.5"/>
                <text x="34" y="86" textAnchor="middle" fill="rgba(147,197,253,0.9)" fontSize="7" fontFamily="monospace" fontWeight="bold">CLIENT</text>
                <text x="34" y="99" textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="6" fontFamily="monospace">browser</text>

                {/* ─── Load balancer ─── */}
                <rect x="98" y="68" width="44" height="44" rx="7" fill="rgba(30,41,59,0.9)" stroke="rgba(139,92,246,0.6)" strokeWidth="1.5"/>
                <text x="120" y="86" textAnchor="middle" fill="rgba(196,181,253,0.9)" fontSize="6" fontFamily="monospace" fontWeight="bold">LOAD</text>
                <text x="120" y="96" textAnchor="middle" fill="rgba(196,181,253,0.9)" fontSize="6" fontFamily="monospace" fontWeight="bold">BALANCER</text>
                <text x="120" y="106" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="5.5" fontFamily="monospace">⇄</text>

                {/* ─── Server A ─── */}
                <rect x="182" y="40" width="44" height="36" rx="7" fill="rgba(30,41,59,0.9)" stroke="rgba(99,179,237,0.45)" strokeWidth="1.5"/>
                <text x="204" y="55" textAnchor="middle" fill="rgba(147,197,253,0.85)" fontSize="6.5" fontFamily="monospace" fontWeight="bold">SERVER</text>
                <text x="204" y="67" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="5.5" fontFamily="monospace">node-1</text>

                {/* ─── Server B ─── */}
                <rect x="182" y="104" width="44" height="36" rx="7" fill="rgba(30,41,59,0.9)" stroke="rgba(99,179,237,0.45)" strokeWidth="1.5"/>
                <text x="204" y="119" textAnchor="middle" fill="rgba(147,197,253,0.85)" fontSize="6.5" fontFamily="monospace" fontWeight="bold">SERVER</text>
                <text x="204" y="131" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="5.5" fontFamily="monospace">node-2</text>

                {/* ─── Database ─── */}
                <ellipse cx="280" cy="72" rx="18" ry="8" fill="rgba(30,41,59,0.9)" stroke="rgba(154,205,115,0.55)" strokeWidth="1.5"/>
                <rect x="262" y="72" width="36" height="22" fill="rgba(30,41,59,0.9)"/>
                <ellipse cx="280" cy="94" rx="18" ry="8" fill="rgba(30,41,59,0.9)" stroke="rgba(154,205,115,0.55)" strokeWidth="1.5"/>
                <line x1="262" y1="72" x2="262" y2="94" stroke="rgba(154,205,115,0.55)" strokeWidth="1.5"/>
                <line x1="298" y1="72" x2="298" y2="94" stroke="rgba(154,205,115,0.55)" strokeWidth="1.5"/>
                <text x="280" y="86" textAnchor="middle" fill="rgba(187,247,208,0.8)" fontSize="6" fontFamily="monospace" fontWeight="bold">DB</text>

                {/* ─── Cache ─── */}
                <rect x="244" y="130" width="44" height="30" rx="6" fill="rgba(30,41,59,0.9)" stroke="rgba(251,191,36,0.45)" strokeWidth="1.5"/>
                <text x="266" y="143" textAnchor="middle" fill="rgba(253,230,138,0.9)" fontSize="6.5" fontFamily="monospace" fontWeight="bold">CACHE</text>
                <text x="266" y="153" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="5.5" fontFamily="monospace">redis</text>

                {/* ─── Message queue ─── */}
                <rect x="10" y="138" width="56" height="28" rx="6" fill="rgba(30,41,59,0.9)" stroke="rgba(251,146,60,0.45)" strokeWidth="1.5"/>
                <text x="38" y="150" textAnchor="middle" fill="rgba(253,186,116,0.9)" fontSize="5.5" fontFamily="monospace" fontWeight="bold">MSG QUEUE</text>
                <text x="38" y="160" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="5" fontFamily="monospace">kafka</text>
            </svg>
        </div>
    );
}

// ─── SystemDesignCourseCard ────────────────────────────────────────
export default function SystemDesignCourseCard({
    onClick,
    status = 'Not Started',
    levelsFinished = 0,
    totalLevels,
}) {
    const allLevels = systemDesignRoadmapData.days.flatMap(day => day.levels);
    const calculatedTotalLevels = allLevels.length;
    const totalDurationMinutes = allLevels.reduce((acc, l) => acc + (l.durationInMinutes || 0), 0);
    const formattedDuration = totalDurationMinutes >= 60
        ? `${Math.round(totalDurationMinutes / 60)} Hours`
        : `${totalDurationMinutes} Minutes`;

    const displayTotalLevels = totalLevels || calculatedTotalLevels;

    const [hovered, setHovered] = useState(false);

    const { state, handleClick, isLocked, isLoading, isSuccess, isPressing } =
        useCardLoader(onClick, 1400);

    const isActive = isLoading || isSuccess;

    const scale = isPressing
        ? 'scale(0.972)'
        : hovered && !isLocked
            ? 'translateY(-4px)'
            : 'translateY(0)';

    const shadow = isActive
        ? '0 12px 40px rgba(0,0,0,0.10)'
        : hovered
            ? '0 20px 56px rgba(0,0,0,0.14)'
            : '0 6px 24px rgba(0,0,0,0.08)';

    const arrowBg = isActive
        ? (isSuccess ? 'rgba(46,204,138,0.18)' : 'rgba(30,26,24,0.11)')
        : hovered
            ? 'rgba(30,26,24,0.14)'
            : 'rgba(30,26,24,0.07)';

    const arrowShift = hovered && !isLocked ? 'translateX(3px)' : 'translateX(0)';

    return (
        <div
            onClick={handleClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="w-full sm:w-120 overflow-hidden select-none"
            style={{
                borderRadius: 24,
                boxShadow: shadow,
                transform: scale,
                transition: 'transform 0.28s ease, box-shadow 0.28s ease',
                cursor: isLocked ? 'not-allowed' : 'pointer',
                pointerEvents: isLocked ? 'none' : 'auto',
            }}
        >
            {/* ── Visual header — pure CSS/SVG, no canvas ─────────── */}
            <div
                className="relative overflow-hidden"
                style={{
                    height: 240,
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
                }}
            >
                {/* Subtle grid */}
                <div
                    aria-hidden="true"
                    className="absolute inset-0"
                    style={{
                        backgroundImage:
                            'linear-gradient(rgba(99,179,237,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99,179,237,0.04) 1px, transparent 1px)',
                        backgroundSize: '24px 24px',
                    }}
                />

                <ArchDiagram />

                {/* Label overlay */}
                <div className="absolute left-5 top-5 z-10">
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-blue-300/80">
                        Infrastructure
                    </p>
                    <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-white">
                        System Design
                    </h2>
                </div>

                {isActive && (
                    <div
                        aria-hidden="true"
                        style={{
                            position: 'absolute',
                            inset: 0,
                            background: isSuccess
                                ? 'rgba(59,130,246,0.06)'
                                : 'rgba(0,0,0,0.08)',
                            transition: 'background 0.28s ease',
                            pointerEvents: 'none',
                        }}
                    />
                )}

                <StatusBadge state={state} status={status} />
            </div>

            {/* ── Info section ─────────────────────────────────────── */}
            <div className="px-5 pt-4.5 pb-5" style={{ background: '#f2e0d0', position: 'relative' }}>
                <CardInfoShimmer state={state} />

                <div className="flex items-center gap-1.5 mb-3.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="#3a3330" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
                        style={{ opacity: 0.55, flexShrink: 0 }}
                    >
                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: '#3a3330' }}>
                        {formattedDuration}
                    </span>
                </div>

                <p className="text-[15.5px] font-medium leading-[1.55] mb-4" style={{ color: '#1e1a18' }}>
                    Master scalable system design — databases, caching, load balancing,
                    CAP theorem, and message queues.
                </p>

                <div className="flex items-center gap-1 mb-4 flex-wrap">
                    <LevelSquaresLoading
                        state={state}
                        levelsFinished={levelsFinished}
                        totalLevels={displayTotalLevels}
                    />
                    <span className="text-[11px] font-semibold ml-1" style={{ color: 'rgba(30,26,24,0.45)' }}>
                        {levelsFinished}/{displayTotalLevels} levels
                    </span>
                </div>

                <div className="flex justify-end">
                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{
                            background: arrowBg,
                            transform: isLoading ? 'none' : arrowShift,
                            transition: 'all 0.22s ease',
                        }}
                    >
                        {isLoading && <SpinnerIcon size={14} color="#1e1a18" />}
                        {isSuccess && <SuccessIcon size={14} color="#3b82f6" />}
                        {!isLoading && !isSuccess && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                stroke="#1e1a18" strokeWidth="2.5"
                                strokeLinecap="round" strokeLinejoin="round"
                            >
                                <line x1="5" y1="12" x2="19" y2="12" />
                                <polyline points="12 5 19 12 12 19" />
                            </svg>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
