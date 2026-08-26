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
import { pythonBeginnerRoadmapData } from '@/data/pythonBeginnerRoadmapData';

// Static Python visual header (no canvas, no RAF).
// CSS keyframe animation injected once.
const ANIM_STYLE = `
@keyframes py-fade-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
@keyframes py-cursor  { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
@keyframes py-slide   { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: translateX(0); } }
`;

const CODE_LINES = [
    { tokens: [{ t: 'def ', c: '#c678dd' }, { t: 'greet', c: '#61afef' }, { t: '(name):', c: '#abb2bf' }] },
    { tokens: [{ t: '    ', c: '#abb2bf' }, { t: 'return ', c: '#c678dd' }, { t: '"Hello, " + name', c: '#98c379' }] },
    { tokens: [] },
    { tokens: [{ t: 'name ', c: '#e06c75' }, { t: '= ', c: '#abb2bf' }, { t: '"Python"', c: '#98c379' }] },
    { tokens: [{ t: 'print', c: '#61afef' }, { t: '(', c: '#abb2bf' }, { t: 'greet', c: '#61afef' }, { t: '(name))', c: '#abb2bf' }] },
    { tokens: [] },
    { tokens: [{ t: '# Output: ', c: '#5c6370' }, { t: 'Hello, Python', c: '#98c379' }] },
];

function PythonCodeVisual() {
    return (
        <div
            style={{
                background: '#1e2030',
                borderRadius: 0,
                padding: '20px 20px 16px',
                fontFamily: "'Fira Code', 'Fira Mono', monospace",
                fontSize: 12.5,
                lineHeight: 1.7,
                height: '100%',
                overflow: 'hidden',
                position: 'relative',
            }}
        >
            <style>{ANIM_STYLE}</style>

            <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                {['#ff5f57', '#ffbd2e', '#28c840'].map((c, i) => (
                    <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
                ))}
                <span style={{ color: '#5c6370', fontSize: 10, marginLeft: 8, lineHeight: '10px', alignSelf: 'center' }}>
                    main.py
                </span>
            </div>

            {CODE_LINES.map((line, li) => (
                <div
                    key={li}
                    style={{
                        display: 'flex',
                        opacity: 0,
                        animation: 'py-fade-in 0.4s ease forwards',
                        animationDelay: `${li * 0.18}s`,
                        minHeight: '1.7em',
                    }}
                >
                    <span style={{ color: '#3b4048', minWidth: 24, userSelect: 'none', fontSize: 10 }}>
                        {li + 1}
                    </span>
                    <span>
                        {line.tokens.map((tok, ti) => (
                            <span key={ti} style={{ color: tok.c }}>{tok.t}</span>
                        ))}
                        {li === 4 && (
                            <span
                                style={{
                                    display: 'inline-block',
                                    width: 2,
                                    height: '1em',
                                    background: '#528bff',
                                    verticalAlign: 'text-bottom',
                                    marginLeft: 1,
                                    animation: 'py-cursor 1.1s step-end infinite',
                                    animationDelay: `${CODE_LINES.length * 0.18 + 0.3}s`,
                                    opacity: 0,
                                }}
                            />
                        )}
                    </span>
                </div>
            ))}

            <div
                style={{
                    marginTop: 12,
                    padding: '6px 10px',
                    background: 'rgba(152,195,121,0.08)',
                    borderLeft: '2px solid #98c379',
                    borderRadius: 4,
                    opacity: 0,
                    animation: 'py-slide 0.5s ease forwards',
                    animationDelay: `${CODE_LINES.length * 0.18 + 0.5}s`,
                }}
            >
                <span style={{ color: '#5c6370', fontSize: 10 }}>Output: </span>
                <span style={{ color: '#98c379', fontSize: 12 }}>Hello, Python</span>
            </div>

            <div style={{
                position: 'absolute', bottom: 14, right: 16,
                fontSize: 28, opacity: 0.12, userSelect: 'none',
            }}>
                Py
            </div>
        </div>
    );
}

export default function PythonCourseCard({
    onClick,
    status         = 'Not Started',
    levelsFinished = 0,
    totalLevels,
}) {
    const allLevels = pythonBeginnerRoadmapData.days.flatMap(d => d.levels);
    const calculatedTotal = allLevels.length;
    const totalMinutes = allLevels.reduce((acc, l) => acc + (l.durationInMinutes || 0), 0);
    const formattedDuration = totalMinutes >= 60
        ? `${Math.round(totalMinutes / 60)} Hours`
        : `${totalMinutes} Minutes`;

    const displayTotal = totalLevels || calculatedTotal;

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
            id="python-course-card"
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
            <div className="relative overflow-hidden" style={{ height: 310 }}>
                <PythonCodeVisual />

                {isActive && (
                    <div
                        aria-hidden="true"
                        style={{
                            position: 'absolute', inset: 0,
                            background: isSuccess
                                ? 'rgba(46,204,138,0.06)'
                                : 'rgba(0,0,0,0.10)',
                            transition: 'background 0.28s ease',
                            pointerEvents: 'none',
                        }}
                    />
                )}

                <StatusBadge state={state} status={status} />
            </div>

            <div
                className="px-5 pt-4.5 pb-5"
                style={{ background: '#f2e0d0', position: 'relative' }}
            >
                <CardInfoShimmer state={state} />

                <div className="flex items-center gap-1.5 mb-3.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                         stroke="#3a3330" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
                         style={{ opacity: 0.55, flexShrink: 0 }}
                    >
                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span
                        className="text-[11px] font-bold tracking-widest uppercase"
                        style={{ color: '#3a3330' }}
                    >
                        {totalMinutes > 0 ? formattedDuration : '18 Hours'}
                    </span>
                </div>

                <p
                    className="text-[15.5px] font-medium leading-[1.55] mb-4"
                    style={{ color: '#1e1a18' }}
                >
                    Learn Python from scratch - variables, functions, OOP, and
                    industry-ready skills for AI, ML, and software development.
                </p>

                <div className="flex items-center gap-1 mb-4 flex-wrap">
                    <LevelSquaresLoading
                        state={state}
                        levelsFinished={levelsFinished}
                        totalLevels={displayTotal}
                    />
                    <span
                        className="text-[11px] font-semibold ml-1"
                        style={{ color: 'rgba(30,26,24,0.45)' }}
                    >
                        {levelsFinished}/{displayTotal} levels
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
                        {isSuccess && <SuccessIcon size={14} color="#2ecc8a" />}
                        {!isLoading && !isSuccess && (
                            <svg
                                width="14" height="14" viewBox="0 0 24 24" fill="none"
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