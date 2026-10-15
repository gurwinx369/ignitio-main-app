import React from 'react';
import { getIsoSlabPaths, isoProject, ISO_THEME } from '../../lib/isoMath';

/**
 * Heavy Cast-Iron Bedplate
 * Built with 4 turned brass leveling feet with rubber O-rings,
 * milled perimeter oil groove, and counterbored hex socket cap screws.
 */
export const HeavyBase = ({
  x = -195,
  y = -145,
  z = 0,
  width = 390,
  depth = 290,
  height = 24,
  originX = 400,
  originY = 275,
  scale = 1.35,
}) => {
  const { topPath, leftFace, rightFace } = getIsoSlabPaths(x, y, z, width, depth, height, originX, originY, scale);

  // 4 Turned brass leveling feet under the corners
  const footOffset = 18;
  const feet = [
    isoProject(x + footOffset, y + footOffset, z, originX, originY, scale),
    isoProject(x + width - footOffset, y + footOffset, z, originX, originY, scale),
    isoProject(x + width - footOffset, y + depth - footOffset, z, originX, originY, scale),
    isoProject(x + footOffset, y + depth - footOffset, z, originX, originY, scale),
  ];

  // 4 Counterbored hex socket screws on bedplate surface
  const screwOffset = 16;
  const screws = [
    isoProject(x + screwOffset, y + screwOffset, z + height, originX, originY, scale),
    isoProject(x + width - screwOffset, y + screwOffset, z + height, originX, originY, scale),
    isoProject(x + width - screwOffset, y + depth - screwOffset, z + height, originX, originY, scale),
    isoProject(x + screwOffset, y + depth - screwOffset, z + height, originX, originY, scale),
  ];

  return (
    <g className="heavy-bedplate">
      {/* Soft Contact Ambient Occlusion Shadow */}
      <ellipse
        cx={originX}
        cy={originY + 140}
        rx={width * 0.72}
        ry={depth * 0.38}
        fill="rgba(0,0,0,0.65)"
        style={{ filter: 'blur(20px)' }}
        pointerEvents="none"
      />

      {/* 4 Turned Brass Leveling Feet with Rubber O-Rings */}
      {feet.map((f, idx) => (
        <g key={`foot-${idx}`}>
          <ellipse cx={f.x} cy={f.y + 7} rx="11" ry="5.5" fill="#0b0f19" opacity="0.8" />
          <ellipse cx={f.x} cy={f.y + 4} rx="9" ry="4.5" fill="#1e293b" stroke="#0f172a" strokeWidth="0.8" />
          <ellipse cx={f.x} cy={f.y + 1} rx="8" ry="4" fill="#b45309" stroke="#d97706" strokeWidth="1" />
          <circle cx={f.x} cy={f.y + 1} r="2" fill="#fde68a" />
        </g>
      ))}

      {/* Bedplate Cast Iron Body (4-Tone Shaded) */}
      <path d={leftFace} fill="#182030" stroke="#0c111a" strokeWidth="1.2" />
      <path d={rightFace} fill="#0d131f" stroke="#0c111a" strokeWidth="1.2" />
      <path d={topPath} fill="#232d40" stroke="#37455c" strokeWidth="1.2" />

      {/* Precision Milled Oil Groove Inset */}
      <path
        d={getIsoSlabPaths(x + 8, y + 8, z + height, width - 16, depth - 16, 1, originX, originY, scale).topPath}
        fill="none"
        stroke="#0c111c"
        strokeWidth="2"
      />
      <path
        d={getIsoSlabPaths(x + 9, y + 9, z + height, width - 18, depth - 18, 1, originX, originY, scale).topPath}
        fill="none"
        stroke="#334155"
        strokeWidth="0.8"
        opacity="0.6"
      />

      {/* Counterbored Hex Socket Screws */}
      {screws.map((s, idx) => (
        <g key={`screw-${idx}`}>
          <circle cx={s.x} cy={s.y} r="4" fill="#0f172a" stroke="#475569" strokeWidth="0.8" />
          <circle cx={s.x} cy={s.y} r="2.2" fill="#1e293b" />
          {/* Hex socket slot */}
          <line x1={s.x - 1.8} y1={s.y} x2={s.x + 1.8} y2={s.y} stroke="#94a3b8" strokeWidth="0.7" />
          <line x1={s.x} y1={s.y - 1.8} x2={s.x} y2={s.y + 1.8} stroke="#94a3b8" strokeWidth="0.7" />
        </g>
      ))}
    </g>
  );
};

