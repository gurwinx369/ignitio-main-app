'use client';

import { useEffect, useRef, useState } from 'react';
import {
    useCardLoader,
    SpinnerIcon,
    SuccessIcon,
    StatusBadge,
    CardInfoShimmer,
} from './CardLoader';
import { systemDesignRoadmapData } from '@/data/systemDesignData';
import useRoadmapCanvasActivity from "./useRoadmapCanvasActivity";

// ─── System Design animation ─────────────────────────────────────

const COLORS = {
    client: '#60a5fa',
    loadBalancer: '#a78bfa',
    server: '#38bdf8',
    database: '#84cc16',
    cache: '#fbbf24',
    queue: '#fb923c',
    connection: 'rgba(148, 163, 184, 0.28)',
};

const CYCLE = 520;

function ease(value) {
    return value < 0.5
        ? 2 * value * value
        : 1 - Math.pow(-2 * value + 2, 2) / 2;
}

function clamp(value, min = 0, max = 1) {
    return Math.max(min, Math.min(max, value));
}

function SystemDesignCanvas() {
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

        const reducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)'
        ).matches;

        function resize() {
            const dpr = Math.min(
                window.devicePixelRatio || 1,
                1.75,
            );
            const rect = canvas.getBoundingClientRect();

            canvas.width = Math.max(1, Math.round(rect.width * dpr));
            canvas.height = Math.max(1, Math.round(rect.height * dpr));

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        resize();

        const getWidth = () => canvas.offsetWidth;
        const getHeight = () => canvas.offsetHeight;

        function position(x, y) {
            return {
                x: x * getWidth(),
                y: y * getHeight(),
            };
        }

        function roundedRect(x, y, width, height, radius) {
            ctx.beginPath();

            if (typeof ctx.roundRect === 'function') {
                ctx.roundRect(x, y, width, height, radius);
            } else {
                ctx.rect(x, y, width, height);
            }
        }

        function drawConnection(from, to, alpha = 0.32) {
            ctx.save();

            ctx.strokeStyle = `rgba(148, 163, 184, ${alpha})`;
            ctx.lineWidth = 1.5;
            ctx.setLineDash([5, 5]);

            ctx.beginPath();
            ctx.moveTo(from.x, from.y);
            ctx.lineTo(to.x, to.y);
            ctx.stroke();

            ctx.restore();
        }

        function drawPacket(from, to, progress, color) {
            if (progress <= 0 || progress >= 1) return;

            const easedProgress = ease(progress);

            const x =
                from.x + (to.x - from.x) * easedProgress;
            const y =
                from.y + (to.y - from.y) * easedProgress;

            ctx.save();

            ctx.globalAlpha = 0.98;
            ctx.fillStyle = color;
            ctx.shadowColor = color;
            ctx.shadowBlur = 12;

            ctx.beginPath();
            ctx.arc(x, y, 3.8, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }

        function drawNode({
            x,
            y,
            width,
            height,
            title,
            subtitle,
            stroke,
            active = false,
        }) {
            ctx.save();

            if (active) {
                ctx.shadowColor = stroke;
                ctx.shadowBlur = 14;
            }

            ctx.fillStyle = 'rgba(15, 23, 42, 0.96)';
            ctx.strokeStyle = stroke;
            ctx.lineWidth = active ? 2 : 1.4;

            roundedRect(
                x - width / 2,
                y - height / 2,
                width,
                height,
                7
            );

            ctx.fill();
            ctx.stroke();

            ctx.shadowBlur = 0;

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            ctx.fillStyle = stroke;
            ctx.font = 'bold 7px monospace';
            ctx.fillText(
                title,
                x,
                y - (subtitle ? 5 : 0)
            );

            if (subtitle) {
                ctx.fillStyle = 'rgba(255,255,255,0.38)';
                ctx.font = '5.5px monospace';
                ctx.fillText(subtitle, x, y + 7);
            }

            ctx.restore();
        }

        function phaseProgress(frame, start, end) {
            return clamp(
                (frame - start) / (end - start)
            );
        }

        function drawBackgroundDots() {
            ctx.save();
            ctx.fillStyle = 'rgba(148, 163, 184, 0.07)';

            for (let x = 16; x < getWidth(); x += 24) {
                for (let y = 16; y < getHeight(); y += 24) {
                    ctx.beginPath();
                    ctx.arc(x, y, 1, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            ctx.restore();
        }

        function drawArchitecture(frame) {
            const client = position(0.13, 0.53);
            const loadBalancer = position(0.34, 0.53);

            const serverOne = position(0.57, 0.36);
            const serverTwo = position(0.57, 0.70);

            const database = position(0.82, 0.36);
            const cache = position(0.82, 0.68);

            const queue = position(0.30, 0.83);

            // Base architecture
            drawConnection(client, loadBalancer, 0.35);

            drawConnection(loadBalancer, serverOne);
            drawConnection(loadBalancer, serverTwo);

            drawConnection(serverOne, database, 0.28);
            drawConnection(serverTwo, database, 0.22);

            drawConnection(serverTwo, cache, 0.30);
            drawConnection(serverTwo, queue, 0.20);

            // Request lifecycle
            const clientToLoadBalancer = phaseProgress(
                frame,
                0.06,
                0.20
            );

            const loadBalancerToServerOne = phaseProgress(
                frame,
                0.23,
                0.38
            );

            const loadBalancerToServerTwo = phaseProgress(
                frame,
                0.27,
                0.42
            );

            const serverToCache = phaseProgress(
                frame,
                0.44,
                0.57
            );

            const serverToDatabase = phaseProgress(
                frame,
                0.56,
                0.70
            );

            const serverToQueue = phaseProgress(
                frame,
                0.68,
                0.82
            );

            drawPacket(
                client,
                loadBalancer,
                clientToLoadBalancer,
                COLORS.client
            );

            drawPacket(
                loadBalancer,
                serverOne,
                loadBalancerToServerOne,
                COLORS.loadBalancer
            );

            drawPacket(
                loadBalancer,
                serverTwo,
                loadBalancerToServerTwo,
                COLORS.loadBalancer
            );

            drawPacket(
                serverTwo,
                cache,
                serverToCache,
                COLORS.cache
            );

            drawPacket(
                serverOne,
                database,
                serverToDatabase,
                COLORS.database
            );

            drawPacket(
                serverTwo,
                queue,
                serverToQueue,
                COLORS.queue
            );

            const clientActive =
                frame >= 0.03 && frame < 0.17;

            const loadBalancerActive =
                frame >= 0.17 && frame < 0.32;

            const serverOneActive =
                frame >= 0.32 && frame < 0.58;

            const serverTwoActive =
                frame >= 0.35 && frame < 0.68;

            const cacheActive =
                frame >= 0.53 && frame < 0.68;

            const databaseActive =
                frame >= 0.66 && frame < 0.80;

            const queueActive =
                frame >= 0.77 && frame < 0.90;

            drawNode({
                ...client,
                width: 50,
                height: 34,
                title: 'CLIENT',
                subtitle: 'browser',
                stroke: COLORS.client,
                active: clientActive,
            });

            drawNode({
                ...loadBalancer,
                width: 54,
                height: 44,
                title: 'LOAD BALANCER',
                subtitle: 'route',
                stroke: COLORS.loadBalancer,
                active: loadBalancerActive,
            });

            drawNode({
                ...serverOne,
                width: 50,
                height: 34,
                title: 'SERVER',
                subtitle: 'node-1',
                stroke: COLORS.server,
                active: serverOneActive,
            });

            drawNode({
                ...serverTwo,
                width: 50,
                height: 34,
                title: 'SERVER',
                subtitle: 'node-2',
                stroke: COLORS.server,
                active: serverTwoActive,
            });

            drawNode({
                ...database,
                width: 44,
                height: 32,
                title: 'DB',
                subtitle: 'primary',
                stroke: COLORS.database,
                active: databaseActive,
            });

            drawNode({
                ...cache,
                width: 50,
                height: 32,
                title: 'CACHE',
                subtitle: 'redis',
                stroke: COLORS.cache,
                active: cacheActive,
            });

            drawNode({
                ...queue,
                width: 58,
                height: 30,
                title: 'MSG QUEUE',
                subtitle: 'kafka',
                stroke: COLORS.queue,
                active: queueActive,
            });
        }

        function drawStaticFrame() {
            ctx.clearRect(
                0,
                0,
                getWidth(),
                getHeight()
            );

            drawBackgroundDots();
            drawArchitecture(0.62);
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
                getWidth(),
                getHeight(),
            );

            const frame =
                tRef.current /
                CYCLE;

            drawBackgroundDots();

            drawArchitecture(
                frame,
            );

            tRef.current =
                (tRef.current + 1) %
                CYCLE;

            rafRef.current =
                requestAnimationFrame(
                    draw,
                );
        }

        const resizeObserver = new ResizeObserver(() => {
            resize();

            if (reducedMotion) {
                drawStaticFrame();
            }
        });

        resizeObserver.observe(canvas);

        if (reducedMotion) {
            drawStaticFrame();
        } else {
            rafRef.current =
                requestAnimationFrame(draw);
        }

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

            resizeObserver.disconnect();
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            aria-hidden="true"
        />
    );
}

// ─── SystemDesignCourseCard ────────────────────────────────────────

export default function SystemDesignCourseCard({
    onClick,
    status = "Not Started",
    levelsFinished = 0,
    totalLevels,
    variant = "world",
}) {
    const allLevels =
        systemDesignRoadmapData.days.flatMap(
            (day) => day.levels
        );

    const calculatedTotalLevels =
        allLevels.length;

    const totalDurationMinutes =
        allLevels.reduce(
            (acc, level) =>
                acc + (level.durationInMinutes || 0),
            0
        );

    const formattedDuration =
        totalDurationMinutes >= 60
            ? `${Math.round(
                totalDurationMinutes / 60
            )} Hours`
            : `${totalDurationMinutes} Minutes`;

    const displayTotalLevels =
        totalLevels ||
        calculatedTotalLevels;

    const [hovered, setHovered] =
        useState(false);

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
                        ? 620
                        : 540,

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
            }}
        >
            {/* HERO */}
            <div
                className="
          relative
          overflow-hidden
          shrink-0
        "
                style={{
                    height:
                        variant === "home"
                            ? 305
                            : 250,

                    background:
                        "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
                }}
            >
                <SystemDesignCanvas />

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

            {/* INFO */}
            <div
                className="
          relative
          px-5
          pt-[18px]
          pb-5
          flex-grow
          flex
          flex-col
        "
                style={{
                    background: "#F2E0D0",
                }}
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
                        {totalDurationMinutes > 0
                            ? formattedDuration
                            : "System Design"}
                    </span>
                </div>

                <h3 className="text-[18px] font-extrabold leading-tight text-[#19183B] mb-1.5">
                    {systemDesignRoadmapData.title ||
                        "System Design"}
                </h3>

                <p className="text-[14px] font-medium leading-[1.5] text-[#19183B] mb-3">
                    {systemDesignRoadmapData.description ||
                        "Master scalable system design — databases, caching, load balancing, CAP theorem, and message queues."}
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