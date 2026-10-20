import React from 'react';
import * as k from '../../lib/isoKit.mjs';

/**
 * FileIOBufferRig
 * Authentic Anatomy mechanical apparatus demonstrating Python File Handling:
 * - File descriptor allocation from the OS (open() call)
 * - Sequential byte-buffer stream reading from disk
 * - UTF-8 text decoder converting raw bytes to Unicode string
 * - Context manager (with statement) closing file descriptor & flushing handles
 *
 * Object metaphor: An industrial tape-punch reader with a buffer spool,
 * a decode drum, and a file-descriptor registration panel.
 * "The tape reel is the file. The punch patterns are bytes.
 *  The decoder drum reads punches into characters. The FD panel tracks open handles."
 */

const WIDTH = 760;
const HEIGHT = 440;
const PLATE = { x: -148, y: -92, w: 296, d: 184, r: 8 };
const PLATE_H = 12;
const FOOT_H = 6;

// Tape reel (left) — the file on disk
const REEL_CX = -90;
const REEL_CY = -10;
const REEL_OUTER_R = 36;
const REEL_INNER_R = 12;
const REEL_Z = PLATE_H + 28;

// Tape reader head (center) — the buffer read head
const HEAD_X = -10;
const HEAD_Y = -10;
const HEAD_Z = PLATE_H;

// Decode drum (right) — UTF-8 decoder
const DRUM_CX = 72;
const DRUM_CY = -10;
const DRUM_R = 22;
const DRUM_H = 30;
const DRUM_Z = PLATE_H;

// FD Registration panel (far right)
const PANEL_X = 105;
const PANEL_Y = -38;
const PANEL_Z = PLATE_H;

const P = k.fitProjection(
  [
    ...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0),
    [REEL_CX - REEL_OUTER_R - 5, REEL_CY - REEL_OUTER_R, REEL_Z + 20],
    [PANEL_X + 40, PANEL_Y + 80, DRUM_Z + 60],
  ],
  WIDTH,
  HEIGHT,
  { pad: 36, azimuth: 44, elevation: 32 }
);

// 4 phases of file I/O
const PHASES = [
  { id: 'open',    label: 'open()',   telemetry: 'FD: 0x0003 · MODE: "r" · PATH [data.txt]', color: '#3b82f6' },
  { id: 'read',    label: 'read()',   telemetry: 'BUFFER: 1024 B · READ: 248 B · CACHED',    color: '#22c55e' },
  { id: 'decode',  label: 'decode()', telemetry: 'DECODE: UTF-8 · UNICODE: 14 lines',         color: '#f59e0b' },
  { id: 'close',   label: 'close()',  telemetry: 'FD: CLOSED · LEAK: 0 B · FLUSH [OK]',       color: '#a855f7' },
];

// Tape punch holes pattern — 8 "bytes" on the tape band
const TAPE_HOLES = [
  [1,0,1,1,0,1,0,1],
  [0,1,1,0,0,1,1,0],
  [1,1,0,0,1,0,1,1],
  [0,0,1,1,1,1,0,0],
  [1,0,0,1,0,1,1,0],
  [0,1,0,1,1,0,0,1],
];