/**
 * Structural Gantry Bridge
 * Twin ground-steel tubular guide rails passing through vertical stanchion pillars,
 * anchored directly into the bedplate with knurled clamp collars.
 */
export const GantryBridge = ({
  startX = -135,
  endX = 135,
  y = -85,
  z = 24,
  height = 80,
  spacing = 26,
  originX = 400,
  originY = 275,
  scale = 1.35,
}) => {
  // Left and Right stanchion foot anchor points on bedplate
  const leftAnchor = isoProject(startX, y, z, originX, originY, scale);
  const leftTop = isoProject(startX, y, z + height, originX, originY, scale);

  const rightAnchor = isoProject(endX, y, z, originX, originY, scale);
  const rightTop = isoProject(endX, y, z + height, originX, originY, scale);

  // Twin guide rail coordinates
  const rail1Start = isoProject(startX - 6, y - spacing / 2, z + height - 10, originX, originY, scale);
  const rail1End = isoProject(endX + 6, y - spacing / 2, z + height - 10, originX, originY, scale);

  const rail2Start = isoProject(startX - 6, y + spacing / 2, z + height - 10, originX, originY, scale);
  const rail2End = isoProject(endX + 6, y + spacing / 2, z + height - 10, originX, originY, scale);

  return (
    <g className="gantry-bridge">
      {/* Left Stanchion Upright Pillar */}
      <line
        x1={leftAnchor.x}
        y1={leftAnchor.y}
        x2={leftTop.x}
        y2={leftTop.y}
        stroke="#1e293b"
        strokeWidth="9"
        strokeLinecap="round"
      />
      <line
        x1={leftAnchor.x}
        y1={leftAnchor.y}
        x2={leftTop.x}
        y2={leftTop.y}
        stroke="#475569"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <line
        x1={leftAnchor.x}
        y1={leftAnchor.y}
        x2={leftTop.x}
        y2={leftTop.y}
        stroke="#94a3b8"
        strokeWidth="1.5"
        strokeDasharray="6 8"
      />
      {/* Knurled base mounting collar */}
      <ellipse cx={leftAnchor.x} cy={leftAnchor.y} rx="9" ry="4.5" fill="#334155" stroke="#64748b" strokeWidth="1" />
      <ellipse cx={leftTop.x} cy={leftTop.y} rx="7" ry="3.5" fill="#b45309" stroke="#d97706" strokeWidth="1" />

      {/* Right Stanchion Upright Pillar */}
      <line
        x1={rightAnchor.x}
        y1={rightAnchor.y}
        x2={rightTop.x}
        y2={rightTop.y}
        stroke="#1e293b"
        strokeWidth="9"
        strokeLinecap="round"
      />
      <line
        x1={rightAnchor.x}
        y1={rightAnchor.y}
        x2={rightTop.x}
        y2={rightTop.y}
        stroke="#475569"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <line
        x1={rightAnchor.x}
        y1={rightAnchor.y}
        x2={rightTop.x}
        y2={rightTop.y}
        stroke="#94a3b8"
        strokeWidth="1.5"
        strokeDasharray="6 8"
      />
      <ellipse cx={rightAnchor.x} cy={rightAnchor.y} rx="9" ry="4.5" fill="#334155" stroke="#64748b" strokeWidth="1" />
      <ellipse cx={rightTop.x} cy={rightTop.y} rx="7" ry="3.5" fill="#b45309" stroke="#d97706" strokeWidth="1" />

      {/* Ground-Steel Tubular Rail 1 (Back Rail) */}
      <line
        x1={rail1Start.x}
        y1={rail1Start.y}
        x2={rail1End.x}
        y2={rail1End.y}
        stroke="#1e293b"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <line
        x1={rail1Start.x}
        y1={rail1Start.y}
        x2={rail1End.x}
        y2={rail1End.y}
        stroke="#94a3b8"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1={rail1Start.x}
        y1={rail1Start.y}
        x2={rail1End.x}
        y2={rail1End.y}
        stroke="#ffffff"
        strokeWidth="0.8"
        strokeDasharray="12 18"
      />
      {/* Turned brass end caps */}
      <circle cx={rail1Start.x} cy={rail1Start.y} r="3.5" fill="#f59e0b" stroke="#78350f" strokeWidth="0.8" />
      <circle cx={rail1End.x} cy={rail1End.y} r="3.5" fill="#f59e0b" stroke="#78350f" strokeWidth="0.8" />

      {/* Ground-Steel Tubular Rail 2 (Front Rail) */}
      <line
        x1={rail2Start.x}
        y1={rail2Start.y}
        x2={rail2End.x}
        y2={rail2End.y}
        stroke="#1e293b"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <line
        x1={rail2Start.x}
        y1={rail2Start.y}
        x2={rail2End.x}
        y2={rail2End.y}
        stroke="#cbd5e1"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1={rail2Start.x}
        y1={rail2Start.y}
        x2={rail2End.x}
        y2={rail2End.y}
        stroke="#ffffff"
        strokeWidth="0.8"
        strokeDasharray="12 18"
      />
      <circle cx={rail2Start.x} cy={rail2Start.y} r="3.5" fill="#f59e0b" stroke="#78350f" strokeWidth="0.8" />
      <circle cx={rail2End.x} cy={rail2End.y} r="3.5" fill="#f59e0b" stroke="#78350f" strokeWidth="0.8" />
    </g>
  );
};

