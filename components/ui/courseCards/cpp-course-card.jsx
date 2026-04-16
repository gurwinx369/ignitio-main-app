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

// ─── 17 second loop (1020 frames @ 60fps) ────────────────────────
const CYCLE = 1020;

const F = {
    EDITOR_IN:   0,
    MAIN:        70,
    VAR:         200,
    CALL:        330,
    FUNC_DEF:    430,
    COUT1:       520,
    OUTPUT1:     590,
    RETURN_ARC:  660,
    COUT2:       740,
    OUTPUT2:     810,
    RET0:        880,
    DONE:        940,
    HOLD:        970,
};

function caption(t) {
    if (t < F.MAIN)       return { step: '',       title: 'C++ Execution',      sub: 'Watch a real program run, line by line' };
    if (t < F.VAR)        return { step: 'Step 1', title: 'main() starts',      sub: 'Every C++ program begins here' };
    if (t < F.CALL)       return { step: 'Step 2', title: 'int x = 5',          sub: 'Declare a variable and store the value 5' };
    if (t < F.FUNC_DEF)   return { step: 'Step 3', title: 'greet() is called',  sub: 'Execution jumps into the function above' };
    if (t < F.COUT1)      return { step: 'Step 4', title: 'Inside greet()',     sub: 'The function body starts running' };
    if (t < F.RETURN_ARC) return { step: 'Step 5', title: 'cout << "Hello!"',   sub: 'Text is printed to the output screen' };
    if (t < F.COUT2)      return { step: 'Step 6', title: 'Returned to main()', sub: 'Function done — back to where we called it' };
    if (t < F.RET0)       return { step: 'Step 7', title: 'cout << x * 2',      sub: '5 × 2 = 10  →  printed to output' };
    if (t < F.DONE)       return { step: 'Step 8', title: 'return 0',           sub: 'Program signals it finished successfully' };
    return                       { step: '✓ Done', title: 'Full C++ Flow',      sub: 'declare → call → compute → output' };
}

const LINES = [
    { tokens: [{ t: 'void ',   c: '#c678dd' }, { t: 'greet', c: '#61afef' }, { t: '() {', c: '#abb2bf' }],   active: F.FUNC_DEF },
    { tokens: [{ t: '  cout',  c: '#61afef' }, { t: ' << ',  c: '#abb2bf' }, { t: '"Hello!"', c: '#98c379' }, { t: ';', c: '#abb2bf' }], active: F.COUT1 },
    { tokens: [{ t: '}',       c: '#abb2bf' }],   active: -1 },
    { tokens: [],                                  active: -1 },
    { tokens: [{ t: 'int ',    c: '#c678dd' }, { t: 'main', c: '#61afef' }, { t: '() {', c: '#abb2bf' }],    active: F.MAIN },
    { tokens: [{ t: '  int ',  c: '#c678dd' }, { t: 'x',   c: '#e06c75' }, { t: ' = ',  c: '#abb2bf' }, { t: '5', c: '#d19a66' }, { t: ';', c: '#abb2bf' }], active: F.VAR },
    { tokens: [{ t: '  ',      c: '#abb2bf' }, { t: 'greet', c: '#61afef' }, { t: '();', c: '#abb2bf' }],    active: F.CALL },
    { tokens: [{ t: '  cout',  c: '#61afef' }, { t: ' << ', c: '#abb2bf' }, { t: 'x', c: '#e06c75' }, { t: ' * ', c: '#abb2bf' }, { t: '2', c: '#d19a66' }, { t: ';', c: '#abb2bf' }], active: F.COUT2 },
    { tokens: [{ t: '  ',      c: '#abb2bf' }, { t: 'return ', c: '#c678dd' }, { t: '0', c: '#d19a66' }, { t: ';', c: '#abb2bf' }], active: F.RET0 },
    { tokens: [{ t: '}',       c: '#abb2bf' }],   active: -1 },
];

const OUTPUT_LINES = [
    { text: 'Hello!', start: F.OUTPUT1, dur: 35, color: '#98c379' },
    { text: '10',     start: F.OUTPUT2, dur: 25, color: '#d19a66' },
];

const ease  = x => x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const prog  = (t, s, d) => ease(clamp((t - s) / d, 0, 1));

function activeLineFor(t) {
    const frameToLine = {
        [F.MAIN]:       4,
        [F.VAR]:        5,
        [F.CALL]:       6,
        [F.FUNC_DEF]:   0,
        [F.COUT1]:      1,
        [F.RETURN_ARC]: 6,
        [F.COUT2]:      7,
        [F.RET0]:       8,
    };
    const frameKeys = [F.RET0, F.COUT2, F.RETURN_ARC, F.COUT1, F.FUNC_DEF, F.CALL, F.VAR, F.MAIN];
    for (const fv of frameKeys) {
        if (t >= fv) return frameToLine[fv] ?? -1;
    }
    return -1;
}

