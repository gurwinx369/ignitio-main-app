"use client";

import React from "react";

/*
 * RoadmapSkeleton — mirrors RoadmapWorldView layout exactly.
 *
 * Same constants as RoadmapWorldView so the skeleton occupies
 * the identical spatial footprint as the real content.
 *
 * Apple HIG (loading.md): skeletons should preserve layout
 * structure so the transition feels like a reveal, not a jump.
 *
 * Vercel best-practice (rendering-hoist-jsx): node position
 * math is done at module level, not per render.
 */

const NODE_HEIGHT = 72;
const NODE_GAP = 96;
const TOP_PADDING = 120;
const BOTTOM_PADDING = 120;
const VIEWBOX_WIDTH = 1000;

// Default node count — matches a typical GenAI week (7 levels)
const DEFAULT_NODE_COUNT = 7;

// Module-level: compute positions once, not per render
function buildNodePositions(count) {
    return Array.from({ length: count }, (_, index) => {
        const row = Math.floor(index / 3);
        const col = index % 3;
        const reverse = row % 2 !== 0;
        const actualCol = reverse ? 2 - col : col;

        const xDesktop = [20, 50, 80][actualCol];
        const xTablet = [30, 50, 70][actualCol];
        const y = TOP_PADDING + index * (NODE_HEIGHT + NODE_GAP);

        return { xDesktop, xTablet, y };
    });
}

function buildCurvedPath(points) {
    return points.reduce((acc, point, index) => {
        if (index === 0) return `M ${point.x} ${point.y}`;
        const prev = points[index - 1];
        const midY = (prev.y + point.y) / 2;
        return `${acc} Q ${prev.x} ${midY} ${(prev.x + point.x) / 2} ${midY} T ${point.x} ${point.y}`;
    }, "");
}

