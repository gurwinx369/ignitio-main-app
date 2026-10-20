import React from 'react';
import * as k from '../../lib/isoKit.mjs';

/**
 * LogicGateRig
 * Authentic Anatomy mechanical/electronic apparatus demonstrating Python operators:
 * - Arithmetic operators as an abacus/mechanical accumulator
 * - Comparison operators as a precision balance beam
 * - Logical operators AND/OR/NOT as electromechanical relay gate panel
 *
 * Anatomy standard: heavy base, rail-mounted modules, dial gauges, engraved labels.
 * Concept: Operators take operands in → compute → yield a typed result.
 */

const WIDTH = 760;
const HEIGHT = 440;
const PLATE = { x: -150, y: -95, w: 300, d: 190, r: 8 };
const PLATE_H = 12;
const FOOT_H = 6;

// Three gate modules positioned L → R on base plate
const GATES = [
  {
    id: 'and',
    label: 'AND',
    symbol: '&',
    opA: 'True',
    opB: 'False',
    result: 'False',
    color: '#22c55e',   // green
    cx: -80,
    cy: -20,
  },
  {
    id: 'or',
    label: 'OR',
    symbol: '|',
    opA: 'False',
    opB: 'True',
    result: 'True',
    color: '#3b82f6',   // blue
    cx: 0,
    cy: -20,
  },
  {
    id: 'not',
    label: 'NOT',
    symbol: '~',
    opA: 'True',
    opB: null,
    result: 'False',
    color: '#f59e0b',   // amber
    cx: 80,
    cy: -20,
  },
];

const DIAL = [120, -30];
const DIAL_R = 22;
const DIAL_Z = 54;

const P = k.fitProjection(
  [
    ...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0),
    [-130, -70, 50],
    [130, 70, 50],
    [DIAL[0] - DIAL_R, DIAL[1] - DIAL_R, DIAL_Z + 20],
    [DIAL[0] + DIAL_R, DIAL[1] + DIAL_R, DIAL_Z + 20],
  ],
  WIDTH,
  HEIGHT,
  { pad: 36, azimuth: 44, elevation: 32 }
);

// Steps: 0=AND gate active, 1=OR gate active, 2=NOT gate active, 3=combined expression
const PHASE_LABELS = [
  'AND gate: both inputs must be True',
  'OR gate: either input must be True',
  'NOT gate: inverts a single boolean',
  'Combined: not (True and False) or True',
];