// ─── Canvas ───────────────────────────────────────────────────────
function CppExecCanvas() {
    const canvasRef = useRef(null);
    const rafRef    = useRef(null);
    const tRef      = useRef(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        function resize() {
            const dpr = window.devicePixelRatio || 1;
            canvas.width  = canvas.offsetWidth  * dpr;
            canvas.height = canvas.offsetHeight * dpr;
            ctx.scale(dpr, dpr);
        }
        resize();

        const W = () => canvas.offsetWidth;
        const H = () => canvas.offsetHeight;

        const PAD      = 10;
        const CODE_X   = () => PAD + 10;
        const CODE_W   = () => W() * 0.60;
        const TERM_X   = () => CODE_X() + CODE_W() + 8;
        const TERM_W   = () => W() - TERM_X() - PAD;
        const PANEL_Y  = 14;
        const LINE_H   = 17;
        const NUM_W    = 20;
        const CODE_TOP = PANEL_Y + 22;
        const PANEL_H  = () => LINES.length * LINE_H + 28;
        const lineY    = i => CODE_TOP + i * LINE_H + 12;

        function rr(x, y, w, h, r) {
            ctx.beginPath(); ctx.roundRect(x, y, w, h, r);
        }

        function drawPanel(x, y, w, h, bg, border, alpha) {
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = bg;
            rr(x, y, w, h, 8); ctx.fill();
            ctx.strokeStyle = border;
            ctx.lineWidth = 1;
            rr(x, y, w, h, 8); ctx.stroke();
            ctx.restore();
        }

        function drawTitleBar(x, y, w, label, alpha) {
            ctx.save();
            ctx.globalAlpha = alpha;
            [['#ff6058', x + 8], ['#ffbd2e', x + 18], ['#28ca41', x + 28]].forEach(([c, dx]) => {
                ctx.fillStyle = c; ctx.beginPath(); ctx.arc(dx, y + 8, 3.5, 0, Math.PI * 2); ctx.fill();
            });
            ctx.fillStyle = 'rgba(255,255,255,0.22)';
            ctx.font = '8px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(label, x + w / 2, y + 11);
            ctx.textAlign = 'left';
            ctx.restore();
        }

        function drawEditor(alpha, t) {
            if (alpha <= 0) return;
            const x = CODE_X(), w = CODE_W(), ph = PANEL_H();
            drawPanel(x, PANEL_Y, w, ph, '#1a1d2e', 'rgba(255,255,255,0.07)', alpha);
            drawTitleBar(x, PANEL_Y, w, 'main.cpp', alpha);

            ctx.save();
            ctx.globalAlpha = alpha * 0.15;
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x + 1, PANEL_Y + 18); ctx.lineTo(x + w - 1, PANEL_Y + 18);
            ctx.stroke();
            ctx.restore();

            const activeLine = activeLineFor(t);

            LINES.forEach((line, i) => {
                const ly    = lineY(i);
                const isAct = i === activeLine && activeLine >= 0;

                if (isAct) {
                    ctx.save();
                    ctx.globalAlpha = alpha * 0.22;
                    ctx.fillStyle = '#ffd866';
                    ctx.fillRect(x + NUM_W, ly - 12, w - NUM_W, LINE_H);
                    ctx.globalAlpha = alpha * 0.9;
                    ctx.fillStyle = '#ffd866';
                    ctx.fillRect(x + NUM_W, ly - 12, 2.5, LINE_H);
                    ctx.restore();
                }

                ctx.save();
                ctx.globalAlpha = alpha * (isAct ? 0.7 : 0.22);
                ctx.fillStyle = '#fff';
                ctx.font = '9px monospace';
                ctx.textAlign = 'right';
                ctx.fillText(i + 1, x + NUM_W - 4, ly);
                ctx.textAlign = 'left';
                ctx.restore();

                let tx = x + NUM_W + 7;
                line.tokens.forEach(tok => {
                    ctx.save();
                    ctx.globalAlpha = alpha * (isAct ? 1 : 0.7);
                    ctx.fillStyle = tok.c;
                    ctx.font = isAct ? 'bold 10.5px monospace' : '10.5px monospace';
                    ctx.fillText(tok.t, tx, ly);
                    tx += ctx.measureText(tok.t).width;
                    ctx.restore();
                });
            });
        }

        function drawExecArrow(alpha, t) {
            if (alpha <= 0) return;
            const activeLine = activeLineFor(t);
            if (activeLine < 0) return;
            const x = CODE_X() - 2;
            const y = lineY(activeLine) - 5;
            const pulse = 0.75 + 0.25 * Math.sin(tRef.current * 0.1);
            ctx.save();
            ctx.globalAlpha = alpha * pulse;
            ctx.fillStyle = '#ffd866';
            ctx.shadowColor = '#ffd866';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.moveTo(x, y - 4);
            ctx.lineTo(x + 9, y);
            ctx.lineTo(x, y + 4);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }

        function drawCallArc(alpha) {
            if (alpha <= 0) return;
            const x  = CODE_X() + CODE_W();
            const y1 = lineY(6) - 5;
            const y2 = lineY(0) - 5;
            const ax = x + 14;
            ctx.save();
            ctx.globalAlpha = alpha * 0.75;
            ctx.strokeStyle = '#c678dd';
            ctx.lineWidth = 1.8;
            ctx.setLineDash([5, 5]);
            ctx.lineDashOffset = -(tRef.current * 0.25);
            ctx.beginPath();
            ctx.moveTo(x, y1); ctx.lineTo(ax, y1); ctx.lineTo(ax, y2); ctx.lineTo(x + 4, y2);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = '#c678dd';
            ctx.globalAlpha = alpha;
            ctx.shadowColor = '#c678dd';
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.moveTo(x + 4, y2 - 4); ctx.lineTo(x + 4, y2 + 4); ctx.lineTo(x - 4, y2);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }

        function drawReturnArc(alpha) {
            if (alpha <= 0) return;
            const x  = CODE_X() + CODE_W();
            const y1 = lineY(2) - 5;
            const y2 = lineY(7) - 5;
            const ax = x + 14;
            ctx.save();
            ctx.globalAlpha = alpha * 0.65;
            ctx.strokeStyle = '#98c379';
            ctx.lineWidth = 1.8;
            ctx.setLineDash([5, 5]);
            ctx.lineDashOffset = -(tRef.current * 0.25);
            ctx.beginPath();
            ctx.moveTo(x, y1); ctx.lineTo(ax, y1); ctx.lineTo(ax, y2); ctx.lineTo(x + 4, y2);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = '#98c379';
            ctx.globalAlpha = alpha;
            ctx.shadowColor = '#98c379';
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.moveTo(x + 4, y2 - 4); ctx.lineTo(x + 4, y2 + 4); ctx.lineTo(x - 4, y2);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }

        function drawTerminal(alpha, t) {
            if (alpha <= 0) return;
            const x = TERM_X(), w = TERM_W(), ph = PANEL_H();
            drawPanel(x, PANEL_Y, w, ph, '#0d1117', 'rgba(255,255,255,0.07)', alpha);
            drawTitleBar(x, PANEL_Y, w, 'output', alpha);
            ctx.save();
            ctx.globalAlpha = alpha * 0.15;
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x + 1, PANEL_Y + 18); ctx.lineTo(x + w - 1, PANEL_Y + 18);
            ctx.stroke();
            ctx.restore();

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = '#98c379';
            ctx.font = 'bold 9px monospace';
            ctx.fillText('$', x + 7, PANEL_Y + 34);
            ctx.fillStyle = 'rgba(255,255,255,0.35)';
            ctx.fillText(' run', x + 14, PANEL_Y + 34);
            ctx.restore();

            let oy = PANEL_Y + 52;
            OUTPUT_LINES.forEach(out => {
                const a = prog(t, out.start, out.dur);
                if (a <= 0) return;
                const visible = Math.floor(a * out.text.length);
                const display = out.text.slice(0, visible);
                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.fillStyle = out.color;
                ctx.font = 'bold 13px monospace';
                ctx.fillText(display, x + 7, oy);
                if (visible < out.text.length) {
                    const blink = 0.3 + 0.7 * Math.abs(Math.sin(tRef.current * 0.09));
                    ctx.globalAlpha = alpha * blink;
                    ctx.fillStyle = '#fff';
                    const cw = ctx.measureText(display).width;
                    ctx.fillRect(x + 7 + cw + 1, oy - 11, 1.5, 13);
                }
                ctx.restore();
                oy += 22;
            });

            if (t >= F.DONE) {
                const da = prog(t, F.DONE, 25);
                ctx.save();
                ctx.globalAlpha = alpha * da;
                ctx.fillStyle = '#98c379';
                ctx.font = 'bold 9px monospace';
                ctx.fillText('✓ done', x + 7, oy + 4);
                ctx.restore();
            }
        }

        function drawCaption(alpha, t) {
            if (alpha <= 0) return;
            const cap  = caption(t);
            const cy   = H() - 46;
            const padX = PAD + 4;
            const w    = W() - padX * 2;

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = 'rgba(8,10,18,0.82)';
            ctx.beginPath(); ctx.roundRect(padX, cy, w, 40, 7); ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.07)';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.roundRect(padX, cy, w, 40, 7); ctx.stroke();

            if (cap.step) {
                const stepW = ctx.measureText(cap.step).width + 14;
                ctx.fillStyle = '#ffd866';
                ctx.beginPath(); ctx.roundRect(padX + 8, cy + 8, stepW, 14, 4); ctx.fill();
                ctx.fillStyle = '#1a1a1a';
                ctx.font = 'bold 8px monospace';
                ctx.textAlign = 'left';
                ctx.fillText(cap.step, padX + 15, cy + 18);
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 10px monospace';
                ctx.fillText(cap.title, padX + stepW + 14, cy + 18);
            } else {
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 10px monospace';
                ctx.textAlign = 'left';
                ctx.fillText(cap.title, padX + 10, cy + 18);
            }

            ctx.fillStyle = 'rgba(255,255,255,0.40)';
            ctx.font = '9px monospace';
            ctx.fillText(cap.sub, padX + 10, cy + 32);
            ctx.restore();
        }

        function draw() {
            ctx.clearRect(0, 0, W(), H());
            const t = tRef.current;
            const bg = ctx.createLinearGradient(0, 0, 0, H());
            bg.addColorStop(0, '#0e1117'); bg.addColorStop(1, '#12151f');
            ctx.fillStyle = bg; ctx.fillRect(0, 0, W(), H());

            for (let sy = 0; sy < H(); sy += 3) {
                ctx.fillStyle = 'rgba(0,0,0,0.04)';
                ctx.fillRect(0, sy, W(), 1);
            }

            const edA = prog(t, F.EDITOR_IN, 45);
            drawEditor(edA, t);
            if (t >= F.MAIN) drawExecArrow(prog(t, F.MAIN, 20), t);
            if (t >= F.CALL && t < F.RETURN_ARC) drawCallArc(prog(t, F.CALL, 30));
            if (t >= F.RETURN_ARC && t < F.COUT2 + 40) drawReturnArc(prog(t, F.RETURN_ARC, 30));
            drawTerminal(edA, t);
            drawCaption(edA, t);

            tRef.current   = (tRef.current + 1) % CYCLE;
            rafRef.current = requestAnimationFrame(draw);
        }

        rafRef.current = requestAnimationFrame(draw);
        const ro = new ResizeObserver(resize);
        ro.observe(canvas);
        return () => { cancelAnimationFrame(rafRef.current); ro.disconnect(); };
    }, []);

    return <canvas ref={canvasRef} className="block w-full h-full" />;
}

