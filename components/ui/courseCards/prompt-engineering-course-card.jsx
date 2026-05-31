'use client';

import { useEffect, useRef, useState } from 'react';
import {
    LOAD_STATE,
    useCardLoader,
    SpinnerIcon,
    SuccessIcon,
    StatusBadge,
    CardInfoShimmer,
    LevelSquaresLoading,
} from './CardLoader';
import { promptEngineeringRoadmapData } from '@/data/promptEngineeringCourseData';

// ── Animation constants ──────────────────────────────────────────
const CYAN = '#06b6d4';
const AMBER = '#f59e0b';
const PURPLE = '#8b5cf6';
const DARK = '#1e1a18';
const LINE_COLOR = 'rgba(80,80,80,0.28)';
const CYCLE = 400;

const PROMPT_NODES = [
    { id: 'prompt', x: 0.50, y: 0.15, color: CYAN },
    { id: 'role', x: 0.25, y: 0.35, color: PURPLE },
    { id: 'context', x: 0.75, y: 0.35, color: AMBER },
    { id: 'think', x: 0.50, y: 0.55, color: DARK },
    { id: 'output', x: 0.50, y: 0.85, color: CYAN },
];

const PROMPT_EDGES = [
    ['prompt', 'think'],
    ['role', 'think'],
    ['context', 'think'],
    ['think', 'output'],
];

const NODE_TIMES = [0.05, 0.15, 0.15, 0.35, 0.60];
const EDGE_TIMES = [
    [0.10, 0.35],
    [0.20, 0.40],
    [0.20, 0.40],
    [0.45, 0.65],
];

const NODE_LABELS = ['prompt', 'role', 'context', 'think', 'output'];

function ease(x) {
    return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
}

