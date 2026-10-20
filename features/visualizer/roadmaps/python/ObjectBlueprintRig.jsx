import React from 'react';
import * as k from '../../lib/isoKit.mjs';

/**
 * ObjectBlueprintRig
 * Authentic Anatomy mechanical apparatus demonstrating:
 * - OOP class master blueprint casting instances into memory
 * - Two-phase object creation: __new__ memory allocate + __init__ constructor stamp
 * - 'self' leader pin binding caller instance memory address
 * - Private instance __dict__ attribute vault
 */
const WIDTH = 760;
const HEIGHT = 440;
const PLATE = { x: -140, y: -90, w: 280, d: 180, r: 8 };
const PLATE_H = 12;
const FOOT_H = 5;

const BLUEPRINT = [-65, 0];
const INSTANCES = [
  { id: 'p1', name: "'Car'", val: 'brand="Tesla"', addr: '0x90A0', x: 20, y: -35 },
  { id: 'p2', name: "'Laptop'", val: 'cpu="M3"', addr: '0x90E8', x: 20, y: 30 },
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

export default function ObjectBlueprintRig({
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

  const activeInstIdx = currentStep % 2;

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

      {/* ── 2. Master Class Blueprint Casting Gantry (Left) ── */}
      {(() => {
        const bpPlan = { x: -110, y: -45, w: 80, d: 90, r: 4 };
        return (
          <g className="blueprint-gantry">
            <g dangerouslySetInnerHTML={{ __html: S(k.slabOf(bpPlan, 0, 18, P, 5, 0.8), { tone: "mid" }) }} />
            <g dangerouslySetInnerHTML={{ __html: L(k.planOutline(k.insetPlan(bpPlan, 4), 18, P), { tone: "hi" }) }} />

            <circle
              cx={at([BLUEPRINT[0], BLUEPRINT[1], 18])[0]}
              cy={at([BLUEPRINT[0], BLUEPRINT[1], 18])[1]}
              r="4.5"
              fill="var(--anatomy-red)"
              stroke="var(--anatomy-hi)"
              strokeWidth="0.8"
            />

            <text
              x={at([BLUEPRINT[0], -26, 18])[0]}
              y={at([BLUEPRINT[0], -26, 18])[1]}
              textAnchor="middle"
              fontSize="6"
              fontWeight="800"
              fill="var(--anatomy-strong)"
              fontFamily="var(--anatomy-mono)"
            >
              class Vehicle:
            </text>
            <text
              x={at([BLUEPRINT[0], -12, 18])[0]}
              y={at([BLUEPRINT[0], -12, 18])[1]}
              textAnchor="middle"
              fontSize="5"
              fontWeight="600"
              fill="var(--anatomy-muted)"
              fontFamily="var(--anatomy-mono)"
            >
              def __init__(self):
            </text>
            <text
              x={at([BLUEPRINT[0], 22, 18])[0]}
              y={at([BLUEPRINT[0], 22, 18])[1]}
              textAnchor="middle"
              fontSize="5"
              fontWeight="700"
              fill="var(--anatomy-strong)"
              fontFamily="var(--anatomy-mono)"
            >
              MASTER TEMPLATE
            </text>
          </g>
        );
      })()}

      {/* ── 3. Cast Instances (Manufactured in Heap) ── */}
      <g className="instances-assembly">
        {INSTANCES.map((inst, idx) => {
          const isSelected = idx === activeInstIdx;
          const plan = { x: inst.x - 20, y: inst.y - 18, w: 65, d: 36, r: 3 };
          const iz = isSelected ? 12 : 0;

          return (
            <g
              key={inst.id}
              onClick={() => onSelectStep?.(idx)}
              className="cursor-pointer transition-all duration-300"
            >
              <g dangerouslySetInnerHTML={{ __html: S(k.slabOf(plan, iz, 14, P, 4, 0.8), { tone: isSelected ? "lit" : "mid" }) }} />

              {/* Leader pin from Class to Instance */}
              <line
                x1={at([BLUEPRINT[0] + 30, inst.y, 10])[0]}
                y1={at([BLUEPRINT[0] + 30, inst.y, 10])[1]}
                x2={at([inst.x - 20, inst.y, 10])[0]}
                y2={at([inst.x - 20, inst.y, 10])[1]}
                stroke={isSelected ? "var(--anatomy-lit)" : "var(--anatomy-lo)"}
                strokeWidth="1.2"
                strokeDasharray="3 3"
              />

              {/* Bushing & Instance Title */}
              <circle
                cx={at([inst.x, inst.y - 4, iz + 14])[0]}
                cy={at([inst.x, inst.y - 4, iz + 14])[1]}
                r="4"
                fill={isSelected ? "var(--anatomy-red)" : "var(--anatomy-card)"}
                stroke="var(--anatomy-hi)"
                strokeWidth="0.8"
              />

              <text
                x={at([inst.x + 18, inst.y - 6, iz + 14])[0]}
                y={at([inst.x + 18, inst.y - 6, iz + 14])[1]}
                textAnchor="middle"
                fontSize="5.5"
                fontWeight="800"
                fill={isSelected ? "var(--anatomy-strong)" : "var(--anatomy-muted)"}
                fontFamily="var(--anatomy-mono)"
              >
                self = {inst.addr}
              </text>
              <text
                x={at([inst.x + 12, inst.y + 6, iz + 14])[0]}
                y={at([inst.x + 12, inst.y + 6, iz + 14])[1]}
                textAnchor="middle"
                fontSize="5"
                fontWeight="600"
                fill="var(--anatomy-text)"
                fontFamily="var(--anatomy-mono)"
              >
                {inst.val}
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
                INSTANCE PTR
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
                {INSTANCES[activeInstIdx].addr}
              </text>
            </g>
          );
        })()}
      </g>
    </svg>
  );
}
