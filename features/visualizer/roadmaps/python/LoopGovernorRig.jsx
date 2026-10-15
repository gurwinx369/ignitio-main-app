import React from 'react';
import * as k from '../../lib/isoKit.mjs';

/**
 * LoopGovernorRig
 * Authentic Anatomy mechanical apparatus demonstrating:
 * - Centrifugal loop flywheel governor (repeated execution cycles)
 * - Iteration counter accumulator
 * - Mechanical 'break' clutch and 'continue' bypass latch
 */
const WIDTH = 760;
const HEIGHT = 440;
const PLATE = { x: -140, y: -90, w: 280, d: 180, r: 8 };
const PLATE_H = 12;
const FOOT_H = 5;

const FLYWHEEL = [-65, 0];
const FLYWHEEL_R = 34;

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

export default function LoopGovernorRig({
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

  // Continuous loop rotation angle derived from smoothStep
  const flyAngle = (smoothStep * 90) % 360;

  // Loop control modes:
  // Phase 0: Normal While/For cycle
  // Phase 1: Iterating next item
  // Phase 2: 'break' clutch disengaged
  // Phase 3: 'continue' bypass active
  const isBreakTripped = currentStep === 2;
  const isContinueActive = currentStep === 3;

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

      {/* ── 2. Centrifugal Flywheel Governor ── */}
      <g className="governor-wheel-assembly">
        <g dangerouslySetInnerHTML={{ __html: L(k.ring(FLYWHEEL[0], FLYWHEEL[1], FLYWHEEL_R, 0, P, 32), { tone: "lo" }) }} />
        <g dangerouslySetInnerHTML={{ __html: S(k.cylinder(FLYWHEEL[0], FLYWHEEL[1], FLYWHEEL_R - 4, 12, 6, P, 32), { tone: "mid" }) }} />

        {/* 4 Flywheel Spokes with Brass Balancing Weights */}
        {(() => {
          const spokes = [];
          for (let i = 0; i < 4; i++) {
            const angle = (i * 90 + flyAngle) * (Math.PI / 180);
            const p1 = [FLYWHEEL[0], FLYWHEEL[1], 18];
            const p2 = [FLYWHEEL[0] + Math.cos(angle) * (FLYWHEEL_R - 6), FLYWHEEL[1] + Math.sin(angle) * (FLYWHEEL_R - 6), 18];
            spokes.push(k.lineOnTop([p1[0], p1[1]], [p2[0], p2[1]], 18, P));
          }
          return (
            <g>
              <g dangerouslySetInnerHTML={{ __html: L(spokes.join(""), { tone: "hi" }) }} />
            </g>
          );
        })()}

        {/* Central Escapement Ruby Bushing */}
        <circle
          cx={at([FLYWHEEL[0], FLYWHEEL[1], 18])[0]}
          cy={at([FLYWHEEL[0], FLYWHEEL[1], 18])[1]}
          r="4.5"
          fill="var(--anatomy-red)"
          stroke="var(--anatomy-hi)"
          strokeWidth="0.8"
        />

        {/* Mechanical Break Clutch Lever */}
        {(() => {
          const leverStart = [FLYWHEEL[0] + FLYWHEEL_R - 4, FLYWHEEL[1], 16];
          const leverEnd = [FLYWHEEL[0] + FLYWHEEL_R + (isBreakTripped ? 2 : 12), FLYWHEEL[1] + 16, 16];
          return (
            <g className="break-clutch">
              <line
                x1={at(leverStart)[0]}
                y1={at(leverStart)[1]}
                x2={at(leverEnd)[0]}
                y2={at(leverEnd)[1]}
                stroke={isBreakTripped ? "var(--anatomy-red)" : "var(--anatomy-mid)"}
                strokeWidth={isBreakTripped ? "2.5" : "1.5"}
                strokeLinecap="round"
              />
              <circle cx={at(leverEnd)[0]} cy={at(leverEnd)[1]} r="3" fill={isBreakTripped ? "var(--anatomy-red)" : "var(--anatomy-hi)"} />
            </g>
          );
        })()}
      </g>

      {/* ── 3. Step Cycle Sequence Tape (0, 1, 2, 3...) ── */}
      <g className="cycle-tape-assembly">
        {[0, 1, 2, 3].map((stepNum) => {
          const isCurrent = stepNum === currentStep;
          const cy = -35 + stepNum * 24;
          const plan = { x: 5, y: cy - 9, w: 65, d: 18, r: 2.5 };
          const sz = isCurrent ? 8 : 0;

          return (
            <g
              key={stepNum}
              onClick={() => onSelectStep?.(stepNum)}
              className="cursor-pointer transition-all duration-300"
            >
              <g dangerouslySetInnerHTML={{ __html: S(k.slabOf(plan, sz, 8, P, 3, 0.8), { tone: isCurrent ? "lit" : "mid" }) }} />
              <text
                x={at([37, cy, sz + 8])[0]}
                y={at([37, cy, sz + 8])[1] + 2}
                textAnchor="middle"
                fontSize="5"
                fontWeight="800"
                fill={isCurrent ? "var(--anatomy-strong)" : "var(--anatomy-muted)"}
                fontFamily="var(--anatomy-mono)"
              >
                {stepNum === 2 && isBreakTripped ? "BREAK HALT" : stepNum === 3 && isContinueActive ? "CONTINUE SKIP" : `CYCLE ${stepNum + 1} [i=${stepNum}]`}
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
                ITERATIONS
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
                {isBreakTripped ? "HALTED" : isContinueActive ? "SKIPPED" : `RUN ${currentStep + 1}`}
              </text>
            </g>
          );
        })()}
      </g>
    </svg>
  );
}
