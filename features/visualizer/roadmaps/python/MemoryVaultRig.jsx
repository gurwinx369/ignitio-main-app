import React, { useMemo } from 'react';
import * as k from '../../lib/isoKit.mjs';

/**
 * MemoryVaultRig
 * Authentic Anatomy mechanical apparatus combining:
 * - High-horology watch movement (Image 1): Balance wheel with breathing hairspring, perlage graining, ruby jewel chatons, slotted screws.
 * - Precision test stand & exploded view (Image 2): 4-tone technical pen shading, .iso-plate card framing, and kinematic cassette explosion.
 */
// Hoisted module-level constants (Vercel best practice)
const WIDTH = 760;
const HEIGHT = 440;
const PLATE = { x: -140, y: -90, w: 280, d: 180, r: 8 };
const PLATE_H = 12;
const FOOT_H = 5;
const BALANCE = [-80, -5];
const BALANCE_R = 30;
const DIAL = [105, -15];
const DIAL_R = 24;
const DIAL_Z = 58;

const CASSETTES = [
  { x: -18, y: -45, address: '0x7FF0', label: 'x', value: '10', type: 'int' },
  { x: 44, y: -45, address: '0x7FF4', label: 'y', value: "'Ignitio'", type: 'str' },
  { x: -18, y: 22, address: '0x7FF8', label: 'isReady', value: 'True', type: 'bool' },
  { x: 44, y: 22, address: '0x7FFC', label: '[free]', value: '0x00', type: 'empty' },
];

const P = k.fitProjection(
  [
    ...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0),
    [BALANCE[0] - BALANCE_R, BALANCE[1] - BALANCE_R, 40],
    [BALANCE[0] + BALANCE_R, BALANCE[1] + BALANCE_R, 40],
    [DIAL[0] - DIAL_R, DIAL[1] - DIAL_R, DIAL_Z + 20],
    [DIAL[0] + DIAL_R, DIAL[1] + DIAL_R, DIAL_Z + 20],
  ],
  WIDTH,
  HEIGHT,
  { pad: 36, azimuth: 44, elevation: 32 }
);

