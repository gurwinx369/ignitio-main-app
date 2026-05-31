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

// ── Animation constants ──────────────────────────────────────────
const GREEN_BRIGHT = '#39d353';
const PURPLE       = '#bc8cff';
const LINE_COLOR   = 'rgba(80,80,80,0.35)';
const CYCLE        = 400;

const NODES = [
    { id: 'root',  x: 0.42, y: 0.88, color: '#3a3a3a'    },
    { id: 'c1',    x: 0.42, y: 0.68, color: '#3a3a3a'    },
    { id: 'feat',  x: 0.68, y: 0.52, color: PURPLE       },
    { id: 'c2',    x: 0.42, y: 0.50, color: '#3a3a3a'    },
    { id: 'pr',    x: 0.68, y: 0.33, color: PURPLE       },
    { id: 'merge', x: 0.42, y: 0.16, color: GREEN_BRIGHT },
];

const EDGES = [
    ['root', 'c1'],
    ['c1',   'feat'],
    ['c1',   'c2'],
    ['feat', 'pr'],
    ['pr',   'merge'],
    ['c2',   'merge'],
];

const NODE_TIMES = [0, 0.10, 0.24, 0.20, 0.38, 0.56];
const EDGE_TIMES = [
    [0.05, 0.16],
    [0.16, 0.28],
    [0.16, 0.30],
    [0.28, 0.42],
    [0.42, 0.55],
    [0.30, 0.60],
];

const NODE_LABELS = ['init', 'commit', 'branch', 'fix', 'PR', 'merge'];

function ease(x) {
    return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
}

