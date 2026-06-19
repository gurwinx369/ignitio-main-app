import React, { useState, useEffect } from 'react';
import RoadmapNode from './RoadmapNode';
import RoadmapBackgroundLayer from './RoadmapBackgroundLayer';
import { roadmapThemes } from './theme';

const RoadmapWorldView = ({
    levels,
    allLevels = levels,
    completedLevels,
    color,
    onNodeClick,
    difficulty = "beginner",
    roadmapId
}) => {
    const baseTheme = roadmapThemes[difficulty] || roadmapThemes.beginner;
    const theme = color ? { ...baseTheme, accent: color } : baseTheme;

    const [isHintDismissed, setIsHintDismissed] = useState(true);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const key = `ignitio:roadmap-start-hint:${roadmapId || window.location.pathname}`;
            setIsHintDismissed(localStorage.getItem(key) === 'true');
        }
    }, [roadmapId]);

    const handleNodeClick = (level, event) => {
        if (!isHintDismissed) {
            const key = `ignitio:roadmap-start-hint:${roadmapId || window.location.pathname}`;
            localStorage.setItem(key, 'true');
            setIsHintDismissed(true);
        }
        if (onNodeClick) {
            onNodeClick(level, event);
        }
    };

    const NODE_HEIGHT = 72;
    const NODE_GAP = 96;
    const TOP_PADDING = 120;
    const BOTTOM_PADDING = 120;

    const VIEWBOX_WIDTH = 1000;

    // Node positions
    const getNodePosition = (index) => {
        const row = Math.floor(index / 3);
        const col = index % 3;

        const reverse = row % 2 !== 0;
        const actualCol = reverse ? 2 - col : col;

        const xDesktop = [20, 50, 80][actualCol];
        const xTablet = [30, 50, 70][actualCol];

        const y =
            TOP_PADDING +
            index * (NODE_HEIGHT + NODE_GAP);

        return {
            desktopX: xDesktop,
            tabletX: xTablet,
            y
        };
    };

    // Build points for SVG
    const desktopPoints = levels.map((_, i) => {
        const p = getNodePosition(i);

        return {
            x: (p.desktopX / 100) * VIEWBOX_WIDTH,
            y: p.y
        };
    });

    const tabletPoints = levels.map((_, i) => {
        const p = getNodePosition(i);

        return {
            x: (p.tabletX / 100) * VIEWBOX_WIDTH,
            y: p.y
        };
    });

    const buildCurvedPath = (points) => {
        return points.reduce((acc, point, index) => {
            if (index === 0) {
                return `M ${point.x} ${point.y}`;
            }

            const prev = points[index - 1];
            const midY = (prev.y + point.y) / 2;

            return `${acc} Q ${prev.x} ${midY} ${(prev.x + point.x) / 2} ${midY} T ${point.x} ${point.y}`;
        }, '');
    };

    const mobilePathHeight =
        levels.length > 0
            ? (levels.length - 1) *
            (NODE_HEIGHT + NODE_GAP)
            : 0;

    const containerHeight =
        TOP_PADDING +
        (levels.length > 0
            ? (levels.length - 1) *
            (NODE_HEIGHT + NODE_GAP)
            : 0) +
        BOTTOM_PADDING;

    return (
        <div
            className="relative w-full bg-[var(--color-primary)]"
            style={{
                minHeight: `${containerHeight}px`
            }}
        >
            <RoadmapBackgroundLayer
                difficulty={difficulty}
            />

            {/* SVG PATHS */}
            <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">

                {/* Mobile */}
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
                        stroke={theme.accent}
                        strokeWidth="6"
                        strokeLinecap="round"
                    />
                </svg>

                {/* Tablet */}
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
                        stroke={theme.accent}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ filter: `drop-shadow(0 0 8px ${theme.glow})` }}
                    />
                </svg>

                {/* Desktop */}
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
                        stroke={theme.accent}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ filter: `drop-shadow(0 0 8px ${theme.glow})` }}
                    />
                </svg>
            </div>

            {/* NODES */}
            <div className="absolute inset-0 z-10 w-full h-full pointer-events-none">

                {levels.map((level, index) => {
                    const isCompleted =
                        completedLevels.includes(level.id);

                    const globalIndex = allLevels.findIndex(l => l.id === level.id);
                    let isUnlocked = false;

                    if (
                        isCompleted ||
                        globalIndex === 0
                    ) {
                        isUnlocked = true;
                    } else if (globalIndex > 0) {
                        const prevLevel =
                            allLevels[globalIndex - 1];

                        isUnlocked =
                            completedLevels.includes(
                                prevLevel.id
                            );
                    }

                    const status = isCompleted
                        ? "completed"
                        : isUnlocked
                            ? "unlocked"
                            : "locked";

                    const pos =
                        getNodePosition(index);

                    return (
                        <React.Fragment
                            key={level.id}
                        >

                            {/* Desktop */}
                            <div
                                className="hidden lg:flex absolute pointer-events-auto"
                                style={{
                                    left: `${pos.desktopX}%`,
                                    top: `${pos.y}px`,
                                    transform:
                                        "translate(-50%,-50%)"
                                }}
                            >
                                <RoadmapNode
                                    level={level}
                                    index={index}
                                    status={status}
                                    theme={theme}
                                    onClick={handleNodeClick}
                                    showStartHint={!isHintDismissed && status === 'unlocked'}
                                />
                            </div>

                            {/* Tablet */}
                            <div
                                className="hidden md:flex lg:hidden absolute pointer-events-auto"
                                style={{
                                    left: `${pos.tabletX}%`,
                                    top: `${pos.y}px`,
                                    transform:
                                        "translate(-50%,-50%)"
                                }}
                            >
                                <RoadmapNode
                                    level={level}
                                    index={index}
                                    status={status}
                                    theme={theme}
                                    onClick={handleNodeClick}
                                    showStartHint={!isHintDismissed && status === 'unlocked'}
                                />
                            </div>

                            {/* Mobile */}
                            <div
                                className="flex md:hidden absolute pointer-events-auto"
                                style={{
                                    left: "50%",
                                    top: `${pos.y}px`,
                                    transform:
                                        "translate(-50%,-50%)"
                                }}
                            >
                                <RoadmapNode
                                    level={level}
                                    index={index}
                                    status={status}
                                    theme={theme}
                                    onClick={handleNodeClick}
                                    showStartHint={!isHintDismissed && status === 'unlocked'}
                                />
                            </div>

                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};

export default RoadmapWorldView;