export default function FileIOBufferRig({
  currentStep = 0,
  smoothStep = 0,
  smoothNeedle = 35,
  onSelectStep,
  theme = 'light',
}) {
  const at = (point) => k.iso(point, P);

  const phase = PHASES[currentStep % 4];
  const phaseIdx = currentStep % 4;

  const isDark = theme === 'dark';
  const fg = isDark ? '#e2e8f0' : '#1e293b';
  const fgMid = isDark ? '#94a3b8' : '#64748b';
  const fgFaint = isDark ? '#334155' : '#e2e8f0';
  const plateFill = isDark ? '#1e293b' : '#f8fafc';
  const plateSide = isDark ? '#0f172a' : '#cbd5e1';
  const plateEdge = isDark ? '#334155' : '#94a3b8';

  // Base plate
  const baseSlab = k.slabOf(PLATE.x, PLATE.y, 0, PLATE.w, PLATE.d, PLATE_H, PLATE.r, P);

  // Feet
  const feet = [
    [PLATE.x + 10, PLATE.y + 10],
    [PLATE.x + PLATE.w - 10, PLATE.y + 10],
    [PLATE.x + 10, PLATE.y + PLATE.d - 10],
    [PLATE.x + PLATE.w - 10, PLATE.y + PLATE.d - 10],
  ].map(([fx, fy], fi) => {
    const s = k.slabOf(fx - 4, fy - 4, -FOOT_H, 8, 8, FOOT_H, 1, P);
    return (
      <g key={fi}>
        {k.solidSvg(s.left, { fill: plateSide, stroke: plateEdge, strokeWidth: 0.5 })}
        {k.solidSvg(s.right, { fill: plateSide, stroke: plateEdge, strokeWidth: 0.5 })}
        {k.solidSvg(s.top, { fill: plateFill, stroke: plateEdge, strokeWidth: 0.5 })}
      </g>
    );
  });

  // Corner screws
  const screws = [
    [PLATE.x + 8, PLATE.y + 8], [PLATE.x + PLATE.w - 8, PLATE.y + 8],
    [PLATE.x + 8, PLATE.y + PLATE.d - 8], [PLATE.x + PLATE.w - 8, PLATE.y + PLATE.d - 8],
  ].map(([sx, sy], si) => {
    const sp = k.iso([sx, sy, PLATE_H + 0.5], P);
    return (
      <g key={si}>
        <circle cx={sp[0]} cy={sp[1]} r={3.5} fill={plateFill} stroke={plateSide} strokeWidth={0.7} />
        <circle cx={sp[0]} cy={sp[1]} r={1} fill={fgFaint} />
      </g>
    );
  });

  // === TAPE REEL (left) ===
  const reelCenter = at([REEL_CX, REEL_CY, REEL_Z]);
  const reelOuter = REEL_OUTER_R * P.scale * 0.95;
  const reelInner = REEL_INNER_R * P.scale * 0.95;
  // Animate reel rotation based on smoothStep
  const reelAngle = (smoothStep / 3) * 360;
  const isReelActive = phaseIdx === 0 || phaseIdx === 1;

  // === TAPE BAND from reel to reader head ===
  const tapeStart = at([REEL_CX + REEL_OUTER_R, REEL_CY, REEL_Z]);
  const tapeEnd = at([HEAD_X - 18, HEAD_Y, HEAD_Z + 20]);

  // === READER HEAD (center buffer block) ===
  const headSlab = k.slabOf(HEAD_X - 22, HEAD_Y - 20, HEAD_Z, 44, 40, 26, 3, P);
  const headLens = at([HEAD_X, HEAD_Y, HEAD_Z + 28]);
  const isReadActive = phaseIdx === 1;

  // === DECODE DRUM (cylinder) ===
  const drumTop = at([DRUM_CX, DRUM_CY, DRUM_Z + DRUM_H]);
  const drumCenter = at([DRUM_CX, DRUM_CY, DRUM_Z]);
  const drumScaledR = DRUM_R * P.scale * 0.95;
  const drumScaledH = DRUM_H * P.scale * 0.7;
  const isDecodeActive = phaseIdx === 2;

  // === FD PANEL (small right module) ===
  const panelSlab = k.slabOf(PANEL_X, PANEL_Y, PANEL_Z, 38, 76, 18, 3, P);
  const isFdActive = phaseIdx === 3;

  // Ruler ticks
  const rulerTicks = Array.from({ length: 9 }, (_, i) => {
    const wx = PLATE.x + 20 + i * 28;
    const tickBase = at([wx, PLATE.y + PLATE.d - 5, PLATE_H]);
    const tickTop = at([wx, PLATE.y + PLATE.d - 5, PLATE_H + (i % 4 === 0 ? 8 : 4)]);
    return (
      <line key={i} x1={tickBase[0]} y1={tickBase[1]} x2={tickTop[0]} y2={tickTop[1]}
        stroke={i % 4 === 0 ? fg : fgMid} strokeWidth={i % 4 === 0 ? 1 : 0.6} />
    );
  });

  // Step dots
  const stepDots = PHASES.map((ph, i) => {
    const dotPos = at([-50 + i * 32, PLATE.y + PLATE.d - 28, PLATE_H + 4]);
    const isActiveDot = i === phaseIdx;
    return (
      <g key={ph.id} onClick={() => onSelectStep?.(i)} style={{ cursor: 'pointer' }}>
        <circle cx={dotPos[0]} cy={dotPos[1]} r={isActiveDot ? 6 : 4}
          fill={isActiveDot ? ph.color : fgFaint}
          stroke={isActiveDot ? fg : fgMid} strokeWidth={0.8} />
        <text x={dotPos[0]} y={dotPos[1] + 11} textAnchor="middle"
          fontSize="6.5" fontFamily="monospace" fill={isActiveDot ? ph.color : fgMid}>
          {ph.label}
        </text>
      </g>
    );
  });

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      width="100%"
      height="100%"
      className="select-none"
      style={{ overflow: 'visible', background: 'transparent' }}
    >
      {/* 1. Feet */}
      {feet}

      {/* 2. Base plate back sides */}
      {k.solidSvg(baseSlab.left, { fill: plateSide, stroke: plateEdge, strokeWidth: 0.7 })}
      {k.solidSvg(baseSlab.right, { fill: plateSide, stroke: plateEdge, strokeWidth: 0.7 })}
      {k.solidSvg(baseSlab.top, { fill: plateFill, stroke: plateEdge, strokeWidth: 0.7 })}

      {/* 3. Ruler ticks */}
      {rulerTicks}

      {/* 4. Screws */}
      {screws}

      {/* === TAPE REEL === */}
      <g opacity={isReelActive ? 1 : 0.55}>
        {/* Reel outer disc */}
        <ellipse cx={reelCenter[0]} cy={reelCenter[1]}
          rx={reelOuter} ry={reelOuter * 0.45}
          fill={isDark ? '#1e293b' : '#e2e8f0'} stroke={isReelActive ? '#3b82f6' : plateEdge} strokeWidth={isReelActive ? 1.5 : 0.8} />
        {/* Reel spokes */}
        {Array.from({ length: 6 }, (_, i) => {
          const a = ((reelAngle + i * 60) * Math.PI) / 180;
          const rx1 = Math.cos(a) * reelInner * 1.1;
          const ry1 = Math.sin(a) * reelInner * 1.1 * 0.45;
          const rx2 = Math.cos(a) * reelOuter * 0.85;
          const ry2 = Math.sin(a) * reelOuter * 0.85 * 0.45;
          return (
            <line key={i}
              x1={reelCenter[0] + rx1} y1={reelCenter[1] + ry1}
              x2={reelCenter[0] + rx2} y2={reelCenter[1] + ry2}
              stroke={isReelActive ? '#3b82f6' : fgMid} strokeWidth={1.2} />
          );
        })}
        {/* Reel hub */}
        <ellipse cx={reelCenter[0]} cy={reelCenter[1]}
          rx={reelInner} ry={reelInner * 0.45}
          fill={isDark ? '#334155' : '#cbd5e1'} stroke={plateEdge} strokeWidth={0.7} />
        {/* Reel label */}
        <text x={reelCenter[0]} y={reelCenter[1] - reelOuter - 6} textAnchor="middle"
          fontSize="7.5" fontFamily="monospace" fontWeight="bold" fill={isReelActive ? '#3b82f6' : fgMid}>
          FILE SPOOL
        </text>
        <text x={reelCenter[0]} y={reelCenter[1] - reelOuter + 2} textAnchor="middle"
          fontSize="6.5" fontFamily="monospace" fill={fgMid}>
          data.txt · 248 B
        </text>

        {/* Tape punch holes on reel surface */}
        {TAPE_HOLES.map((row, ri) =>
          row.map((hole, ci) => {
            if (!hole) return null;
            const holeA = ((reelAngle + ri * 20 + ci * 8) * Math.PI) / 180;
            const hr = reelOuter * (0.55 + ci * 0.04);
            const hx = reelCenter[0] + Math.cos(holeA) * hr;
            const hy = reelCenter[1] + Math.sin(holeA) * hr * 0.45;
            return <circle key={`${ri}-${ci}`} cx={hx} cy={hy} r={1.5}
              fill={isDark ? '#0f172a' : '#94a3b8'} />;
          })
        )}
      </g>

      {/* === TAPE BAND connecting reel to reader === */}
      {(phaseIdx === 0 || phaseIdx === 1) && (
        <path
          d={`M ${tapeStart[0]} ${tapeStart[1]} Q ${(tapeStart[0] + tapeEnd[0]) / 2} ${tapeStart[1] - 10} ${tapeEnd[0]} ${tapeEnd[1]}`}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={3}
          strokeDasharray="6,3"
          opacity={0.7}
        />
      )}

      {/* === READER HEAD (buffer) === */}
      <g opacity={phaseIdx === 0 || phaseIdx === 1 ? 1 : 0.5}>
        {k.solidSvg(headSlab.left, { fill: plateSide, stroke: isReadActive ? '#22c55e' : plateEdge, strokeWidth: isReadActive ? 1.5 : 0.7 })}
        {k.solidSvg(headSlab.right, { fill: plateSide, stroke: isReadActive ? '#22c55e' : plateEdge, strokeWidth: isReadActive ? 1.5 : 0.7 })}
        {k.solidSvg(headSlab.top, { fill: isReadActive ? (isDark ? '#14532d' : '#f0fdf4') : plateFill, stroke: isReadActive ? '#22c55e' : plateEdge, strokeWidth: isReadActive ? 1.5 : 0.7 })}
        {/* Lens */}
        <circle cx={headLens[0]} cy={headLens[1]} r={8 * P.scale * 0.5}
          fill={isReadActive ? '#22c55e' : fgFaint}
          stroke={isReadActive ? '#16a34a' : plateEdge}
          strokeWidth={1} />
        {isReadActive && <circle cx={headLens[0]} cy={headLens[1]} r={13 * P.scale * 0.5}
          fill="none" stroke="#22c55e" strokeWidth={0.6} opacity={0.4} />}
        {/* Label */}
        <text x={headLens[0]} y={headLens[1] - 18} textAnchor="middle"
          fontSize="7.5" fontFamily="monospace" fontWeight="bold"
          fill={isReadActive ? '#22c55e' : fgMid}>READ HEAD</text>
        <text x={headLens[0]} y={headLens[1] - 10} textAnchor="middle"
          fontSize="6.5" fontFamily="monospace" fill={fgMid}>1024 B BUFFER</text>
      </g>

      {/* === DECODE DRUM === */}
      <g opacity={isDecodeActive ? 1 : 0.5}>
        {/* Drum body as ellipse stack */}
        <ellipse cx={drumCenter[0]} cy={drumCenter[1]}
          rx={drumScaledR} ry={drumScaledR * 0.42}
          fill={isDark ? '#1e293b' : '#f1f5f9'} stroke={isDecodeActive ? '#f59e0b' : plateEdge} strokeWidth={isDecodeActive ? 1.5 : 0.8} />
        {/* Drum cylinder side */}
        <rect
          x={drumCenter[0] - drumScaledR} y={drumCenter[1]}
          width={drumScaledR * 2} height={drumScaledH * 0.5}
          fill={isDark ? '#1e293b' : '#f1f5f9'} stroke={isDecodeActive ? '#f59e0b' : plateEdge} strokeWidth={isDecodeActive ? 1.5 : 0.8} />
        <ellipse cx={drumTop[0]} cy={drumTop[1]}
          rx={drumScaledR} ry={drumScaledR * 0.42}
          fill={isDecodeActive ? (isDark ? '#451a03' : '#fefce8') : plateFill}
          stroke={isDecodeActive ? '#f59e0b' : plateEdge} strokeWidth={isDecodeActive ? 1.5 : 0.8} />
        {/* UTF-8 label on drum face */}
        <text x={drumTop[0]} y={drumTop[1]} textAnchor="middle"
          dominantBaseline="middle" fontSize="8" fontFamily="monospace"
          fontWeight="bold" fill={isDecodeActive ? '#f59e0b' : fgMid}>UTF-8</text>
        <text x={drumTop[0]} y={drumCenter[1] + drumScaledH * 0.22} textAnchor="middle"
          fontSize="6.5" fontFamily="monospace" fill={fgMid}>DECODE DRUM</text>
        {/* Output connector wire */}
        {isDecodeActive && (() => {
          const wireFrom = at([DRUM_CX + DRUM_R + 2, DRUM_CY, DRUM_Z + DRUM_H / 2]);
          const wireTo = at([DRUM_CX + DRUM_R + 20, DRUM_CY, DRUM_Z + DRUM_H / 2]);
          return <>
            <line x1={wireFrom[0]} y1={wireFrom[1]} x2={wireTo[0]} y2={wireTo[1]}
              stroke="#f59e0b" strokeWidth={2} />
            <circle cx={wireTo[0]} cy={wireTo[1]} r={3} fill="#f59e0b" />
            <text x={wireTo[0] + 5} y={wireTo[1]} textAnchor="start" dominantBaseline="middle"
              fontSize="7.5" fontFamily="monospace" fill="#f59e0b">→ str</text>
          </>;
        })()}
      </g>

      {/* === FD REGISTRATION PANEL === */}
      <g opacity={isFdActive ? 1 : 0.5}>
        {k.solidSvg(panelSlab.left, { fill: plateSide, stroke: isFdActive ? '#a855f7' : plateEdge, strokeWidth: isFdActive ? 1.5 : 0.7 })}
        {k.solidSvg(panelSlab.right, { fill: plateSide, stroke: isFdActive ? '#a855f7' : plateEdge, strokeWidth: isFdActive ? 1.5 : 0.7 })}
        {k.solidSvg(panelSlab.top, { fill: isFdActive ? (isDark ? '#2e1065' : '#faf5ff') : plateFill, stroke: isFdActive ? '#a855f7' : plateEdge, strokeWidth: isFdActive ? 1.5 : 0.7 })}
        {/* FD slots */}
        {[0, 1, 2].map((slot) => {
          const slotPos = at([PANEL_X + 8, PANEL_Y + 12 + slot * 22, PANEL_Z + 18.5]);
          const isSlotClosed = isFdActive && slot === 0;
          return (
            <g key={slot}>
              <text x={slotPos[0]} y={slotPos[1]} textAnchor="start"
                fontSize="6.5" fontFamily="monospace"
                fill={isSlotClosed ? '#a855f7' : fgMid}>
                FD:{slot} {slot === 0 ? (isFdActive ? '[CLOSED]' : '[OPEN]') : '[—]'}
              </text>
              <circle cx={slotPos[0] - 6} cy={slotPos[1] - 1} r={2.5}
                fill={slot === 0 ? (isFdActive ? '#a855f7' : '#22c55e') : fgFaint} />
            </g>
          );
        })}
        <text x={at([PANEL_X + 19, PANEL_Y - 6, PANEL_Z + 19])[0]}
          y={at([PANEL_X + 19, PANEL_Y - 6, PANEL_Z + 19])[1]}
          textAnchor="middle" fontSize="7" fontFamily="monospace" fontWeight="bold"
          fill={isFdActive ? '#a855f7' : fgMid}>FD PANEL</text>
      </g>

      {/* Step dots & labels */}
      {stepDots}

      {/* Telemetry readout */}
      {(() => {
        const tPos = at([-70, PLATE.y + 5, PLATE_H + 1]);
        return (
          <text x={tPos[0]} y={tPos[1]} fontSize="7" fontFamily="monospace"
            fill={phase.color} letterSpacing="0.5">
            {phase.telemetry}
          </text>
        );
      })()}
    </svg>
  );
}