export default function RoadmapSkeleton({ color = "#f59e0b", nodeCount = DEFAULT_NODE_COUNT }) {
    const positions = buildNodePositions(nodeCount);

    const containerHeight =
        TOP_PADDING +
        (nodeCount > 0 ? (nodeCount - 1) * (NODE_HEIGHT + NODE_GAP) : 0) +
        BOTTOM_PADDING;

    const desktopPoints = positions.map((p) => ({
        x: (p.xDesktop / 100) * VIEWBOX_WIDTH,
        y: p.y,
    }));

    const tabletPoints = positions.map((p) => ({
        x: (p.xTablet / 100) * VIEWBOX_WIDTH,
        y: p.y,
    }));

    const mobilePathHeight =
        nodeCount > 0 ? (nodeCount - 1) * (NODE_HEIGHT + NODE_GAP) : 0;

    // Shimmer color derived from the tier accent — desaturated for skeleton feel
    const shimmerBg = `${color}18`;
    const shimmerBorder = `${color}30`;
    const pathColor = `${color}25`;

    return (
        <div
            className="relative w-full bg-[var(--color-primary,#FFF8EF)] overflow-hidden"
            style={{ minHeight: `${containerHeight}px` }}
            role="status"
            aria-label="Loading roadmap"
            aria-busy="true"
        >
            {/*
              * Shimmer sweep — single CSS animation via keyframes injected inline.
              * Apple HIG (motion.md): loading animation should move in a consistent
              * direction (left-to-right) matching reading direction.
              * Vercel (rendering-hoist-jsx): style tag is static, safe at module level.
              */}
            <style>{`
                @keyframes _sk_sweep {
                    0%   { transform: translateX(-100%); }
                    100% { transform: translateX(200%); }
                }
                .sk-sweep::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(
                        105deg,
                        transparent 35%,
                        rgba(255,255,255,0.55) 50%,
                        transparent 65%
                    );
                    animation: _sk_sweep 1.6s ease-in-out infinite;
                }
            `}</style>

            {/* Subtle background glow — same as real roadmap background feel */}
            <div
                className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none"
                style={{ backgroundColor: color, opacity: 0.04 }}
            />

            {/* ── SVG PATH SKELETONS ───────────────────────────────────── */}
            <div className="absolute inset-0 z-0 pointer-events-none" style={{ opacity: 0.35 }}>

                {/* Mobile — vertical center line */}
                <svg
                    width="100%"
                    height="100%"
                    className="md:hidden absolute inset-0 overflow-visible"
                >
                    <line
                        x1="50%"
                        x2="50%"
                        y1={TOP_PADDING}
                        y2={TOP_PADDING + mobilePathHeight}
                        stroke={pathColor}
                        strokeWidth="6"
                        strokeLinecap="round"
                    />
                </svg>

                {/* Tablet — curved zigzag */}
                <svg
                    viewBox={`0 0 ${VIEWBOX_WIDTH} ${containerHeight}`}
                    width="100%"
                    height="100%"
                    preserveAspectRatio="none"
                    className="hidden md:block lg:hidden absolute inset-0 overflow-visible"
                >
                    <path
                        d={buildCurvedPath(tabletPoints)}
                        fill="none"
                        stroke={pathColor}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>

                {/* Desktop — curved zigzag */}
                <svg
                    viewBox={`0 0 ${VIEWBOX_WIDTH} ${containerHeight}`}
                    width="100%"
                    height="100%"
                    preserveAspectRatio="none"
                    className="hidden lg:block absolute inset-0 overflow-visible"
                >
                    <path
                        d={buildCurvedPath(desktopPoints)}
                        fill="none"
                        stroke={pathColor}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </div>

            {/* ── NODE SKELETONS ───────────────────────────────────────── */}
            <div className="absolute inset-0 z-10 w-full h-full pointer-events-none">
                {positions.map((pos, index) => (
                    <React.Fragment key={index}>

                        {/* Desktop node */}
                        <div
                            className="hidden lg:flex flex-col items-center gap-2 absolute"
                            style={{
                                left: `${pos.xDesktop}%`,
                                top: `${pos.y}px`,
                                transform: "translate(-50%, -50%)",
                            }}
                        >
                            <SkeletonNode
                                color={color}
                                shimmerBg={shimmerBg}
                                shimmerBorder={shimmerBorder}
                                index={index}
                            />
                        </div>

                        {/* Tablet node */}
                        <div
                            className="hidden md:flex lg:hidden flex-col items-center gap-2 absolute"
                            style={{
                                left: `${pos.xTablet}%`,
                                top: `${pos.y}px`,
                                transform: "translate(-50%, -50%)",
                            }}
                        >
                            <SkeletonNode
                                color={color}
                                shimmerBg={shimmerBg}
                                shimmerBorder={shimmerBorder}
                                index={index}
                            />
                        </div>

                        {/* Mobile node */}
                        <div
                            className="flex md:hidden flex-col items-center gap-2 absolute"
                            style={{
                                left: "50%",
                                top: `${pos.y}px`,
                                transform: "translate(-50%, -50%)",
                            }}
                        >
                            <SkeletonNode
                                color={color}
                                shimmerBg={shimmerBg}
                                shimmerBorder={shimmerBorder}
                                index={index}
                            />
                        </div>

                    </React.Fragment>
                ))}
            </div>
        </div>
    );
}

/*
 * SkeletonNode — mirrors the circular node + label below it.
 *
 * Apple HIG (loading.md): use rounded shapes matching real UI.
 * Stagger animation-delay per index so nodes don't all pulse in sync —
 * this feels more organic and less distracting (HIG: prefer subtle motion).
 */
function SkeletonNode({ color, shimmerBg, shimmerBorder, index }) {
    const delayMs = (index % 4) * 120;

    return (
        <div className="flex flex-col items-center gap-2.5">
            {/* Circle — matches RoadmapNode size (72×72px) */}
            <div
                className="sk-sweep relative overflow-hidden rounded-full border-2 shadow-sm"
                style={{
                    width: 72,
                    height: 72,
                    backgroundColor: shimmerBg,
                    borderColor: shimmerBorder,
                    animationDelay: `${delayMs}ms`,
                }}
            />
            {/* Label line — mirrors the level name text below each node */}
            <div
                className="sk-sweep relative overflow-hidden rounded-full"
                style={{
                    width: index % 3 === 1 ? 80 : 64,
                    height: 10,
                    backgroundColor: shimmerBg,
                    animationDelay: `${delayMs + 60}ms`,
                }}
            />
            {/* Sub-label — mirrors concept text */}
            <div
                className="sk-sweep relative overflow-hidden rounded-full"
                style={{
                    width: index % 3 === 1 ? 56 : 48,
                    height: 8,
                    backgroundColor: shimmerBg,
                    opacity: 0.6,
                    animationDelay: `${delayMs + 120}ms`,
                }}
            />
        </div>
    );
}