export default function MemoryVaultRig({
  workerState = {},
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

  // Breathing balance hairspring calculation (purely derived from smoothStep continuous ticker)
  const oscAngle = Math.sin(smoothStep * 6.28) * 22;

  // Active cassette index
  const activeIdx = currentStep % CASSETTES.length;

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="iso-svg select-none"
      style={{ overflow: 'visible' }}
    >
      <defs>
        {/* Soft shadow filter */}
        <filter id="cardHalo" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="6" />
          <feOffset dx="0" dy="8" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.3" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ── 1. Cast-Iron Bedplate with Turned Brass Leveling Feet ── */}
      <g className="bedplate-assembly">
        {/* Contact Ambient Occlusion Halo */}
        <path
          className="iso-halo"
          d={k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}
        />

        {/* 4 Turned Leveling Feet */}
        {byDepth(k.corners(PLATE, 20)).map(([fx, fy], idx) => (
          <g key={`foot-${idx}`}>
            <g dangerouslySetInnerHTML={{ __html: S(k.cylinder(fx, fy, 8, -PLATE_H - FOOT_H, 2, P, 24), { tone: "lo" }) }} />
            <g dangerouslySetInnerHTML={{ __html: S(k.cylinder(fx, fy, 6, -PLATE_H - FOOT_H + 2, FOOT_H - 2, P, 24), { tone: "mid" }) }} />
          </g>
        ))}

        {/* Heavy Machined Bedplate Slab (4-Tone Directional Shading) */}
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

        {/* Metric Calibration Ruler Strip along Front Edge */}
        {(() => {
          const strip = { x: -130, y: PLATE.y + PLATE.d - 16, w: 260, d: 8, r: 1.5 };
          const ticks = k.topTicks(strip.x + 4, strip.x + strip.w - 4, 4, 5, strip.y + 1, 0.6, [2, 3.8], P);
          return (
            <g className="ruler-strip">
              <g dangerouslySetInnerHTML={{ __html: S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }) }} />
              <g dangerouslySetInnerHTML={{ __html: L(ticks.minor, { tone: "lo" }) }} />
              <g dangerouslySetInnerHTML={{ __html: L(ticks.major, { tone: "mid" }) }} />
              <g dangerouslySetInnerHTML={{ __html: D([at([strip.x + 2, strip.y + 4, 0.6]), at([strip.x + strip.w - 2, strip.y + 4, 0.6])], { size: 0.45, tone: "hi" }) }} />
            </g>
          );
        })()}

      </g>

      {/* ── 2. Clockwork Balance Wheel & Escapement (Watch Caliber from Image 1) ── */}
      <g className="clockwork-movement">
        {/* Circular Recess in Mainplate with Circular Perlage Graining Pattern */}
        {(() => {
          const dots = [];
          for (let r = 8; r <= BALANCE_R - 4; r += 7) {
            const count = Math.floor((2 * Math.PI * r) / 8);
            for (let i = 0; i < count; i++) {
              const a = (i / count) * Math.PI * 2;
              dots.push(at([BALANCE[0] + Math.cos(a) * r, BALANCE[1] + Math.sin(a) * r, 0]));
            }
          }
          return (
            <g>
              <g dangerouslySetInnerHTML={{ __html: L(k.ring(BALANCE[0], BALANCE[1], BALANCE_R, 0, P, 32), { tone: "lo" }) }} />
              <g dangerouslySetInnerHTML={{ __html: D(dots, { size: 0.38, tone: "faint" }) }} />
            </g>
          );
        })()}

        {/* Balance Wheel Rim & Spokes */}
        {(() => {
          const wheelZ = 12;
          const rimPath = k.ring(BALANCE[0], BALANCE[1], BALANCE_R - 5, wheelZ, P, 32);
          const innerRim = k.ring(BALANCE[0], BALANCE[1], BALANCE_R - 8, wheelZ, P, 32);

          // 3 Balance Wheel Spokes
          const spokes = [];
          for (let i = 0; i < 3; i++) {
            const angle = (i * 120 + oscAngle) * (Math.PI / 180);
            const p1 = [BALANCE[0], BALANCE[1], wheelZ];
            const p2 = [BALANCE[0] + Math.cos(angle) * (BALANCE_R - 8), BALANCE[1] + Math.sin(angle) * (BALANCE_R - 8), wheelZ];
            spokes.push(k.lineOnTop([p1[0], p1[1]], [p2[0], p2[1]], wheelZ, P));
          }

          // Screws around balance wheel perimeter
          const rimScrews = [];
          for (let i = 0; i < 8; i++) {
            const angle = (i * 45 + oscAngle) * (Math.PI / 180);
            rimScrews.push(at([BALANCE[0] + Math.cos(angle) * (BALANCE_R - 6.5), BALANCE[1] + Math.sin(angle) * (BALANCE_R - 6.5), wheelZ]));
          }

          return (
            <g className="balance-wheel">
              <g dangerouslySetInnerHTML={{ __html: L(rimPath + innerRim, { tone: "hi" }) }} />
              <g dangerouslySetInnerHTML={{ __html: L(spokes.join(""), { tone: "mid" }) }} />
              <g dangerouslySetInnerHTML={{ __html: D(rimScrews, { size: 0.35, tone: "lit" }) }} />
            </g>
          );
        })()}

        {/* Archimedean Spiral Hairspring (Image 1) */}
        {(() => {
          const springZ = 16;
          const coils = 5;
          const pts = [];
          const totalPoints = 60;
          for (let i = 0; i < totalPoints; i++) {
            const t = i / totalPoints;
            const r = 3 + t * 15;
            const a = t * coils * Math.PI * 2 + (oscAngle * Math.PI) / 180;
            pts.push(at([BALANCE[0] + Math.cos(a) * r, BALANCE[1] + Math.sin(a) * r, springZ]));
          }
          const springPath = k.pathOf(pts);
          return (
            <g className="hairspring">
              <path
                d={springPath}
                fill="none"
                stroke="var(--anatomy-hi)"
                strokeWidth="0.8"
                strokeLinecap="round"
              />
            </g>
          );
        })()}

        {/* Balance Bridge Plate (Anglage Chamfered Bevels from Image 1) */}
        {(() => {
          const bridgePlan = { x: BALANCE[0] - 22, y: BALANCE[1] - 8, w: 44, d: 16, r: 5 };
          return (
            <g className="balance-bridge">
              <g dangerouslySetInnerHTML={{ __html: S(k.slabOf(bridgePlan, 18, 5, P, 6, 0.8), { tone: "mid" }) }} />
              {/* Central Ruby Jewel Bushing with Gold Chaton */}
              <g dangerouslySetInnerHTML={{ __html: L(k.ring(BALANCE[0], BALANCE[1], 4, 23, P, 18), { tone: "lo" }) }} />
              <circle
                cx={at([BALANCE[0], BALANCE[1], 23])[0]}
                cy={at([BALANCE[0], BALANCE[1], 23])[1]}
                r="2.5"
                fill="var(--anatomy-red)"
                stroke="var(--anatomy-hi)"
                strokeWidth="0.5"
              />
              {/* 2 Slotted Retaining Screws */}
              <g dangerouslySetInnerHTML={{ __html: D([at([bridgePlan.x + 5, BALANCE[1], 23]), at([bridgePlan.x + bridgePlan.w - 5, BALANCE[1], 23])], { size: 0.45, tone: "hi" }) }} />
            </g>
          );
        })()}
      </g>

      {/* ── 3. Four Exploded Memory Cassettes (Kinematic Disassembly like Image 2) ── */}
      <g className="cassettes-assembly">
        {CASSETTES.map((cassette, idx) => {
          const isActive = idx === activeIdx;
          const isTargeted = Math.round(smoothStep) % 4 === idx;

          // Kinematic Exploded Disassembly (Image 2 style):
          // Active cassette lifts +16px in Z and slides forward +8px in Y!
          const explodeZ = isActive ? 16 : 0;
          const explodeY = isActive ? 8 : 0;

          const cx = cassette.x;
          const cy = cassette.y + explodeY;
          const cz = 0 + explodeZ;

          const plan = { x: cx - 22, y: cy - 20, w: 44, d: 40, r: 4 };

          return (
            <g
              key={cassette.address}
              onClick={() => onSelectStep?.(idx)}
              className="cursor-pointer transition-all duration-300"
              style={{ outline: 'none' }}
            >
              {/* Recessed well footprint on mainplate */}
              <g dangerouslySetInnerHTML={{ __html: L(k.planOutline(k.insetPlan({ x: cx - 22, y: cassette.y - 20, w: 44, d: 40, r: 4 }, -1), 0, P), { tone: "faint" }) }} />

              {/* Exploded Cassette Chassis (Slab with bevel) */}
              <g dangerouslySetInnerHTML={{ __html: S(k.slabOf(plan, cz, 16, P, 6, 0.8), { tone: isActive ? "lit" : "mid" }) }} />

              {/* Surface Bevel Inlay */}
              <g dangerouslySetInnerHTML={{ __html: L(k.planOutline(k.insetPlan(plan, 3), cz + 16, P), { tone: isActive ? "lit" : "faint" }) }} />

              {/* Central Ruby Jewel Bushing & Value Token (Image 1 style) */}
              <g dangerouslySetInnerHTML={{ __html: L(k.ring(cx, cy, 7, cz + 16, P, 20), { tone: isActive ? "lit" : "lo" }) }} />
              <circle
                cx={at([cx, cy, cz + 16])[0]}
                cy={at([cx, cy, cz + 16])[1]}
                r={isActive ? "5" : "4"}
                fill={isActive ? "var(--anatomy-red)" : "var(--anatomy-paper)"}
                stroke="var(--anatomy-hi)"
                strokeWidth="0.8"
              />
              <text
                x={at([cx, cy, cz + 16])[0]}
                y={at([cx, cy, cz + 16])[1] + 2.5}
                textAnchor="middle"
                fontSize="6"
                fontWeight="800"
                fill={isActive ? "#ffffff" : "var(--anatomy-text)"}
                fontFamily="var(--anatomy-mono)"
              >
                {cassette.value}
              </text>

              {/* Stamped Precision Nametag Badge on vertical leader pin */}
              {cassette.label !== '[free]' && (
                <g className="nametag-perch">
                  {/* Vertical leader pin */}
                  <line
                    x1={at([cx, cy - 9, cz + 16])[0]}
                    y1={at([cx, cy - 9, cz + 16])[1]}
                    x2={at([cx, cy - 9, cz + 26])[0]}
                    y2={at([cx, cy - 9, cz + 26])[1]}
                    stroke={isActive ? "var(--anatomy-lit)" : "var(--anatomy-mid)"}
                    strokeWidth="0.8"
                  />
                  {/* Badge plate */}
                  <rect
                    x={at([cx, cy - 9, cz + 26])[0] - 16}
                    y={at([cx, cy - 9, cz + 26])[1] - 6}
                    width="32"
                    height="11"
                    rx="2"
                    fill="var(--anatomy-card)"
                    stroke={isActive ? "var(--anatomy-lit)" : "var(--anatomy-lo)"}
                    strokeWidth={isActive ? "1" : "0.75"}
                  />
                  <text
                    x={at([cx, cy - 9, cz + 26])[0]}
                    y={at([cx, cy - 9, cz + 26])[1] + 2}
                    textAnchor="middle"
                    fontSize="5.5"
                    fontWeight="700"
                    fill={isActive ? "var(--anatomy-strong)" : "var(--anatomy-muted)"}
                    fontFamily="var(--anatomy-mono)"
                  >
                    var {cassette.label}
                  </text>
                </g>
              )}

              {/* Address label engraved on front face */}
              <text
                x={at([cx, cy + 18, cz + 8])[0]}
                y={at([cx, cy + 18, cz + 8])[1]}
                textAnchor="middle"
                fontSize="5.5"
                fontWeight="bold"
                fill="var(--anatomy-muted)"
                fontFamily="var(--anatomy-mono)"
              >
                {cassette.address}
              </text>
            </g>
          );
        })}
      </g>

      {/* ── 4. Precision Dial Indicator Stand (Anatomy Test Stand from Image 2) ── */}
      <g className="dial-indicator-assembly">
        {/* Magnetic Base Block with Knurled Switch Knob */}
        {(() => {
          const magPlan = { x: DIAL[0] - 14, y: DIAL[1] - 14, w: 28, d: 28, r: 3 };
          return (
            <g>
              <g dangerouslySetInnerHTML={{ __html: S(k.slabOf(magPlan, 0, 16, P, 4, 0.8), { tone: "mid" }) }} />
              <g dangerouslySetInnerHTML={{ __html: S(k.cylinder(magPlan.x + 20, magPlan.y + 20, 4, 16, 3, P, 20), { tone: "mid" }) }} />
              <g dangerouslySetInnerHTML={{ __html: L(k.knurl(magPlan.x + 20, magPlan.y + 20, 4, 16, 19, 18, P), { tone: "lo" }) }} />
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
              {/* Cross Arm to Dial */}
              <g dangerouslySetInnerHTML={{ __html: S(k.slabOf({ x: postX, y: postY - 3, w: 12, d: 6, r: 1.5 }, DIAL_Z, 3, P, 2), { tone: "mid" }) }} />
            </g>
          );
        })()}

        {/* Dial Gauge Body */}
        {(() => {
          const dialCenter = at([DIAL[0], DIAL[1], DIAL_Z]);
          const rad = (smoothNeedle * Math.PI) / 180;
          const needleLen = DIAL_R - 5;
          const tipX = dialCenter[0] + Math.cos(rad) * needleLen * 0.95;
          const tipY = dialCenter[1] + Math.sin(rad) * needleLen * 0.58;

          return (
            <g className="dial-face">
              {/* Cylindrical Casing */}
              <g dangerouslySetInnerHTML={{ __html: S(k.cylinder(DIAL[0], DIAL[1], DIAL_R, DIAL_Z, 8, P, 32), { tone: "mid" }) }} />
              {/* Dial Face Bezel Inlay */}
              <g dangerouslySetInnerHTML={{ __html: L(k.ring(DIAL[0], DIAL[1], DIAL_R - 3, DIAL_Z + 8, P, 32), { tone: "lo" }) }} />

              {/* Radial Ticks */}
              {Array.from({ length: 16 }).map((_, i) => {
                const angle = (i / 16) * Math.PI * 2;
                const r1 = DIAL_R - 6;
                const r2 = DIAL_R - 3;
                const p1 = at([DIAL[0] + Math.cos(angle) * r1, DIAL[1] + Math.sin(angle) * r1, DIAL_Z + 8]);
                const p2 = at([DIAL[0] + Math.cos(angle) * r2, DIAL[1] + Math.sin(angle) * r2, DIAL_Z + 8]);
                return (
                  <line
                    key={i}
                    x1={p1[0]}
                    y1={p1[1]}
                    x2={p2[0]}
                    y2={p2[1]}
                    stroke={i % 4 === 0 ? "var(--anatomy-hi)" : "var(--anatomy-lo)"}
                    strokeWidth={i % 4 === 0 ? "1" : "0.5"}
                  />
                );
              })}

              {/* Pointer Needle */}
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

              {/* Monospace Dial Readout */}
              <text
                x={dialCenter[0]}
                y={dialCenter[1] + 12}
                textAnchor="middle"
                fontSize="6"
                fontWeight="bold"
                fill="var(--anatomy-muted)"
                fontFamily="var(--anatomy-mono)"
              >
                ADDRESS
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
                {CASSETTES[activeIdx].address}
              </text>
            </g>
          );
        })()}
      </g>

      {/* ── 5. Routed Insulated Wire Conduits (Connecting Sub-assemblies) ── */}
      {(() => {
        const wireStart = [BALANCE[0] + 20, BALANCE[1], 18];
        const wireMid = [CASSETTES[0].x - 26, CASSETTES[0].y, 8];
        const wireEnd = [DIAL[0] - 14, DIAL[1], 16];
        return (
          <g className="conduit-harness">
            <g dangerouslySetInnerHTML={{ __html: k.wireSvg(at(wireStart), at(wireMid), { tone: "mid", radius: 1.5 }) }} />
            <g dangerouslySetInnerHTML={{ __html: k.wireSvg(at(wireMid), at(wireEnd), { tone: "lo", radius: 1.5 }) }} />
          </g>
        );
      })()}
    </svg>
  );
}
