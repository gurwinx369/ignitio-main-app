import React from 'react';
import * as k from '../../lib/isoKit.mjs';

/**
 * ControlFlowRig
 * Authentic Anatomy mechanical apparatus demonstrating:
 * - Branching logic (if, elif, else)
 * - Multi-contact mechanical commutator gate routing execution flow
 * - Tri-state boolean evaluation relay
 */
const WIDTH = 760;
const HEIGHT = 440;
const PLATE = { x: -140, y: -90, w: 280, d: 180, r: 8 };
const PLATE_H = 12;
const FOOT_H = 5;

const COMMUTATOR = [-60, 0];
const BRANCHES = [
  { id: 'if', label: 'if (score >= 90)', result: "'Grade A'", trackY: -45, color: 'var(--anatomy-green)' },
  { id: 'elif', label: 'elif (score >= 75)', result: "'Grade B'", trackY: 0, color: 'var(--anatomy-blue)' },
  { id: 'else', label: 'else: default', result: "'Pass'", trackY: 45, color: 'var(--anatomy-red)' },
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

export default function ControlFlowRig({
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

  // Active branch index (0: if, 1: elif, 2: else, 3: resolved output)
  const activeBranchIdx = currentStep % 3;
  const activeBranch = BRANCHES[activeBranchIdx];

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

      {/* ── 2. Mechanical Commutator Rotor (Logic Switch) ── */}
      <g className="commutator-assembly">
        {/* Circular well on bedplate */}
        <g dangerouslySetInnerHTML={{ __html: L(k.ring(COMMUTATOR[0], COMMUTATOR[1], 28, 0, P, 32), { tone: "lo" }) }} />

        {/* Rotary Hub Body */}
        <g dangerouslySetInnerHTML={{ __html: S(k.cylinder(COMMUTATOR[0], COMMUTATOR[1], 20, 0, 16, P, 32), { tone: "mid" }) }} />
        <g dangerouslySetInnerHTML={{ __html: L(k.ring(COMMUTATOR[0], COMMUTATOR[1], 16, 16, P, 32), { tone: "hi" }) }} />

        {/* Central Ruby Bushing & Pivot Screw */}
        <circle
          cx={at([COMMUTATOR[0], COMMUTATOR[1], 16])[0]}
          cy={at([COMMUTATOR[0], COMMUTATOR[1], 16])[1]}
          r="4"
          fill="var(--anatomy-red)"
          stroke="var(--anatomy-hi)"
          strokeWidth="0.8"
        />

        {/* Commutator Contact Arm pointing to active branch */}
        {(() => {
          const hubPt = at([COMMUTATOR[0], COMMUTATOR[1], 18]);
          const targetPt = at([0, activeBranch.trackY, 18]);
          return (
            <g className="contact-arm">
              <line
                x1={hubPt[0]}
                y1={hubPt[1]}
                x2={targetPt[0]}
                y2={targetPt[1]}
                stroke="var(--anatomy-lit)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx={targetPt[0]} cy={targetPt[1]} r="3" fill="var(--anatomy-hi)" />
            </g>
          );
        })()}
      </g>

      {/* ── 3. Branch Output Terminals (3 Execution Tracks) ── */}
      <g className="branches-assembly">
        {BRANCHES.map((b, idx) => {
          const isSelected = idx === activeBranchIdx;
          const plan = { x: 20, y: b.trackY - 14, w: 60, d: 28, r: 3 };
          const bz = isSelected ? 10 : 0;

          return (
            <g
              key={b.id}
              onClick={() => onSelectStep?.(idx)}
              className="cursor-pointer transition-all duration-300"
            >
              {/* Recessed footprint */}
              <g dangerouslySetInnerHTML={{ __html: L(k.planOutline(plan, 0, P), { tone: "faint" }) }} />

              {/* Terminal Cassette */}
              <g dangerouslySetInnerHTML={{ __html: S(k.slabOf(plan, bz, 12, P, 4, 0.8), { tone: isSelected ? "lit" : "mid" }) }} />

              {/* Track guide wire from Commutator to Terminal */}
              <line
                x1={at([0, b.trackY, 0])[0]}
                y1={at([0, b.trackY, 0])[1]}
                x2={at([20, b.trackY, 0])[0]}
                y2={at([20, b.trackY, 0])[1]}
                stroke={isSelected ? "var(--anatomy-lit)" : "var(--anatomy-lo)"}
                strokeWidth="1.2"
                strokeDasharray={isSelected ? "none" : "2 3"}
              />

              {/* Terminal Status Jewel */}
              <circle
                cx={at([30, b.trackY, bz + 12])[0]}
                cy={at([30, b.trackY, bz + 12])[1]}
                r="3.5"
                fill={isSelected ? b.color : "var(--anatomy-paper)"}
                stroke="var(--anatomy-hi)"
                strokeWidth="0.8"
              />

              {/* Label */}
              <text
                x={at([52, b.trackY - 4, bz + 12])[0]}
                y={at([52, b.trackY - 4, bz + 12])[1]}
                textAnchor="middle"
                fontSize="5"
                fontWeight="700"
                fill={isSelected ? "var(--anatomy-strong)" : "var(--anatomy-muted)"}
                fontFamily="var(--anatomy-mono)"
              >
                {b.id.toUpperCase()}
              </text>
              <text
                x={at([52, b.trackY + 4, bz + 12])[0]}
                y={at([52, b.trackY + 4, bz + 12])[1]}
                textAnchor="middle"
                fontSize="5"
                fontWeight="800"
                fill={isSelected ? "var(--anatomy-lit)" : "var(--anatomy-lo)"}
                fontFamily="var(--anatomy-mono)"
              >
                {b.result}
              </text>
            </g>
          );
        })}
      </g>

      {/* ── 4. Precision Dial Indicator Gauge ── */}
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
                BRANCH GATE
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
                {activeBranch.id.toUpperCase()}
              </text>
            </g>
          );
        })()}
      </g>
    </svg>
  );
}
