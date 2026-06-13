'use client';

import { useState, useRef, useEffect } from 'react';
import {
    useCardLoader,
    SpinnerIcon,
    SuccessIcon,
    StatusBadge,
    CardInfoShimmer,
    LevelSquaresLoading,
} from './CardLoader';

function ease(x) {
    return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
}

function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
}

function DsaVisualizerCanvas() {
    const canvasRef = useRef(null);
    const rafRef = useRef(null);
    const tRef = useRef(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        function resize() {
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
        resize();

        const W = () => canvas.offsetWidth;
        const H = () => canvas.offsetHeight;

        const CYCLE = 480;

        function drawArrayBlocks(f, w, h) {
            const blockW = 16;
            const blockMaxH = 40;
            const gap = 8;
            const values = [20, 10, 30, 15, 25, 35];
            const totalW = values.length * blockW + (values.length - 1) * gap;
            const startX = (w - totalW) / 2;
            const baseY = h - 30;

            const comparePhase = f > 0.2 && f < 0.4;
            const swapPhase = f >= 0.4 && f < 0.6;
            const sortedPhase = f >= 0.6;

            for (let i = 0; i < values.length; i++) {
                let x = startX + i * (blockW + gap);
                let val = values[i];

                if (swapPhase) {
                    if (i === 1) {
                        x = startX + 1 * (blockW + gap) + ease((f - 0.4) / 0.2) * (blockW + gap);
                        val = values[1];
                    } else if (i === 2) {
                        x = startX + 2 * (blockW + gap) - ease((f - 0.4) / 0.2) * (blockW + gap);
                        val = values[2];
                    }
                } else if (sortedPhase) {
                    if (i === 1) val = values[2];
                    else if (i === 2) val = values[1];
                }

                const bh = (val / 40) * blockMaxH;
                const isCompare = comparePhase && (i === 1 || i === 2);
                const isSwap = swapPhase && (i === 1 || i === 2);

                ctx.fillStyle = isCompare ? '#06b6d4' : (isSwap ? '#f59e0b' : 'rgba(148, 163, 184, 0.28)');
                ctx.beginPath();
                if (ctx.roundRect) {
                    ctx.roundRect(x, baseY - bh, blockW, bh, 4);
                } else {
                    ctx.rect(x, baseY - bh, blockW, bh);
                }
                ctx.fill();
            }

            ctx.fillStyle = 'rgba(255,255,255,0.72)';
            ctx.font = '10px monospace';
            ctx.textAlign = 'center';
            let label = "idle";
            if (comparePhase) label = "compare";
            if (swapPhase) label = "swap";
            if (sortedPhase) label = "sorted";
            ctx.fillText(label, w / 2, baseY + 15);
        }

        function drawTree(f, w, h) {
            const root = { x: w / 2, y: 50 };
            const left = { x: w / 2 - 40, y: 90 };
            const right = { x: w / 2 + 40, y: 90 };
            const leftLeft = { x: w / 2 - 60, y: 130 };
            const leftRight = { x: w / 2 - 20, y: 130 };

            const nodes = [root, left, right, leftLeft, leftRight];
            const edges = [
                [root, left],
                [root, right],
                [left, leftLeft],
                [left, leftRight]
            ];

            ctx.strokeStyle = 'rgba(148, 163, 184, 0.28)';
            ctx.lineWidth = 2;
            edges.forEach(([n1, n2]) => {
                ctx.beginPath();
                ctx.moveTo(n1.x, n1.y);
                ctx.lineTo(n2.x, n2.y);
                ctx.stroke();
            });

            const activeIndex = Math.floor((f * 5)) % 5;

            nodes.forEach((n, i) => {
                const isActive = i === activeIndex;
                ctx.beginPath();
                ctx.arc(n.x, n.y, 8, 0, 2 * Math.PI);
                ctx.fillStyle = isActive ? '#22c55e' : '#1e293b';
                ctx.fill();
                ctx.strokeStyle = isActive ? '#22c55e' : 'rgba(148, 163, 184, 0.5)';
                ctx.stroke();

                if (isActive) {
                    ctx.shadowColor = '#22c55e';
                    ctx.shadowBlur = 10;
                    ctx.fill();
                    ctx.shadowBlur = 0;
                }
            });
        }

        function drawGraphPulse(f, w, h) {
            const path = [
                { x: w * 0.8, y: 60 },
                { x: w * 0.9, y: 100 },
                { x: w * 0.75, y: 140 },
                { x: w * 0.85, y: 180 }
            ];

            ctx.strokeStyle = 'rgba(148, 163, 184, 0.28)';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(path[0].x, path[0].y);
            for (let i = 1; i < path.length; i++) {
                ctx.lineTo(path[i].x, path[i].y);
            }
            ctx.stroke();
            ctx.setLineDash([]);

            const progress = (f * 3) % 3;
            const idx = Math.floor(progress);
            const r = progress - idx;

            if (idx < path.length - 1) {
                const p1 = path[idx];
                const p2 = path[idx + 1];
                const dx = p1.x + (p2.x - p1.x) * r;
                const dy = p1.y + (p2.y - p1.y) * r;

                ctx.beginPath();
                ctx.arc(dx, dy, 3, 0, Math.PI * 2);
                ctx.fillStyle = '#8b5cf6';
                ctx.shadowColor = '#8b5cf6';
                ctx.shadowBlur = 8;
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }

        function draw() {
            ctx.clearRect(0, 0, W(), H());
            const f = tRef.current / CYCLE;

            drawArrayBlocks(f, W(), H());
            drawTree(f, W(), H());
            drawGraphPulse(f, W(), H());

            tRef.current = (tRef.current + 1) % CYCLE;
            rafRef.current = requestAnimationFrame(draw);
        }

        rafRef.current = requestAnimationFrame(draw);
        const ro = new ResizeObserver(resize);
        ro.observe(canvas);

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            ro.disconnect();
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
        />
    );
}

export default function DsaCourseCard({
    onClick,
    status = 'Not Started',
    levelsFinished = 0,
    totalLevels,
    roadmapData
}) {
    const [hovered, setHovered] = useState(false);

    // Dynamic stats calculation
    const totalDays = roadmapData?.days?.length || 0;
    const calculatedTotalLevels = roadmapData?.days?.flatMap(day => day.levels).length || 0;
    const displayTotalLevels = totalLevels || calculatedTotalLevels;

    // Loader integration
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
            <div
                className="relative overflow-hidden bg-slate-900"
                style={{ height: 260 }}
            >
                <DsaVisualizerCanvas />

                <div className="absolute left-5 top-5 z-10">
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-200/80">
                        Data Structures
                    </p>
                    <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-white">
                        DSA
                    </h2>
                </div>

                {isActive && (
                    <div
                        aria-hidden="true"
                        style={{
                            position: 'absolute',
                            inset: 0,
                            background: isSuccess
                                ? 'rgba(6,182,212,0.06)'
                                : 'rgba(0,0,0,0.06)',
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
                        stroke="#334155" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
                        style={{ opacity: 0.55, flexShrink: 0 }}
                    >
                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span
                        className="text-[11px] font-bold tracking-widest uppercase text-slate-700"
                    >
                        {totalDays} Days
                    </span>
                </div>

                <h3 className="text-[18px] font-bold text-slate-900 mb-1">
                    {roadmapData?.title || 'DSA Roadmap'}
                </h3>
                <p className="text-[15.5px] font-medium leading-[1.55] mb-4 text-slate-700">
                    {roadmapData?.description || 'Learn Data Structures and Algorithms.'}
                </p>

                <div className="flex items-center gap-1 mb-4 flex-wrap">
                    <LevelSquaresLoading
                        state={state}
                        levelsFinished={levelsFinished}
                        totalLevels={displayTotalLevels}
                    />
                    <span className="text-[11px] font-semibold ml-1 text-slate-500">
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
                        {isLoading && (
                            <SpinnerIcon size={14} color="#1e1a18" />
                        )}
                        {isSuccess && (
                            <SuccessIcon size={14} color="#06b6d4" />
                        )}
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