// ─── CppCourseCard ────────────────────────────────────────────────
export default function CppCourseCard({
                                          onClick,
                                          status         = 'Not Started',
                                          levelsFinished = 0,
                                          totalLevels    = 9,
                                      }) {
    const [hovered, setHovered] = useState(false);

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
            className="w-120 overflow-hidden select-none"
            style={{
                borderRadius: 24,
                boxShadow:    shadow,
                transform:    scale,
                transition:   'transform 0.28s ease, box-shadow 0.28s ease',
                // ── Rage-click prevention: block pointer while locked ────
                cursor:        isLocked ? 'not-allowed' : 'pointer',
                pointerEvents: isLocked ? 'none'         : 'auto',
            }}
        >
            {/* ── Animation section ─────────────────────────────────── */}
            <div className="relative overflow-hidden" style={{ height: 310 }}>
                <CppExecCanvas />

                {/* Loading overlay on canvas — subtle dark veil while navigating */}
                {isActive && (
                    <div
                        aria-hidden="true"
                        style={{
                            position:   'absolute',
                            inset:      0,
                            background: isSuccess
                                ? 'rgba(46,204,138,0.06)'
                                : 'rgba(0,0,0,0.10)',
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
            6 Hours
          </span>
                </div>

                {/* Description */}
                <p
                    className="text-[15.5px] font-medium leading-[1.55] mb-4"
                    style={{ color: '#1e1a18' }}
                >
                    Learn C++ from scratch — variables, functions, memory management,
                    OOP, and how programs run at the hardware level.
                </p>

                {/* Level squares — wave-animated during load */}
                <div className="flex items-center gap-1 mb-4 flex-wrap">
                    <LevelSquaresLoading
                        state={state}
                        levelsFinished={levelsFinished}
                        totalLevels={totalLevels}
                    />
                    <span
                        className="text-[11px] font-semibold ml-1"
                        style={{ color: 'rgba(30,26,24,0.45)' }}
                    >
            {levelsFinished}/{totalLevels} levels
          </span>
                </div>

                {/* Arrow / Spinner / Checkmark button */}
                <div className="flex justify-end">
                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{
                            background: arrowBg,
                            transform:  isLoading ? 'none' : arrowShift,
                            transition: 'all 0.22s ease',
                        }}
                    >
                        {/* ── Icon morphs based on state ───────────────────── */}
                        {isLoading && (
                            <SpinnerIcon size={14} color="#1e1a18" />
                        )}
                        {isSuccess && (
                            <SuccessIcon size={14} color="#2ecc8a" />
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
