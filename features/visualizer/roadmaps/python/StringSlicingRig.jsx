import React from 'react';
import * as k from '../../lib/isoKit.mjs';

/**
 * StringSlicingRig
 * Authentic Anatomy mechanical apparatus demonstrating:
 * - Python string memory layout: contiguous frozen character cells in heap.
 * - Dual vernier caliper measuring slice bounds [start:stop].
 * - Negative indexing reverse-offset pointer.
 */
const WIDTH = 760;
const HEIGHT = 440;
const PLATE = { x: -140, y: -90, w: 280, d: 180, r: 8 };
const PLATE_H = 12;
const FOOT_H = 5;

// The string characters: "P", "y", "t", "h", "o", "n"
const CHARS = [
  { char: "'P'", idx: 0, negIdx: -6, x: -75 },
  { char: "'y'", idx: 1, negIdx: -5, x: -45 },
  { char: "'t'", idx: 2, negIdx: -4, x: -15 },
  { char: "'h'", idx: 3, negIdx: -3, x: 15 },
  { char: "'o'", idx: 4, negIdx: -2, x: 45 },
  { char: "'n'", idx: 5, negIdx: -1, x: 75 },
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

export default function StringSlicingRig({
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

  // Slicing phase states:
  // Phase 0: s[0] -> 'P'
  // Phase 1: s[2] -> 't'
  // Phase 2: s[-1] -> 'n'
  // Phase 3: s[1:4] -> "yth" (Slice window active!)
  const isSliceActive = currentStep === 3;
  const activeCharIdx = currentStep === 0 ? 0 : currentStep === 1 ? 2 : currentStep === 2 ? 5 : null;

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="iso-svg select-none"
      style={{ overflow: 'visible' }}
    >
      {/* ── 1. Heavy Machined Cast-Iron Bedplate ── */}
      <g className="bedplate-assembly">
        <path className="iso-halo" d={k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)} />

        {/* 4 Turned Leveling Feet */}
        {byDepth(k.corners(PLATE, 20)).map(([fx, fy], idx) => (
          <g key={`foot-${idx}`}>
            <g dangerouslySetInnerHTML={{ __html: S(k.cylinder(fx, fy, 8, -PLATE_H - FOOT_H, 2, P, 24), { tone: "lo" }) }} />
            <g dangerouslySetInnerHTML={{ __html: S(k.cylinder(fx, fy, 6, -PLATE_H - FOOT_H + 2, FOOT_H - 2, P, 24), { tone: "mid" }) }} />
          </g>
        ))}

        {/* Heavy Machined Bedplate Slab */}
        <g dangerouslySetInnerHTML={{ __html: S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.8), { tone: "mid" }) }} />

        {/* Inset Milled Oil Perimeter Groove */}
        <g dangerouslySetInnerHTML={{ __html: L(k.planOutline(k.insetPlan(PLATE, 6), 0, P), { tone: "lo" }) }} />

        {/* 4 Counterbored Corner Screws */}
        {(() => {
          const screws = k.corners(PLATE, 12);
          return (
            <g>
              <g dangerouslySetInnerHTML={{ __html: L(screws.map(([sx, sy]) => k.ring(sx, sy, 2.5, 0, P, 16)).join(""), { tone: "lo" }) }} />
              <g dangerouslySetInnerHTML={{ __html: D(screws.map(([sx, sy]) => at([sx, sy, 0])), { size: 0.5, tone: "hi" }) }} />
            </g>
          );
        })()}

        {/* Metric Vernier Calibration Strip */}
        {(() => {
          const strip = { x: -125, y: PLATE.y + PLATE.d - 16, w: 250, d: 8, r: 1.5 };
          const ticks = k.topTicks(strip.x + 4, strip.x + strip.w - 4, 4, 5, strip.y + 1, 0.6, [2, 3.8], P);
          return (
            <g className="vernier-strip">
              <g dangerouslySetInnerHTML={{ __html: S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }) }} />
              <g dangerouslySetInnerHTML={{ __html: L(ticks.minor, { tone: "lo" }) }} />
              <g dangerouslySetInnerHTML={{ __html: L(ticks.major, { tone: "mid" }) }} />
            </g>
          );
        })()}
      </g>

      {/* ── 2. Contiguous Character Array Cells (String Memory Buffer) ── */}
      <g className="character-buffer-assembly">
        {CHARS.map((item, idx) => {
          const isSelected = isSliceActive ? (idx >= 1 && idx <= 3) : idx === activeCharIdx;
          const cz = isSelected ? 12 : 0;
          const plan = { x: item.x - 12, y: -25, w: 24, d: 48, r: 3 };

          return (
            <g
              key={item.idx}
              onClick={() => onSelectStep?.(idx === 0 ? 0 : idx === 2 ? 1 : idx === 5 ? 2 : 3)}
              className="cursor-pointer transition-all duration-300"
            >
              {/* Recessed footprint well */}
              <g dangerouslySetInnerHTML={{ __html: L(k.planOutline(plan, 0, P), { tone: "faint" }) }} />

              {/* Character Slab Block */}
              <g dangerouslySetInnerHTML={{ __html: S(k.slabOf(plan, cz, 14, P, 4, 0.8), { tone: isSelected ? "lit" : "mid" }) }} />

              {/* Central Ruby Jewel Chaton & Character Symbol */}
              <g dangerouslySetInnerHTML={{ __html: L(k.ring(item.x, -1, cz + 14, P, 16), { tone: isSelected ? "lit" : "lo" }) }} />
              <circle
                cx={at([item.x, -1, cz + 14])[0]}
                cy={at([item.x, -1, cz + 14])[1]}
                r={isSelected ? "5.5" : "4.5"}
                fill={isSelected ? "var(--anatomy-red)" : "var(--anatomy-card)"}
                stroke="var(--anatomy-hi)"
                strokeWidth="0.8"
              />
              <text
                x={at([item.x, -1, cz + 14])[0]}
                y={at([item.x, -1, cz + 14])[1] + 2.5}
                textAnchor="middle"
                fontSize="6"
                fontWeight="800"
                fill={isSelected ? "#ffffff" : "var(--anatomy-text)"}
                fontFamily="var(--anatomy-mono)"
              >
                {item.char}
              </text>

              {/* Forward Index Badge [+0, +1, +2, +3, +4, +5] on top */}
              <text
                x={at([item.x, -16, cz + 14])[0]}
                y={at([item.x, -16, cz + 14])[1]}
                textAnchor="middle"
                fontSize="5"
                fontWeight="700"
                fill="var(--anatomy-muted)"
                fontFamily="var(--anatomy-mono)"
              >
                [{item.idx}]
              </text>

              {/* Negative Reverse Index Badge [-6, -5, -4, -3, -2, -1] on bottom */}
              <text
                x={at([item.x, 15, cz + 14])[0]}
                y={at([item.x, 15, cz + 14])[1]}
                textAnchor="middle"
                fontSize="4.5"
                fontWeight="600"
                fill="var(--anatomy-lo)"
                fontFamily="var(--anatomy-mono)"
              >
                {item.negIdx}
              </text>
            </g>
          );
        })}
      </g>

      {/* ── 3. Dual Vernier Slicing Caliper Jaw ── */}
      {isSliceActive && (
        <g className="vernier-slice-jaws animate-in fade-in duration-300">
          {/* Caliper guide rail spanning from index 1 to 4 */}
          {(() => {
            const startX = CHARS[1].x - 12;
            const endX = CHARS[3].x + 12;
            const jawY = -28;
            const jawZ = 30;
            return (
              <g>
                <line
                  x1={at([startX, jawY, jawZ])[0]}
                  y1={at([startX, jawY, jawZ])[1]}
                  x2={at([endX, jawY, jawZ])[0]}
                  y2={at([endX, jawY, jawZ])[1]}
                  stroke="var(--anatomy-lit)"
                  strokeWidth="1.5"
                />
                {/* Left Jaw at start index 1 */}
                <circle cx={at([startX, jawY, jawZ])[0]} cy={at([startX, jawY, jawZ])[1]} r="3" fill="var(--anatomy-hi)" />
                {/* Right Jaw at stop index 4 */}
                <circle cx={at([endX, jawY, jawZ])[0]} cy={at([endX, jawY, jawZ])[1]} r="3" fill="var(--anatomy-hi)" />
                {/* Slice Tag Badge */}
                <rect
                  x={at([(startX + endX) / 2, jawY - 8, jawZ + 6])[0] - 22}
                  y={at([(startX + endX) / 2, jawY - 8, jawZ + 6])[1] - 6}
                  width="44"
                  height="12"
                  rx="2"
                  fill="var(--anatomy-card)"
                  stroke="var(--anatomy-lit)"
                  strokeWidth="1"
                />
                <text
                  x={at([(startX + endX) / 2, jawY - 8, jawZ + 6])[0]}
                  y={at([(startX + endX) / 2, jawY - 8, jawZ + 6])[1] + 2.5}
                  textAnchor="middle"
                  fontSize="6"
                  fontWeight="800"
                  fill="var(--anatomy-strong)"
                  fontFamily="var(--anatomy-mono)"
                >
                  s[1:4] → &quot;yth&quot;
                </text>
              </g>
            );
          })()}
        </g>
      )}

      {/* ── 4. Precision Dial Gauge Meter ── */}
      <g className="dial-indicator-assembly">
        {/* Magnetic Base Block */}
        {(() => {
          const magPlan = { x: DIAL[0] - 14, y: DIAL[1] - 14, w: 28, d: 28, r: 3 };
          return (
            <g>
              <g dangerouslySetInnerHTML={{ __html: S(k.slabOf(magPlan, 0, 16, P, 4, 0.8), { tone: "mid" }) }} />
              <g dangerouslySetInnerHTML={{ __html: S(k.cylinder(magPlan.x + 20, magPlan.y + 20, 4, 16, 3, P, 20), { tone: "mid" }) }} />
            </g>
          );
        })()}

        {/* Vertical Post & Arm */}
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

        {/* Dial Gauge Head */}
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

              {/* Needle */}
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
                LEN: 6 B
              </text>
              <text
                x={dialCenter[0]}
                y={dialCenter[1] - 8}
                textAnchor="middle"
                fontSize="6"
                fontWeight="800"
                fill="var(--anatomy-strong)"
                fontFamily="var(--anatomy-mono)"
              >
                {isSliceActive ? "SLICE" : `IDX ${activeCharIdx}`}
              </text>
            </g>
          );
        })()}
      </g>
    </svg>
  );
}
