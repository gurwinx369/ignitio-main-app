import React from 'react';
import * as k from '../../lib/isoKit.mjs';

/**
 * CallStackTowerRig
 * Authentic Anatomy mechanical apparatus demonstrating:
 * - Python call stack frames (push, execute, return pop)
 * - Encapsulated local namespace and arguments binding
 * - Stack pointer (SP) registration
 */
const WIDTH = 760;
const HEIGHT = 440;
const PLATE = { x: -140, y: -90, w: 280, d: 180, r: 8 };
const PLATE_H = 12;
const FOOT_H = 5;

const STACK_X = -35;
const STACK_FRAMES = [
  { id: 0, fn: 'main()', args: 'args=()', locals: 'x=10, y=20', zBase: 0 },
  { id: 1, fn: 'calculate(x, y)', args: 'a=10, b=20', locals: 'sum=30', zBase: 24 },
  { id: 2, fn: 'multiply(sum, 2)', args: 'val=30, mul=2', locals: 'res=60', zBase: 48 },
];

const DIAL = [105, -20];
const DIAL_R = 24;
const DIAL_Z = 58;

const P = k.fitProjection(
  [
    ...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0),
    [-100, -50, 45],
    [100, 50, 85],
    [DIAL[0] - DIAL_R, DIAL[1] - DIAL_R, DIAL_Z + 20],
    [DIAL[0] + DIAL_R, DIAL[1] + DIAL_R, DIAL_Z + 20],
  ],
  WIDTH,
  HEIGHT,
  { pad: 36, azimuth: 44, elevation: 32 }
);

export default function CallStackTowerRig({
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

  // Active stack depth:
  // Step 0: main()
  // Step 1: calculate() pushed
  // Step 2: multiply() pushed (peak)
  // Step 3: return 60 popped back
  const stackDepth = currentStep === 0 ? 1 : currentStep === 1 ? 2 : currentStep === 2 ? 3 : 1;

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

      {/* ── 2. Vertical Kinematic Gantry Guide Pillars ── */}
      {(() => {
        const p1 = [-95, -45];
        const p2 = [25, -45];
        const p3 = [-95, 45];
        const p4 = [25, 45];
        const pillarH = 80;
        return (
          <g className="stack-guide-pillars">
            {[p1, p2, p3, p4].map(([px, py], idx) => (
              <g key={`pillar-${idx}`}>
                <g dangerouslySetInnerHTML={{ __html: S(k.cylinder(px, py, 3, 0, pillarH, P, 16), { tone: "mid", crease: "none" }) }} />
                <circle cx={at([px, py, pillarH])[0]} cy={at([px, py, pillarH])[1]} r="3" fill="var(--anatomy-hi)" />
              </g>
            ))}
          </g>
        );
      })()}

      {/* ── 3. Kinematic Stack Frames (Pushed Vertically) ── */}
      <g className="stack-frames-assembly">
        {STACK_FRAMES.map((f, idx) => {
          const isVisible = idx < stackDepth;
          if (!isVisible) return null;

          const isTop = idx === stackDepth - 1;
          const plan = { x: -85, y: -38, w: 100, d: 76, r: 4 };
          const frameZ = f.zBase;

          return (
            <g
              key={f.id}
              onClick={() => onSelectStep?.(idx)}
              className="cursor-pointer transition-all duration-300"
            >
              <g dangerouslySetInnerHTML={{ __html: S(k.slabOf(plan, frameZ, 16, P, 4, 0.8), { tone: isTop ? "lit" : "mid" }) }} />
              <g dangerouslySetInnerHTML={{ __html: L(k.ring(-35, -2, frameZ + 16, P, 18), { tone: isTop ? "lit" : "lo" }) }} />

              {/* Central Ruby Jewel Status Pivot */}
              <circle
                cx={at([-35, -2, frameZ + 16])[0]}
                cy={at([-35, -2, frameZ + 16])[1]}
                r="4"
                fill={isTop ? "var(--anatomy-red)" : "var(--anatomy-paper)"}
                stroke="var(--anatomy-hi)"
                strokeWidth="0.8"
              />

              {/* Function Frame Title */}
              <text
                x={at([-35, -18, frameZ + 16])[0]}
                y={at([-35, -18, frameZ + 16])[1]}
                textAnchor="middle"
                fontSize="6"
                fontWeight="800"
                fill={isTop ? "var(--anatomy-strong)" : "var(--anatomy-muted)"}
                fontFamily="var(--anatomy-mono)"
              >
                FRAME: {f.fn}
              </text>

              {/* Args & Locals */}
              <text
                x={at([-35, 16, frameZ + 16])[0]}
                y={at([-35, 16, frameZ + 16])[1]}
                textAnchor="middle"
                fontSize="5"
                fontWeight="600"
                fill={isTop ? "var(--anatomy-strong)" : "var(--anatomy-text)"}
                fontFamily="var(--anatomy-mono)"
              >
                {f.locals}
              </text>
            </g>
          );
        })}
      </g>

      {/* ── 4. Precision Dial Gauge Meter ── */}
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
                STACK DEPTH
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
                {stackDepth} FRAMES
              </text>
            </g>
          );
        })()}
      </g>
    </svg>
  );
}