// ── Canvas ───────────────────────────────────────────────────────
function GitVerticalCanvas() {
    const canvasRef = useRef(null);
    const rafRef    = useRef(null);
    const tRef      = useRef(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        function resize() {
            const dpr     = window.devicePixelRatio || 1;
            canvas.width  = canvas.offsetWidth  * dpr;
            canvas.height = canvas.offsetHeight * dpr;
            ctx.scale(dpr, dpr);
        }
        resize();

        const W    = () => canvas.offsetWidth;
        const H    = () => canvas.offsetHeight;
        const npos = n => ({ x: n.x * W(), y: n.y * H() });

        function drawLine(x1, y1, x2, y2, prog, color) {
            ctx.save();
            ctx.strokeStyle = color || LINE_COLOR;
            ctx.lineWidth   = 1.8;
            ctx.globalAlpha = 0.55;
            ctx.lineCap     = 'round';
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x1 + (x2 - x1) * prog, y1 + (y2 - y1) * prog);
            ctx.stroke();
            ctx.restore();
        }

        function drawCurve(pa, pb, prog, color) {
            ctx.save();
            ctx.strokeStyle = color;
            ctx.lineWidth   = 1.8;
            ctx.globalAlpha = 0.55;
            ctx.lineCap     = 'round';
            const cpx = pa.x + (pb.x - pa.x) * 0.5 + 14;
            const cpy = (pa.y + pb.y) / 2;
            ctx.beginPath();
            for (let s = 0; s <= prog; s += 0.02) {
                const bx = (1-s)*(1-s)*pa.x + 2*(1-s)*s*cpx + s*s*pb.x;
                const by = (1-s)*(1-s)*pa.y + 2*(1-s)*s*cpy + s*s*pb.y;
                s === 0 ? ctx.moveTo(bx, by) : ctx.lineTo(bx, by);
            }
            ctx.stroke();
            ctx.restore();
        }

        function drawNode(x, y, r, color, alpha, pulse) {
            const pr = r + pulse * 5;

            ctx.save();
            ctx.globalAlpha = alpha * 0.18 * (1 - pulse * 0.5);
            const grd = ctx.createRadialGradient(x, y, r * 0.3, x, y, pr + 12);
            grd.addColorStop(0, color);
            grd.addColorStop(1, 'transparent');
            ctx.fillStyle = grd;
            ctx.beginPath();
            ctx.arc(x, y, pr + 12, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            ctx.save();
            ctx.globalAlpha = alpha * 0.25;
            ctx.strokeStyle = color;
            ctx.lineWidth   = 1;
            ctx.beginPath();
            ctx.arc(x, y, pr + 3, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle   = color;
            ctx.shadowColor = color;
            ctx.shadowBlur  = color === GREEN_BRIGHT ? 14 : 6;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        function drawLabel(x, y, text, color, alpha) {
            ctx.save();
            ctx.globalAlpha = alpha * 0.5;
            ctx.fillStyle   = color === GREEN_BRIGHT ? GREEN_BRIGHT : '#555';
            ctx.font        = '9px monospace';
            ctx.textAlign   = 'right';
            ctx.fillText(text, x - 13, y + 3.5);
            ctx.restore();
        }

        function draw() {
            ctx.clearRect(0, 0, W(), H());
            const f = tRef.current / CYCLE;

            ctx.save();
            ctx.fillStyle = 'rgba(0,0,0,0.06)';
            for (let gx = 18; gx < W(); gx += 24) {
                for (let gy = 18; gy < H(); gy += 24) {
                    ctx.beginPath();
                    ctx.arc(gx, gy, 0.8, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            ctx.restore();

            EDGES.forEach(([a, b], i) => {
                const na = NODES.find(n => n.id === a);
                const nb = NODES.find(n => n.id === b);
                const pa = npos(na), pb = npos(nb);
                const [ts, te] = EDGE_TIMES[i];
                const prog = Math.min(1, Math.max(0, (f - ts) / (te - ts)));
                if (prog <= 0) return;

                if (i === 1 || i === 4) {
                    drawCurve(pa, pb, prog, PURPLE);
                } else {
                    drawLine(pa.x, pa.y, pb.x, pb.y, prog, i === 3 ? PURPLE : LINE_COLOR);
                }
            });

            NODES.forEach((n, i) => {
                const appear = Math.min(1, Math.max(0, (f - NODE_TIMES[i]) / 0.07));
                if (appear <= 0) return;
                const pos   = npos(n);
                const pulse = Math.max(0, 1 - (f - NODE_TIMES[i]) / 0.14);
                drawNode(pos.x, pos.y, 6, n.color, ease(appear), pulse);
                drawLabel(pos.x, pos.y, NODE_LABELS[i], n.color, ease(appear));
            });

            if (f > 0.08) {
                const ef    = (f - 0.08) / 0.92;
                const total = EDGES.length;
                const which = Math.floor(ef * total * 1.1) % total;
                const dp    = (ef * total * 1.1) % 1;
                const [a, b] = EDGES[which];
                const na = NODES.find(n => n.id === a);
                const nb = NODES.find(n => n.id === b);
                const pa = npos(na), pb = npos(nb);
                const dx = pa.x + (pb.x - pa.x) * ease(dp);
                const dy = pa.y + (pb.y - pa.y) * ease(dp);

                ctx.save();
                ctx.fillStyle   = '#555';
                ctx.shadowColor = GREEN_BRIGHT;
                ctx.shadowBlur  = 8;
                ctx.globalAlpha = 0.7;
                ctx.beginPath();
                ctx.arc(dx, dy, 2.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }

            tRef.current   = (tRef.current + 1) % CYCLE;
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

import { gitGithubRoadmapData } from '@/data/gitGithubCourseData';

// ── Card ─────────────────────────────────────────────────────────
export default function GitCourseCard({
                                          onClick,
                                          status         = 'Not Started',
                                          levelsFinished = 0,
                                          totalLevels,
                                      }) {
    const totalLevelsData = gitGithubRoadmapData.days.flatMap(day => day.levels);
    const calculatedTotalLevels = totalLevelsData.length;
    const totalDurationMinutes = totalLevelsData.reduce((acc, level) => acc + (level.durationInMinutes || 0), 0);
    const formattedDuration = totalDurationMinutes >= 60 
        ? `${Math.round(totalDurationMinutes / 60)} Hours`
        : `${totalDurationMinutes} Minutes`;

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

    // Use passed totalLevels or fallback to calculated
    const displayTotalLevels = totalLevels || calculatedTotalLevels;

    // No longer trying to fetch completedLevels here because it is passed from the parent now
    // useEffect(() => {
    //     // handled in page.js
    // }, []);

    return (
        <div
            onClick={handleClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="w-full sm:w-120 overflow-hidden select-none"
            style={{
                borderRadius:  24,
                boxShadow:     shadow,
                transform:     scale,
                transition:    'transform 0.28s ease, box-shadow 0.28s ease',
                cursor:        isLocked ? 'not-allowed' : 'pointer',
                pointerEvents: isLocked ? 'none'        : 'auto',
            }}
        >
            {/* ── Top: animation area ───────────────────────────────── */}
            <div
                className="relative overflow-hidden"
                style={{ height: 260, background: '#edeae2' }}
            >
                <GitVerticalCanvas />

                {/* Loading overlay on canvas */}
                {isActive && (
                    <div
                        aria-hidden="true"
                        style={{
                            position:      'absolute',
                            inset:         0,
                            background:    isSuccess
                                ? 'rgba(57,211,83,0.06)'
                                : 'rgba(0,0,0,0.08)',
                            transition:    'background 0.28s ease',
                            pointerEvents: 'none',
                        }}
                    />
                )}

                {/* Status badge — morphs through states */}
                <StatusBadge state={state} status={status} />
            </div>

            {/* ── Bottom: info card ─────────────────────────────────── */}
            <div
                className="px-5 pt-4.5 pb-5"
                style={{ background: '#f2e0d0', position: 'relative' }}
            >
                {/* Shimmer + success flash */}
                <CardInfoShimmer state={state} />

                {/* Duration */}
                <div className="flex items-center gap-1.5 mb-3.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                         stroke="#3a3330" strokeWidth="2.2"
                         strokeLinecap="round" strokeLinejoin="round"
                         style={{ opacity: 0.55, flexShrink: 0 }}
                    >
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span
                        className="text-[11px] font-bold tracking-widest uppercase"
                        style={{ color: '#3a3330' }}
                    >
            {totalDurationMinutes > 0 ? formattedDuration : "4 Hours"}
          </span>
                </div>

                {/* Description */}
                <p
                    className="text-[15.5px] font-medium leading-[1.55] mb-4"
                    style={{ color: '#1e1a18' }}
                >
                    Learn Git &amp; GitHub from scratch — branching, merging, pull
                    requests, and the workflows real developers use every day.
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

                {/* Arrow / Spinner / Checkmark */}
                <div className="flex justify-end">
                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{
                            background: arrowBg,
                            transform:  isLoading ? 'none' : hovered && !isLocked ? 'translateX(3px)' : 'translateX(0)',
                            transition: 'all 0.22s ease',
                        }}
                    >
                        {isLoading && <SpinnerIcon size={14} color="#1e1a18" />}
                        {isSuccess  && <SuccessIcon size={14} color="#2ecc8a" />}
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
