'use client';

import { useEffect, useRef, useState } from 'react';
import {
    LOAD_STATE,
    useCardLoader,
    SpinnerIcon,
    SuccessIcon,
    StatusBadge,
    CardInfoShimmer,
} from './CardLoader';
import { promptEngineeringRoadmapData } from '@/data/promptEngineeringCourseData';
import useRoadmapCanvasActivity from "./useRoadmapCanvasActivity";

// ── Animation constants ──────────────────────────────────────────
const CYAN = '#00A9FF';
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
    const pauseTimerRef = useRef(null);
    const lastFrameTimeRef = useRef(0);
    const tRef = useRef(0);

    const animationActiveRef =
        useRoadmapCanvasActivity(
            canvasRef,
        );

    const FRAME_INTERVAL = 1000 / 30;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        function resize() {
            const dpr = Math.min(
                window.devicePixelRatio || 1,
                1.75,
            );
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

        function draw(now = performance.now()) {
            if (!animationActiveRef.current) {
                pauseTimerRef.current =
                    window.setTimeout(() => {
                        rafRef.current =
                            requestAnimationFrame(
                                draw,
                            );
                    }, 120);

                return;
            }

            if (
                now -
                lastFrameTimeRef.current <
                FRAME_INTERVAL
            ) {
                rafRef.current =
                    requestAnimationFrame(
                        draw,
                    );

                return;
            }

            lastFrameTimeRef.current = now;

            ctx.clearRect(
                0,
                0,
                W(),
                H(),
            );

            const f =
                tRef.current /
                CYCLE;

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
            if (rafRef.current) {
                cancelAnimationFrame(
                    rafRef.current,
                );
            }

            if (
                pauseTimerRef.current
            ) {
                clearTimeout(
                    pauseTimerRef.current,
                );
            }

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
    roadmapData = promptEngineeringRoadmapData,
    variant = 'world',
}) {
    const [hovered, setHovered] = useState(false);

    const totalDays = roadmapData.days.length;

    const calculatedTotalLevels = roadmapData.days
        .flatMap((day) => day.levels)
        .length;

    const displayTotalLevels =
        totalLevels || calculatedTotalLevels;

    const {
        state,
        handleClick,
        isLocked,
        isLoading,
        isSuccess,
        isPressing,
    } = useCardLoader(onClick, 1400);

    const isActive = isLoading || isSuccess;

    const transform = isPressing
        ? "translateY(2px) scale(0.985)"
        : hovered && !isLocked
            ? "translateY(-2px)"
            : "translateY(0)";

    const cardShadow = isActive
        ? "drop-shadow(0 7px 12px rgba(25,24,59,0.09))"
        : hovered
            ? "drop-shadow(0 10px 15px rgba(25,24,59,0.12))"
            : "drop-shadow(0 5px 10px rgba(25,24,59,0.07))";

    return (
        <div
            onClick={handleClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="
                group
                relative
                w-full
                overflow-hidden
                select-none
                flex flex-col
            "
            style={{
                borderRadius: 24,

                minHeight:
                    variant === "home"
                        ? 580
                        : 560,

                transform,

                filter: cardShadow,

                transition:
                    "transform 160ms ease, filter 160ms ease",

                cursor: isLocked
                    ? "not-allowed"
                    : "pointer",

                pointerEvents: isLocked
                    ? "none"
                    : "auto",
                background: "#F2E0D0",
            }}
        >
            {/* HERO / ANIMATION AREA */}
            <div className="px-3 pt-3">
                <div
                    className="
                        relative
                        overflow-hidden
                        shrink-0
                        rounded-[18px]
                    "
                    style={{
                        height:
                            variant === 'home'
                                ? 310
                                : 300,

                        background: '#FFFDF9',
                    }}
                >
                    <PromptEngineeringCanvas />

                {isActive && (
                    <div
                        aria-hidden="true"
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            background: isSuccess
                                ? 'rgba(0,169,255,0.06)'
                                : 'rgba(25,24,59,0.045)',
                        }}
                    />
                )}

                <StatusBadge
                    state={state}
                    status={status}
                />
                </div>
            </div>

            {/* INFO AREA */}
            <div
                className="
                    relative
                    px-6
                    pt-5
                    pb-6
                    flex-grow
                    flex flex-col
                "
            >
                <CardInfoShimmer state={state} />

                {/* Duration */}
                <div className="flex items-center gap-1.5 mb-3">
                    <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#19183B"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                            opacity: 0.55,
                            flexShrink: 0,
                        }}
                    >
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                    </svg>

                    <span
                        className="
                            text-[11px]
                            font-bold
                            tracking-widest
                            uppercase
                        "
                        style={{
                            color: '#19183B',
                        }}
                    >
                        {totalDays} Days
                    </span>
                </div>

                {/* Title */}
                <h3
                    className="
                        text-[18px]
                        font-extrabold
                        text-[#19183B]
                        mb-1
                    "
                >
                    {roadmapData.title}
                </h3>

                {/* Description */}
                <p
                    className="
                        text-[15px]
                        font-medium
                        leading-[1.5]
                        mb-3
                        line-clamp-2
                    "
                    style={{
                        color: '#19183B',
                    }}
                >
                    {roadmapData.description}
                    <span className="text-[#00A9FF] font-bold ml-1">...more</span>
                </p>

                {/* TEXT ONLY — no boxes, no progress bar */}
                <p
                    className="
                        text-[11px]
                        font-semibold
                        text-[#19183B]/55
                    "
                >
                    {levelsFinished}/{displayTotalLevels} levels
                </p>

                {/* FIGMA CYAN CTA */}
                <div className="flex justify-center mt-auto pt-4">
                    <div
                        className="
                            flex
                            h-12 w-12
                            items-center
                            justify-center
                            rounded-full
                            bg-[#00A9FF]
                            text-[#19183B]

                            shadow-[0_4px_0_#0085C7]

                            transition-[transform,box-shadow]
                            duration-150
                            ease-out

                            group-hover:-translate-y-px

                            group-active:translate-y-[2px]
                            group-active:scale-[0.98]
                            group-active:shadow-[0_1px_0_#0085C7]
                        "
                    >
                        {isLoading && (
                            <SpinnerIcon
                                size={16}
                                color="#19183B"
                            />
                        )}

                        {isSuccess && (
                            <SuccessIcon
                                size={16}
                                color="#19183B"
                            />
                        )}

                        {!isLoading && !isSuccess && (
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#19183B"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <line
                                    x1="5"
                                    y1="12"
                                    x2="19"
                                    y2="12"
                                />

                                <polyline
                                    points="12 5 19 12 12 19"
                                />
                            </svg>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}