// ── Canvas ───────────────────────────────────────────────────────
function PromptEngineeringCanvas() {
    const canvasRef = useRef(null);
    const rafRef = useRef(null);
    const tRef = useRef(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        function resize() {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = canvas.offsetWidth * dpr;
            canvas.height = canvas.offsetHeight * dpr;
            ctx.scale(dpr, dpr);
        }
        resize();

        const W = () => canvas.offsetWidth;
        const H = () => canvas.offsetHeight;
        const npos = n => ({ x: n.x * W(), y: n.y * H() });

        function drawLine(x1, y1, x2, y2, prog, color) {
            ctx.save();
            ctx.strokeStyle = color || LINE_COLOR;
            ctx.lineWidth = 2.2;
            ctx.globalAlpha = 0.55;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x1 + (x2 - x1) * prog, y1 + (y2 - y1) * prog);
            ctx.stroke();
            ctx.restore();
        }

        function drawCurve(pa, pb, prog, color) {
            ctx.save();
            ctx.strokeStyle = color;
            ctx.lineWidth = 2.2;
            ctx.globalAlpha = 0.55;
            ctx.lineCap = 'round';
            // Custom bezier control point based on relative positions
            const cpx = pa.x + (pb.x - pa.x) * 0.1;
            const cpy = pa.y + (pb.y - pa.y) * 0.9;
            ctx.beginPath();
            for (let s = 0; s <= prog; s += 0.02) {
                const bx = (1 - s) * (1 - s) * pa.x + 2 * (1 - s) * s * cpx + s * s * pb.x;
                const by = (1 - s) * (1 - s) * pa.y + 2 * (1 - s) * s * cpy + s * s * pb.y;
                s === 0 ? ctx.moveTo(bx, by) : ctx.lineTo(bx, by);
            }
            ctx.stroke();
            ctx.restore();
        }

        function drawNode(x, y, r, color, alpha, pulse, isThink) {
            const pr = r + pulse * 6;

            ctx.save();
            ctx.globalAlpha = alpha * 0.18 * (1 - pulse * 0.5);
            const grd = ctx.createRadialGradient(x, y, r * 0.3, x, y, pr + 14);
            grd.addColorStop(0, color);
            grd.addColorStop(1, 'transparent');
            ctx.fillStyle = grd;
            ctx.beginPath();
            ctx.arc(x, y, pr + 14, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            ctx.save();
            ctx.globalAlpha = alpha * 0.25;
            ctx.strokeStyle = color;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(x, y, pr + 4, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = color;
            ctx.shadowColor = color;
            ctx.shadowBlur = isThink ? 6 : 10;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        function drawLabel(x, y, text, color, alpha) {
            ctx.save();
            ctx.globalAlpha = alpha * 0.75;
            ctx.fillStyle = color === DARK ? '#444' : color;
            ctx.font = 'bold 10px monospace';
            ctx.textAlign = 'center';
            // Position labels above or to the side depending on node
            const offset = (text === 'think') ? -16 : 16;
            ctx.fillText(text, x, y + offset);
            ctx.restore();
        }

        function draw() {
            ctx.clearRect(0, 0, W(), H());
            const f = tRef.current / CYCLE;

            // Background dots
            ctx.save();
            ctx.fillStyle = 'rgba(0,0,0,0.04)';
            for (let gx = 18; gx < W(); gx += 24) {
                for (let gy = 18; gy < H(); gy += 24) {
                    ctx.beginPath();
                    ctx.arc(gx, gy, 1, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            ctx.restore();

            PROMPT_EDGES.forEach(([a, b], i) => {
                const na = PROMPT_NODES.find(n => n.id === a);
                const nb = PROMPT_NODES.find(n => n.id === b);
                const pa = npos(na), pb = npos(nb);
                const [ts, te] = EDGE_TIMES[i];
                const prog = Math.min(1, Math.max(0, (f - ts) / (te - ts)));
                if (prog <= 0) return;

                // Make edges from role/context curved
                if (a === 'role' || a === 'context') {
                    drawCurve(pa, pb, prog, na.color);
                } else {
                    drawLine(pa.x, pa.y, pb.x, pb.y, prog, i === 3 ? CYAN : LINE_COLOR);
                }
            });

            PROMPT_NODES.forEach((n, i) => {
                const appear = Math.min(1, Math.max(0, (f - NODE_TIMES[i]) / 0.08));
                if (appear <= 0) return;
                const pos = npos(n);
                // Extra bounce for output node
                const pulse = n.id === 'output'
                    ? Math.max(0, 1 - (f - NODE_TIMES[i]) / 0.16) + (f > 0.8 ? Math.sin((f - 0.8) * 20) * 0.2 : 0)
                    : Math.max(0, 1 - (f - NODE_TIMES[i]) / 0.14);

                drawNode(pos.x, pos.y, 7, n.color, ease(appear), pulse, n.id === 'think');
                drawLabel(pos.x, pos.y, NODE_LABELS[i], n.color, ease(appear));
            });

            // Glowing traveling dots along edges
            if (f > 0.1) {
                PROMPT_EDGES.forEach(([a, b], i) => {
                    const [ts, te] = EDGE_TIMES[i];
                    if (f < ts || f > te + 0.15) return;

                    const ef = (f - ts) / (te - ts + 0.15);
                    const dp = ease(Math.min(1, ef));

                    const na = PROMPT_NODES.find(n => n.id === a);
                    const nb = PROMPT_NODES.find(n => n.id === b);
                    const pa = npos(na), pb = npos(nb);

                    let dx, dy;
                    if (a === 'role' || a === 'context') {
                        const cpx = pa.x + (pb.x - pa.x) * 0.1;
                        const cpy = pa.y + (pb.y - pa.y) * 0.9;
                        dx = (1 - dp) * (1 - dp) * pa.x + 2 * (1 - dp) * dp * cpx + dp * dp * pb.x;
                        dy = (1 - dp) * (1 - dp) * pa.y + 2 * (1 - dp) * dp * cpy + dp * dp * pb.y;
                    } else {
                        dx = pa.x + (pb.x - pa.x) * dp;
                        dy = pa.y + (pb.y - pa.y) * dp;
                    }

                    ctx.save();
                    ctx.fillStyle = na.color;
                    ctx.shadowColor = na.color;
                    ctx.shadowBlur = 12;
                    ctx.globalAlpha = 1 - Math.pow(dp, 4); // fade out at the end
                    ctx.beginPath();
                    ctx.arc(dx, dy, 3.5, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                });
            }

            tRef.current = (tRef.current + 1) % CYCLE;
            rafRef.current = requestAnimationFrame(draw);
        }

        rafRef.current = requestAnimationFrame(draw);
        const ro = new ResizeObserver(resize);
        ro.observe(canvas);
        return () => {
            cancelAnimationFrame(rafRef.current);
            ro.disconnect();
        };
    }, []);

    return <canvas ref={canvasRef} className="block w-full h-full" />;
}

// ─── PromptEngineeringCourseCard ────────────────────────────────────────────────
export default function PromptEngineeringCourseCard({
    onClick,
    status = 'Not Started',
    levelsFinished = 0,
    totalLevels,
}) {
    const [hovered, setHovered] = useState(false);

    const totalDays = promptEngineeringRoadmapData.days.length;
    const calculatedTotalLevels = promptEngineeringRoadmapData.days.flatMap(day => day.levels).length;
    const displayTotalLevels = totalLevels || calculatedTotalLevels;

    // ── Loader integration ─────────────────────────────────────────
    const { state, handleClick, isLocked, isLoading, isSuccess, isPressing } =
        useCardLoader(onClick, 1400);

    // ── Derived visual states ──────────────────────────────────────
    const isActive = isLoading || isSuccess;

    // Scale: press sinks the card, loading holds slightly raised
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

    // Arrow button visuals
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
                // ── Rage-click prevention: block pointer while locked ────
                cursor: isLocked ? 'not-allowed' : 'pointer',
                pointerEvents: isLocked ? 'none' : 'auto',
            }}
        >
            {/* ── Animation section ─────────────────────────────────── */}
            <div
                className="relative overflow-hidden"
                style={{ height: 260, background: '#fdfbf7' }}
            >
                <PromptEngineeringCanvas />

                {/* Loading overlay on canvas — subtle dark veil while navigating */}
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

                {/* Status badge — morphs through states */}
                <StatusBadge state={state} status={status} />
            </div>

            {/* ── Info section ──────────────────────────────────────── */}
            <div
                className="px-5 pt-4.5 pb-5"
                style={{ background: '#f2e0d0', position: 'relative' }}
            >
                {/* Shimmer + success overlay */}
                <CardInfoShimmer state={state} />

                {/* Duration row */}
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
                        {totalDays} Days
                    </span>
                </div>

                {/* Description */}
                <h3 className="text-[18px] font-bold text-gray-900 mb-1">
                    {promptEngineeringRoadmapData.title}
                </h3>
                <p
                    className="text-[15.5px] font-medium leading-[1.55] mb-4"
                    style={{ color: '#1e1a18' }}
                >
                    {promptEngineeringRoadmapData.description}
                </p>

                {/* Level squares — wave-animated during load */}
                <div className="flex items-center gap-1 mb-4 flex-wrap">
                    <LevelSquaresLoading
                        state={state}
                        levelsFinished={levelsFinished}
                        totalLevels={displayTotalLevels}
                    />
                    <span
                        className="text-[11px] font-semibold ml-1"
                        style={{ color: 'rgba(30,26,24,0.45)' }}
                    >
                        {levelsFinished}/{displayTotalLevels} levels
                    </span>
                </div>

                {/* Arrow / Spinner / Checkmark button */}
                <div className="flex justify-end">
                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{
                            background: arrowBg,
                            transform: isLoading ? 'none' : arrowShift,
                            transition: 'all 0.22s ease',
                        }}
                    >
                        {/* ── Icon morphs based on state ───────────────────── */}
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
