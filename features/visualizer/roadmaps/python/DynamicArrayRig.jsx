import React from 'react';
import * as k from '../../lib/isoKit.mjs';

/**
 * DynamicArrayRig
 * Authentic Anatomy mechanical apparatus demonstrating:
 * - Python list memory structure: over-allocated contiguous pointer array in heap.
 * - In-place mutation (re-assigning pointer without creating new list container).
 * - Tail append and pop mechanical operations.
 */
const WIDTH = 760;
const HEIGHT = 440;
const PLATE = { x: -140, y: -90, w: 280, d: 180, r: 8 };
const PLATE_H = 12;
const FOOT_H = 5;

const SLOTS = [
  { idx: 0, val: "'apple'", addr: '0x7A10', type: 'str', x: -65, isAllocated: true },
  { idx: 1, val: "'banana'", addr: '0x7A18', type: 'str', x: -25, isAllocated: true },
  { idx: 2, val: "'cherry'", addr: '0x7A20', type: 'str', x: 15, isAllocated: true },
  { idx: 3, val: '[free]', addr: '0x0000', type: 'null', x: 55, isAllocated: false },
];

const DIAL = [105, -20];
const DIAL_R = 24;
const DIAL_Z = 58;

const P = k.fitProjection(
  [
    ...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0),
    [-100, -50, 45],
    [100, 50, 45],
    [DIAL[0] - DIAL_R, DIAL[1] - DIAL_R, DIAL_Z + 20],
    [DIAL[0] + DIAL_R, DIAL[1] + DIAL_R, DIAL_Z + 20],
  ],
  WIDTH,
  HEIGHT,
  { pad: 36, azimuth: 44, elevation: 32 }
);