export default function LogicGateRig({
  currentStep = 0,
  smoothStep = 0,
  smoothNeedle = 35,
  onSelectStep,
  theme = 'light',
}) {
  const at = (point) => k.iso(point, P);
  const S = (paths, style) => k.solidSvg(paths, style);
  const L = (d, style) => k.lineSvg(d, style);
  const D = (points, style) => k.dotsSvg(points, style);

  const activeIdx = currentStep % 4;
  const activeGate = activeIdx < 3 ? GATES[activeIdx] : null;

  // Needle sweep: AND=90°, OR=180°, NOT=270°, combined=45°
  const needleAngles = [90, 180, 270, 45];
  const needleDeg = needleAngles[activeIdx];
  const needleRad = ((needleDeg - 90) * Math.PI) / 180;

  const isDark = theme === 'dark';
  const fg = isDark ? '#e2e8f0' : '#1e293b';
  const fgMid = isDark ? '#94a3b8' : '#64748b';
  const fgFaint = isDark ? '#334155' : '#e2e8f0';
  const plateFill = isDark ? '#1e293b' : '#f8fafc';
  const plateSide = isDark ? '#0f172a' : '#cbd5e1';
  const plateEdge = isDark ? '#334155' : '#94a3b8';

  // --- Base plate paths ---
  const baseTop = k.solidSvg(
    k.slabOf(PLATE.x, PLATE.y, 0, PLATE.w, PLATE.d, PLATE_H, PLATE.r, P).top,
    { fill: plateFill, stroke: plateEdge, strokeWidth: 0.7, opacity: 1 }
  );
  const baseLeft = k.solidSvg(
    k.slabOf(PLATE.x, PLATE.y, 0, PLATE.w, PLATE.d, PLATE_H, PLATE.r, P).left,
    { fill: plateSide, stroke: plateEdge, strokeWidth: 0.7, opacity: 1 }
  );
  const baseRight = k.solidSvg(
    k.slabOf(PLATE.x, PLATE.y, 0, PLATE.w, PLATE.d, PLATE_H, PLATE.r, P).right,
    { fill: plateSide, stroke: plateEdge, strokeWidth: 0.7, opacity: 1 }
  );

  // Feet (four corner posts)
  const feet = [
    [PLATE.x + 10, PLATE.y + 10],
    [PLATE.x + PLATE.w - 10, PLATE.y + 10],
    [PLATE.x + 10, PLATE.y + PLATE.d - 10],
    [PLATE.x + PLATE.w - 10, PLATE.y + PLATE.d - 10],
  ].map(([fx, fy]) => {
    const slab = k.slabOf(fx - 4, fy - 4, -FOOT_H, 8, 8, FOOT_H, 1, P);
    return (
      <>
        {k.solidSvg(slab.left, { fill: plateSide, stroke: plateEdge, strokeWidth: 0.5 })}
        {k.solidSvg(slab.right, { fill: plateSide, stroke: plateEdge, strokeWidth: 0.5 })}
        {k.solidSvg(slab.top, { fill: plateFill, stroke: plateEdge, strokeWidth: 0.5 })}
      </>
    );
  });

  // --- Gate module boxes (3 relay housings) ---
  const gateBoxes = GATES.map((gate, gi) => {
    const isActive = activeGate?.id === gate.id;
    const bw = 48, bd = 52, bh = 32;
    const slab = k.slabOf(gate.cx - bw / 2, gate.cy - bd / 2, PLATE_H, bw, bd, bh, 3, P);
    const gFill = isActive ? (isDark ? '#1e3a5f' : '#eff6ff') : (isDark ? '#1e293b' : '#f1f5f9');
    const gSide = isActive ? (isDark ? '#1e2d4a' : '#dbeafe') : (isDark ? '#0f172a' : '#e2e8f0');
    const gEdge = isActive ? (isDark ? '#3b82f6' : '#3b82f6') : (isDark ? '#334155' : '#94a3b8');
    return (
      <g key={gate.id}>
        {k.solidSvg(slab.left, { fill: gSide, stroke: gEdge, strokeWidth: isActive ? 1.2 : 0.6 })}
        {k.solidSvg(slab.right, { fill: gSide, stroke: gEdge, strokeWidth: isActive ? 1.2 : 0.6 })}
        {k.solidSvg(slab.top, { fill: gFill, stroke: gEdge, strokeWidth: isActive ? 1.2 : 0.6 })}

        {/* Gate symbol engraved on top face */}
        {(() => {
          const topCenter = k.iso([gate.cx, gate.cy, PLATE_H + bh + 1], P);
          return (
            <text
              x={topCenter[0]}
              y={topCenter[1]}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="11"
              fontFamily="monospace"
              fontWeight="bold"
              fill={isActive ? gate.color : fgMid}
            >
              {gate.label}
            </text>
          );
        })()}

        {/* LED indicator dot on top */}
        {(() => {
          const ledPos = k.iso([gate.cx + 12, gate.cy - 14, PLATE_H + bh + 2], P);
          return (
            <>
              <circle cx={ledPos[0]} cy={ledPos[1]} r="4" fill={isActive ? gate.color : fgFaint} />
              {isActive && <circle cx={ledPos[0]} cy={ledPos[1]} r="7" fill={gate.color} opacity="0.25" />}
            </>
          );
        })()}

        {/* Input label wires on left side */}
        {(() => {
          const wireA = k.iso([gate.cx - bw / 2 - 2, gate.cy - 8, PLATE_H + bh / 2 + 6], P);
          const wireEnd = k.iso([gate.cx - bw / 2 - 18, gate.cy - 8, PLATE_H + bh / 2 + 6], P);
          const wireB = gate.opB !== null ? k.iso([gate.cx - bw / 2 - 2, gate.cy + 8, PLATE_H + bh / 2 + 2], P) : null;
          const wireBEnd = gate.opB !== null ? k.iso([gate.cx - bw / 2 - 18, gate.cy + 8, PLATE_H + bh / 2 + 2], P) : null;
          return (
            <g opacity={isActive ? 1 : 0.4}>
              <line x1={wireA[0]} y1={wireA[1]} x2={wireEnd[0]} y2={wireEnd[1]}
                stroke={isActive ? gate.color : fgMid} strokeWidth={isActive ? 1.5 : 0.8} strokeDasharray={isActive ? 'none' : '3,2'} />
              <text x={wireEnd[0] - 3} y={wireEnd[1]} textAnchor="end" dominantBaseline="middle"
                fontSize="7.5" fontFamily="monospace" fill={fgMid}>{gate.opA}</text>
              {wireB && <>
                <line x1={wireB[0]} y1={wireB[1]} x2={wireBEnd[0]} y2={wireBEnd[1]}
                  stroke={isActive ? gate.color : fgMid} strokeWidth={isActive ? 1.5 : 0.8} strokeDasharray={isActive ? 'none' : '3,2'} />
                <text x={wireBEnd[0] - 3} y={wireBEnd[1]} textAnchor="end" dominantBaseline="middle"
                  fontSize="7.5" fontFamily="monospace" fill={fgMid}>{gate.opB}</text>
              </>}
            </g>
          );
        })()}

        {/* Result wire on right side */}
        {(() => {
          const wireOut = k.iso([gate.cx + bw / 2 + 2, gate.cy, PLATE_H + bh / 2 + 4], P);
          const wireOutEnd = k.iso([gate.cx + bw / 2 + 18, gate.cy, PLATE_H + bh / 2 + 4], P);
          return (
            <g opacity={isActive ? 1 : 0.4}>
              <line x1={wireOut[0]} y1={wireOut[1]} x2={wireOutEnd[0]} y2={wireOutEnd[1]}
                stroke={isActive ? gate.color : fgMid} strokeWidth={isActive ? 2 : 0.8} />
              <circle cx={wireOutEnd[0]} cy={wireOutEnd[1]} r="3" fill={isActive ? gate.color : fgMid} />
              <text x={wireOutEnd[0] + 5} y={wireOutEnd[1]} textAnchor="start" dominantBaseline="middle"
                fontSize="8" fontFamily="monospace" fontWeight="bold"
                fill={isActive ? gate.color : fgMid}>{gate.result}</text>
            </g>
          );
        })()}
      </g>
    );
  });

  // --- Dial gauge (truth evaluator) ---
  const dialCenter = k.iso([DIAL[0], DIAL[1], DIAL_Z], P);
  const dialOuterR = DIAL_R * P.scale * 0.9;
  const dialInnerR = dialOuterR * 0.82;
  const needleLen = dialInnerR * 0.82;
  const needleX = dialCenter[0] + Math.cos(needleRad) * needleLen;
  const needleY = dialCenter[1] + Math.sin(needleRad) * needleLen;

  // --- Label plate ---
  const labelPos = k.iso([-140, 70, PLATE_H + 2], P);

  // --- Ruler ticks along front edge ---
  const rulerTicks = Array.from({ length: 11 }, (_, i) => {
    const wx = PLATE.x + 20 + i * 24;
    const tickBase = k.iso([wx, PLATE.y + PLATE.d - 5, PLATE_H], P);
    const tickTop = k.iso([wx, PLATE.y + PLATE.d - 5, PLATE_H + (i % 5 === 0 ? 8 : 4)], P);
    return (
      <line key={i} x1={tickBase[0]} y1={tickBase[1]} x2={tickTop[0]} y2={tickTop[1]}
        stroke={i % 5 === 0 ? fg : fgMid} strokeWidth={i % 5 === 0 ? 1 : 0.6} />
    );
  });

  // -- Corner screws --
  const cornerScrews = [
    [PLATE.x + 8, PLATE.y + 8],
    [PLATE.x + PLATE.w - 8, PLATE.y + 8],
    [PLATE.x + 8, PLATE.y + PLATE.d - 8],
    [PLATE.x + PLATE.w - 8, PLATE.y + PLATE.d - 8],
  ].map(([sx, sy]) => {
    const sp = k.iso([sx, sy, PLATE_H + 0.5], P);
    return (
      <>
        <circle cx={sp[0]} cy={sp[1]} r={3.5} fill={plateFill} stroke={plateSide} strokeWidth={0.7} />
        <circle cx={sp[0]} cy={sp[1]} r={1} fill={fgFaint} />
      </>
    );
  });

  // Clickable step buttons beneath the rig
  const stepDots = Array.from({ length: 4 }, (_, i) => {
    const dotPos = k.iso([-55 + i * 36, PLATE.y + PLATE.d - 30, PLATE_H + 4], P);
    const isActiveDot = i === activeIdx;
    return (
      <g key={i} onClick={() => onSelectStep?.(i)} style={{ cursor: 'pointer' }}>
        <circle cx={dotPos[0]} cy={dotPos[1]} r={isActiveDot ? 6 : 4}
          fill={isActiveDot ? GATES[Math.min(i, 2)]?.color || '#3b82f6' : fgFaint}
          stroke={isActiveDot ? fg : fgMid} strokeWidth={0.8} />
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

      {/* 2. Base plate */}
      {baseLeft}
      {baseRight}
      {baseTop}

      {/* 3. Ruler ticks */}
      {rulerTicks}

      {/* 4. Corner screws */}
      {cornerScrews}

      {/* 5. Gate modules */}
      {gateBoxes}

      {/* 6. Dial gauge — truth evaluator */}
      <g>
        <circle cx={dialCenter[0]} cy={dialCenter[1]} r={dialOuterR}
          fill={isDark ? '#0f172a' : '#f8fafc'} stroke={isDark ? '#334155' : '#94a3b8'} strokeWidth={1.2} />
        <circle cx={dialCenter[0]} cy={dialCenter[1]} r={dialInnerR}
          fill={isDark ? '#1e293b' : '#fff'} stroke={isDark ? '#475569' : '#cbd5e1'} strokeWidth={0.6} />
        {/* Tick marks */}
        {Array.from({ length: 8 }, (_, i) => {
          const a = ((i / 8) * 360 - 90) * Math.PI / 180;
          const r0 = dialInnerR * 0.85;
          const r1 = dialInnerR * (i % 2 === 0 ? 0.95 : 0.9);
          return (
            <line key={i}
              x1={dialCenter[0] + Math.cos(a) * r0} y1={dialCenter[1] + Math.sin(a) * r0}
              x2={dialCenter[0] + Math.cos(a) * r1} y2={dialCenter[1] + Math.sin(a) * r1}
              stroke={fgMid} strokeWidth={i % 2 === 0 ? 1 : 0.6} />
          );
        })}
        {/* Needle */}
        <line
          x1={dialCenter[0]} y1={dialCenter[1]}
          x2={needleX} y2={needleY}
          stroke={activeGate?.color || '#3b82f6'}
          strokeWidth={2}
          strokeLinecap="round"
        />
        <circle cx={dialCenter[0]} cy={dialCenter[1]} r={3} fill={fg} />
        {/* Labels */}
        <text x={dialCenter[0]} y={dialCenter[1] - dialOuterR - 5} textAnchor="middle"
          fontSize="7" fontFamily="monospace" fill={fgMid}>BOOL EVAL</text>
      </g>

      {/* 7. Label plate */}
      <text x={labelPos[0]} y={labelPos[1] - 6} fontSize="7.5" fontFamily="monospace"
        fontWeight="bold" fill={fgMid} letterSpacing="1">LOGIC GATE RIG · REV A</text>
      <text x={labelPos[0]} y={labelPos[1] + 4} fontSize="7" fontFamily="monospace"
        fill={fgFaint}>OPERATOR TRUTH EVALUATOR</text>

      {/* 8. Step dots */}
      {stepDots}

      {/* 9. Phase readout */}
      {(() => {
        const readoutPos = k.iso([DIAL[0], DIAL[1] + 28, DIAL_Z - 14], P);
        return (
          <text x={readoutPos[0]} y={readoutPos[1]} textAnchor="middle"
            fontSize="7.5" fontFamily="monospace" fill={activeGate?.color || fg}>
            {activeIdx < 3 ? `→ ${GATES[activeIdx].result}` : '→ True'}
          </text>
        );
      })()}
    </svg>
  );
}