/**
 * Kinematic Inspection Stylus & Carriage
 * Glides along the gantry rails with bronze sleeve bushings,
 * houses a vertical solenoid plunger with coil spring that physically compresses onto the cassette pad.
 */
export const KinematicStylus = ({
  carriageX = 0,
  carriageY = 0,
  carriageZ = 94,
  isEngaged = true,
  springCompression = 0.7,
  originX = 400,
  originY = 275,
  scale = 1.35,
}) => {
  const carriageCenter = isoProject(carriageX, carriageY, carriageZ, originX, originY, scale);
  const stylusTipZ = isEngaged ? carriageZ - 36 : carriageZ - 18;
  const stylusTip = isoProject(carriageX, carriageY, stylusTipZ, originX, originY, scale);

  return (
    <g className="kinematic-stylus-assembly">
      {/* Optical Alignment Halo */}
      {isEngaged && (
        <circle
          cx={stylusTip.x}
          cy={stylusTip.y}
          r="16"
          fill="url(#probeLaserGlow)"
          pointerEvents="none"
        />
      )}

      {/* Bronze Sleeve Bushing Blocks */}
      <ellipse cx={carriageCenter.x - 8} cy={carriageCenter.y - 2} rx="6" ry="3.5" fill="#b45309" stroke="#78350f" strokeWidth="1" />
      <ellipse cx={carriageCenter.x + 8} cy={carriageCenter.y + 2} rx="6" ry="3.5" fill="#b45309" stroke="#78350f" strokeWidth="1" />

      {/* Carriage Machined Aluminum Chassis */}
      <rect
        x={carriageCenter.x - 14}
        y={carriageCenter.y - 12}
        width="28"
        height="18"
        rx="3"
        fill="#1e293b"
        stroke="#64748b"
        strokeWidth="1.2"
        style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))' }}
      />
      {/* Knurled thumbscrew lock on top */}
      <circle cx={carriageCenter.x} cy={carriageCenter.y - 12} r="4" fill="#d97706" stroke="#78350f" strokeWidth="0.8" />
      <circle cx={carriageCenter.x} cy={carriageCenter.y - 12} r="1.5" fill="#fde68a" />

      {/* Solenoid Vertical Barrel */}
      <line
        x1={carriageCenter.x}
        y1={carriageCenter.y}
        x2={stylusTip.x}
        y2={stylusTip.y}
        stroke="#475569"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <line
        x1={carriageCenter.x}
        y1={carriageCenter.y}
        x2={stylusTip.x}
        y2={stylusTip.y}
        stroke="#94a3b8"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Visible Helical Coil Spring around Stylus Shaft */}
      {(() => {
        const coils = 6;
        const springLen = stylusTip.y - carriageCenter.y;
        const coilD = [];
        for (let i = 0; i < coils; i++) {
          const cy = carriageCenter.y + (i / coils) * springLen;
          coilD.push(`M ${carriageCenter.x - 5} ${cy} Q ${carriageCenter.x + 5} ${cy + 2.5} ${carriageCenter.x - 5} ${cy + 5}`);
        }
        return (
          <path
            d={coilD.join(' ')}
            fill="none"
            stroke={isEngaged ? '#38bdf8' : '#94a3b8'}
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        );
      })()}

      {/* Spherical Tungsten Contact Tip */}
      <circle
        cx={stylusTip.x}
        cy={stylusTip.y}
        r={isEngaged ? '4.5' : '3.5'}
        fill={isEngaged ? '#38bdf8' : '#cbd5e1'}
        stroke="#ffffff"
        strokeWidth="1.2"
        style={{ filter: isEngaged ? 'drop-shadow(0 0 8px #38bdf8)' : 'none' }}
      />
    </g>
  );
};

