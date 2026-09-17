'use client';

import { useState, useRef, useEffect } from 'react';
import {
    useCardLoader,
    SpinnerIcon,
    SuccessIcon,
    StatusBadge,
    CardInfoShimmer,
} from './CardLoader';
import useRoadmapCanvasActivity from "./useRoadmapCanvasActivity";

function ease(x) {
    return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
}

function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
}

function DsaVisualizerCanvas() {
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
        if (!ctx) return;

        function resize() {
            const dpr = Math.min(
                window.devicePixelRatio || 1,
                1.75,
            );
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

            drawArrayBlocks(
                f,
                W(),
                H(),
            );

            drawTree(
                f,
                W(),
                H(),
            );

            drawGraphPulse(
                f,
                W(),
                H(),
            );

            tRef.current =
                (tRef.current + 1) %
                CYCLE;

            rafRef.current =
                requestAnimationFrame(
                    draw,
                );
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

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
        />
    );
}

export default function DsaCourseCard({
    onClick,
    status = "Not Started",
    levelsFinished = 0,
    totalLevels,
    roadmapData,
    variant = "world",
}) {
    const [hovered, setHovered] =
        useState(false);

    const totalDays =
        roadmapData?.days?.length || 0;

    const calculatedTotalLevels =
        roadmapData?.days?.flatMap(
            (day) => day.levels
        ).length || 0;

    const displayTotalLevels =
        totalLevels ||
        calculatedTotalLevels;

    const {
        state,
        handleClick,
        isLocked,
        isLoading,
        isSuccess,
        isPressing,
    } = useCardLoader(onClick, 1400);

    const isActive =
        isLoading || isSuccess;

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
            onMouseEnter={() =>
                setHovered(true)
            }
            onMouseLeave={() =>
                setHovered(false)
            }
            className="
        group
        w-full
        relative
        overflow-hidden
        select-none
        flex
        flex-col
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
            {/* HERO */}
            <div className="px-3 pt-3">
                <div
                    className="
              relative
              overflow-hidden
              shrink-0
              bg-slate-900
              rounded-[18px]
            "
                    style={{
                        height:
                            variant === "home"
                                ? 310
                                : 300,
                    }}
                >
                    <DsaVisualizerCanvas />

                {isActive && (
                    <div
                        aria-hidden="true"
                        className="
              absolute
              inset-0
              pointer-events-none
            "
                        style={{
                            background: isSuccess
                                ? "rgba(0,169,255,0.06)"
                                : "rgba(25,24,59,0.05)",
                        }}
                    />
                )}

                <StatusBadge
                    state={state}
                    status={status}
                />
                </div>
            </div>

            {/* INFO */}
            <div
                className="
          relative
          px-6
          pt-5
          pb-6
          flex-grow
          flex
          flex-col
        "
            >
                <CardInfoShimmer
                    state={state}
                />

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
                        <circle
                            cx="12"
                            cy="12"
                            r="10"
                        />
                        <polyline points="12 6 12 12 16 14" />
                    </svg>

                    <span className="text-[11px] font-bold tracking-widest uppercase text-[#19183B]">
                        {totalDays} Days
                    </span>
                </div>

                <h3 className="text-[18px] font-extrabold leading-tight text-[#19183B] mb-1.5">
                    {roadmapData?.title ||
                        "Data Structures & Algorithms"}
                </h3>

                <p className="text-[14px] font-medium leading-[1.5] text-[#19183B] mb-3 line-clamp-2">
                    {roadmapData?.description ||
                        "Learn Data Structures and Algorithms through practical visual problem solving."}
                    <span className="text-[#00A9FF] font-bold ml-1">...more</span>
                </p>

                <p className="text-[11px] font-semibold text-[#19183B]/55">
                    {levelsFinished}/
                    {displayTotalLevels} levels
                </p>

                <div className="flex justify-center mt-auto pt-4">
                    <div
                        className="
              flex
              h-12
              w-12
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

                        {!isLoading &&
                            !isSuccess && (
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

                                    <polyline points="12 5 19 12 12 19" />
                                </svg>
                            )}
                    </div>
                </div>
            </div>
        </div>
    );
}