export default function DynamicArrayRig({
  currentStep = 0,
  smoothStep = 0,
  smoothNeedle = 35,
  onSelectStep,
  theme = "light",
}) {
  const at = (point) => k.iso(point, P);
  const S = (paths, style) => k.solidSvg(paths, style);
  const L = (d, style) => k.lineSvg(d, style);
  const D = (points, style) => k.dotsSvg(points, style);
  const byDepth = (points) => [...points].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));

  const activeSlotIdx = currentStep % SLOTS.length;

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="iso-svg select-none"
      style={{ overflow: 'visible' }}
    >
      {/* ── 1. Bedplate Assembly ── */}
      <g className="bedplate-assembly">
        <path className="iso-halo" d={k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)} />

        {byDepth(k.corners(PLATE, 20)).map(([fx, fy], idx) => (
          <g key={`foot-${idx}`}>
            <g dangerouslySetInnerHTML={{ __html: S(k.cylinder(fx, fy, 8, -PLATE_H - FOOT_H, 2, P, 24), { tone: "lo" }) }} />
            <g dangerouslySetInnerHTML={{ __html: S(k.cylinder(fx, fy, 6, -PLATE_H - FOOT_H + 2, FOOT_H - 2, P, 24), { tone: "mid" }) }} />
          </g>
        ))}

        <g dangerouslySetInnerHTML={{ __html: S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.8), { tone: "mid" }) }} />
        <g dangerouslySetInnerHTML={{ __html: L(k.planOutline(k.insetPlan(PLATE, 6), 0, P), { tone: "lo" }) }} />

        {(() => {
          const screws = k.corners(PLATE, 12);
          return (
            <g>
              <g dangerouslySetInnerHTML={{ __html: L(screws.map(([sx, sy]) => k.ring(sx, sy, 2.5, 0, P, 16)).join(""), { tone: "lo" }) }} />
              <g dangerouslySetInnerHTML={{ __html: D(screws.map(([sx, sy]) => at([sx, sy, 0])), { size: 0.5, tone: "hi" }) }} />
            </g>
          );
        })()}
      </g>

      {/* ── 2. List Header Gantry (PyListObject ob_size & allocated) ── */}
      {(() => {
        const headerPlan = { x: -85, y: -65, w: 160, d: 20, r: 3 };
        return (
          <g className="list-header-chassis">
            <g dangerouslySetInnerHTML={{ __html: S(k.slabOf(headerPlan, 0, 10, P, 4, 0.8), { tone: "mid" }) }} />
            <text
              x={at([0, -55, 10])[0]}
              y={at([0, -55, 10])[1]}
              textAnchor="middle"
              fontSize="5.5"
              fontWeight="800"
              fill="var(--anatomy-strong)"
              fontFamily="var(--anatomy-mono)"
            >
              PyListObject · ob_size=3 · allocated=4
            </text>
          </g>
        );
      })()}

      {/* ── 3. Four Pointer Array Cassettes ── */}
      <g className="slots-assembly">
        {SLOTS.map((s, idx) => {
          const isSelected = idx === activeSlotIdx;
          const sz = isSelected ? 12 : 0;
          const plan = { x: s.x - 16, y: -15, w: 32, d: 42, r: 3 };

          return (
            <g
              key={s.idx}
              onClick={() => onSelectStep?.(idx)}
              className="cursor-pointer transition-all duration-300"
            >
              <g dangerouslySetInnerHTML={{ __html: L(k.planOutline(plan, 0, P), { tone: "faint" }) }} />
              <g dangerouslySetInnerHTML={{ __html: S(k.slabOf(plan, sz, 14, P, 4, 0.8), { tone: isSelected ? "lit" : s.isAllocated ? "mid" : "lo" }) }} />

              {/* Bushing & Value */}
              <circle
                cx={at([s.x, 6, sz + 14])[0]}
                cy={at([s.x, 6, sz + 14])[1]}
                r={isSelected ? "4.5" : "3.5"}
                fill={isSelected ? "var(--anatomy-red)" : s.isAllocated ? "var(--anatomy-card)" : "var(--anatomy-faint)"}
                stroke="var(--anatomy-hi)"
                strokeWidth="0.8"
              />

              <text
                x={at([s.x, 6, sz + 14])[0]}
                y={at([s.x, 6, sz + 14])[1] + 2}
                textAnchor="middle"
                fontSize="5"
                fontWeight="800"
                fill={isSelected ? "#ffffff" : "var(--anatomy-text)"}
                fontFamily="var(--anatomy-mono)"
              >
                {s.val}
              </text>

              {/* Index label */}
              <text
                x={at([s.x, -5, sz + 14])[0]}
                y={at([s.x, -5, sz + 14])[1]}
                textAnchor="middle"
                fontSize="5"
                fontWeight="700"
                fill="var(--anatomy-muted)"
                fontFamily="var(--anatomy-mono)"
              >
                [{s.idx}]
              </text>
            </g>
          );
        })}
      </g>

      {/* ── 4. Precision Dial Gauge ── */}
      <g className="dial-indicator-assembly">
        {(() => {
          const magPlan = { x: DIAL[0] - 14, y: DIAL[1] - 14, w: 28, d: 28, r: 3 };
          return (
            <g>
              <g dangerouslySetInnerHTML={{ __html: S(k.slabOf(magPlan, 0, 16, P, 4, 0.8), { tone: "mid" }) }} />
              <g dangerouslySetInnerHTML={{ __html: S(k.cylinder(magPlan.x + 20, magPlan.y + 20, 4, 16, 3, P, 20), { tone: "mid" }) }} />
            </g>
          );
        })()}

        {(() => {
          const postX = DIAL[0] - 6;
          const postY = DIAL[1];
          return (
            <g>
              <g dangerouslySetInnerHTML={{ __html: S(k.cylinder(postX, postY, 2.8, 16, DIAL_Z - 16, P, 20), { tone: "mid", crease: "none" }) }} />
              <g dangerouslySetInnerHTML={{ __html: S(k.slabOf({ x: postX, y: postY - 3, w: 12, d: 6, r: 1.5 }, DIAL_Z, 3, P, 2), { tone: "mid" }) }} />
            </g>
          );
        })()}

        {(() => {
          const dialCenter = at([DIAL[0], DIAL[1], DIAL_Z]);
          const rad = (smoothNeedle * Math.PI) / 180;
          const needleLen = DIAL_R - 5;
          const tipX = dialCenter[0] + Math.cos(rad) * needleLen * 0.95;
          const tipY = dialCenter[1] + Math.sin(rad) * needleLen * 0.58;

          return (
            <g className="dial-face">
              <g dangerouslySetInnerHTML={{ __html: S(k.cylinder(DIAL[0], DIAL[1], DIAL_R, DIAL_Z, 8, P, 32), { tone: "mid" }) }} />
              <g dangerouslySetInnerHTML={{ __html: L(k.ring(DIAL[0], DIAL[1], DIAL_R - 3, DIAL_Z + 8, P, 32), { tone: "lo" }) }} />

              <line
                x1={dialCenter[0]}
                y1={dialCenter[1]}
                x2={tipX}
                y2={tipY}
                stroke="var(--anatomy-lit)"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              <circle cx={dialCenter[0]} cy={dialCenter[1]} r="2" fill="var(--anatomy-hi)" />

              <text
                x={dialCenter[0]}
                y={dialCenter[1] + 12}
                textAnchor="middle"
                fontSize="6"
                fontWeight="bold"
                fill="var(--anatomy-muted)"
                fontFamily="var(--anatomy-mono)"
              >
                CAPACITY: 4
              </text>
              <text
                x={dialCenter[0]}
                y={dialCenter[1] - 8}
                textAnchor="middle"
                fontSize="6.5"
                fontWeight="800"
                fill="var(--anatomy-strong)"
                fontFamily="var(--anatomy-mono)"
              >
                SLOT [{activeSlotIdx}]
              </text>
            </g>
          );
        })()}
      </g>
    </svg>
  );
}