/**
 * Heavy Precision Dial Gauge Meter
 * Solid cast-metal cylindrical housing with knurled swivel mount,
 * screw-retained brass bezel, illuminated precision ticks, and damped needle with inertia.
 */
export const PrecisionDialGauge = ({
  x = 135,
  y = -60,
  z = 95,
  radius = 32,
  needleDeg = 45,
  label = "ADDRESS ID",
  value = "0x7FF0",
  originX = 400,
  originY = 275,
  scale = 1.35,
  accentColor = ISO_THEME.litAmber,
}) => {
  const center = isoProject(x, y, z, originX, originY, scale);
  const stemBase = isoProject(x, y, 24, originX, originY, scale);

  // Generate radial ticks around dial
  const ticks = [];
  const tickCount = 16;
  for (let i = 0; i < tickCount; i++) {
    const angle = (i / tickCount) * Math.PI * 2;
    const r1 = radius - 6;
    const r2 = radius - 2;
    const x1 = center.x + Math.cos(angle) * r1 * 0.95;
    const y1 = center.y + Math.sin(angle) * r1 * 0.58;
    const x2 = center.x + Math.cos(angle) * r2 * 0.95;
    const y2 = center.y + Math.sin(angle) * r2 * 0.58;
    ticks.push({ x1, y1, x2, y2, isMajor: i % 4 === 0 });
  }

  // Needle tip with smooth angle
  const rad = (needleDeg * Math.PI) / 180;
  const needleLen = radius - 8;
  const tipX = center.x + Math.cos(rad) * needleLen * 0.95;
  const tipY = center.y + Math.sin(rad) * needleLen * 0.58;

  // Counterweight on opposite end
  const cwX = center.x - Math.cos(rad) * 6 * 0.95;
  const cwY = center.y - Math.sin(rad) * 6 * 0.58;

  return (
    <g className="precision-dial-gauge">
      {/* Heavy Steel Stem anchored into Bedplate */}
      <line
        x1={stemBase.x}
        y1={stemBase.y}
        x2={center.x}
        y2={center.y + 14}
        stroke="#1e293b"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <line
        x1={stemBase.x}
        y1={stemBase.y}
        x2={center.x}
        y2={center.y + 14}
        stroke="#64748b"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Knurled swivel adjustment collar */}
      <ellipse cx={stemBase.x} cy={stemBase.y} rx="9" ry="4.5" fill="#334155" stroke="#475569" strokeWidth="1" />
      <ellipse cx={center.x} cy={center.y + 14} rx="7" ry="3.5" fill="#b45309" stroke="#d97706" strokeWidth="1" />

      {/* Cast Metal Housing Drop Shadow */}
      <ellipse
        cx={center.x + 3}
        cy={center.y + 5}
        rx={radius + 4}
        ry={(radius + 4) * 0.6}
        fill="rgba(0,0,0,0.65)"
        style={{ filter: 'blur(6px)' }}
      />

      {/* Outer Cast-Iron Housing Bezel */}
      <ellipse
        cx={center.x}
        cy={center.y}
        rx={radius}
        ry={radius * 0.6}
        fill="#111827"
        stroke="#475569"
        strokeWidth="3"
      />

      {/* Screwed Retaining Brass Rim */}
      <ellipse
        cx={center.x}
        cy={center.y}
        rx={radius - 2}
        ry={(radius - 2) * 0.6}
        fill="none"
        stroke="#b45309"
        strokeWidth="1.2"
      />

      {/* Inner Dial Face Plate */}
      <ellipse
        cx={center.x}
        cy={center.y}
        rx={radius - 4}
        ry={(radius - 4) * 0.6}
        fill="#0b0f19"
        stroke="#1e293b"
        strokeWidth="1"
      />

      {/* Radial Calibration Ticks */}
      {ticks.map((t, idx) => (
        <line
          key={idx}
          x1={t.x1}
          y1={t.y1}
          x2={t.x2}
          y2={t.y2}
          stroke={t.isMajor ? accentColor : '#475569'}
          strokeWidth={t.isMajor ? '1.8' : '0.9'}
        />
      ))}

      {/* Needle Assembly (Needle + Counterweight + Brass Pivot) */}
      <line
        x1={cwX}
        y1={cwY}
        x2={tipX}
        y2={tipY}
        stroke={accentColor}
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Counterweight disc */}
      <circle cx={cwX} cy={cwY} r="2.5" fill="#cbd5e1" stroke="#0f172a" strokeWidth="0.8" />
      {/* Center Pivot Cap */}
      <circle cx={center.x} cy={center.y} r="3.5" fill="#fde68a" stroke="#78350f" strokeWidth="1" />

      {/* Curved Glass Specular Arc Reflection */}
      <path
        d={`M ${center.x - radius * 0.6} ${center.y - radius * 0.3} 
            A ${radius * 0.7} ${(radius * 0.7) * 0.6} 0 0 1 ${center.x + radius * 0.6} ${center.y - radius * 0.3}`}
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.2"
        opacity="0.35"
        strokeLinecap="round"
      />

      {/* High-Contrast Monospace Labels */}
      <text
        x={center.x}
        y={center.y + 14}
        textAnchor="middle"
        fontSize="7.5"
        fontWeight="bold"
        fill="#94a3b8"
        fontFamily="monospace"
        letterSpacing="0.08em"
      >
        {label}
      </text>
      <text
        x={center.x}
        y={center.y - 9}
        textAnchor="middle"
        fontSize="9"
        fontWeight="800"
        fill={accentColor}
        fontFamily="monospace"
      >
        {value}
      </text>
    </g>
  );
};

/**
 * Metal Engraved Label Plate
 */
export const LabelPlate = ({
  x = -155,
  y = 95,
  z = 24,
  width = 130,
  depth = 32,
  title = "PYTHON MEMORY VAULT",
  sub = "VARIABLE REFERENCE RIG",
  originX = 400,
  originY = 275,
  scale = 1.35,
}) => {
  const { topPath } = getIsoSlabPaths(x, y, z, width, depth, 1, originX, originY, scale);
  const center = isoProject(x + width / 2, y + depth / 2, z + 2, originX, originY, scale);

  return (
    <g className="label-plate">
      <path d={topPath} fill="#090d16" stroke="#475569" strokeWidth="1" />
      <text
        x={center.x}
        y={center.y - 3}
        textAnchor="middle"
        fontSize="8"
        fontWeight="800"
        fill="#f8fafc"
        fontFamily="monospace"
        letterSpacing="0.1em"
      >
        {title}
      </text>
      <text
        x={center.x}
        y={center.y + 7}
        textAnchor="middle"
        fontSize="6"
        fontWeight="600"
        fill="#64748b"
        fontFamily="monospace"
      >
        {sub}
      </text>
    </g>
  );
};

// Re-export old primitives for backwards compatibility
export const DialGauge = PrecisionDialGauge;
export const GuideRails = GantryBridge;
export const CoilSpring = () => null;
export const KnurledKnob = () => null;
