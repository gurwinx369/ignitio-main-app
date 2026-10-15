import React from 'react';
import { HeavyBase, DialGauge, LabelPlate } from '../../components/primitives/IsoPrimitives';
import { getIsoSlabPaths, isoProject, ISO_THEME } from '../../lib/isoMath';

/**
 * TypeInspectorRig
 * Physical apparatus demonstrating Python automatic type inference and id() memory inspection.
 * Enhanced with 60fps continuous caliper tracking and interactive vial selection.
 */
export default function TypeInspectorRig({
  workerState = {},
  currentStep = 0,
  smoothStep = 0,
  smoothNeedle = 35,
  onSelectStep,
  scale = 1.35,
  originX = 400,
  originY = 275,
}) {
  const typeVials = [
    { typeName: 'int', example: '10', color: '#38bdf8', hexId: '0x10A9B0' },
    { typeName: 'str', example: "'Python'", color: '#a855f7', hexId: '0x22C7E4' },
    { typeName: 'float', example: '3.14', color: '#f59e0b', hexId: '0x33F891' },
    { typeName: 'bool', example: 'True', color: '#10b981', hexId: '0x00A1F0' },
  ];

  const activeIndex = currentStep % typeVials.length;
  const active = typeVials[activeIndex];

  // Caliper X coordinate continuously follows smoothStep
  const caliperIdx = smoothStep % typeVials.length;
  const caliperPosX = -95 + caliperIdx * 62;
  const clampPos = isoProject(caliperPosX, 0, 80, originX, originY, scale);

  return (
    <svg
      viewBox="0 0 800 520"
      className="w-full h-full select-none"
      style={{ overflow: 'visible' }}
    >
      {/* 1. Heavy Base Plate */}
      <HeavyBase
        x={-195}
        y={-145}
        z={0}
        width={390}
        depth={290}
        height={24}
        originX={originX}
        originY={originY}
        scale={scale}
      />

      {/* 2. Analytical Centrifuge Rack holding 4 Type Vials */}
      <g className="type-centrifuge">
        {typeVials.map((v, idx) => {
          const posX = -95 + idx * 62;
          const posZ = 24;
          const isActive = idx === activeIndex;

          const { topPath, leftFace, rightFace } = getIsoSlabPaths(
            posX - 20,
            -22,
            posZ,
            40,
            44,
            isActive ? 52 : 38,
            originX,
            originY,
            scale
          );

          const center = isoProject(posX, 0, posZ + (isActive ? 52 : 38), originX, originY, scale);

          return (
            <g
              key={v.typeName}
              onClick={() => onSelectStep?.(idx)}
              className="cursor-pointer transition-all duration-300"
            >
              <path d={leftFace} fill={isActive ? '#1e293b' : '#0f172a'} stroke="#0f172a" strokeWidth="1" />
              <path d={rightFace} fill="#090d16" stroke="#0f172a" strokeWidth="1" />
              <path
                d={topPath}
                fill={isActive ? v.color : '#334155'}
                stroke={isActive ? '#ffffff' : '#64748b'}
                strokeWidth={isActive ? '2' : '1'}
                style={{
                  filter: isActive ? `drop-shadow(0 0 14px ${v.color})` : 'none',
                  transition: 'all 0.25s ease',
                }}
              />

              {/* Glass Test Tube Vial */}
              <circle
                cx={center.x}
                cy={center.y - 14}
                r={isActive ? 13 : 9.5}
                fill={isActive ? v.color : '#1e293b'}
                stroke={isActive ? '#ffffff' : '#475569'}
                strokeWidth={isActive ? '2' : '1'}
                opacity={isActive ? 0.95 : 0.6}
              />
              <text
                x={center.x}
                y={center.y - 11}
                textAnchor="middle"
                fontSize="7.5"
                fontWeight="800"
                fill={isActive ? '#000000' : '#94a3b8'}
                fontFamily="monospace"
              >
                {v.example}
              </text>

              {/* Type Plaque */}
              <text
                x={center.x}
                y={center.y + 20}
                textAnchor="middle"
                fontSize="8.5"
                fontWeight="bold"
                fill={isActive ? v.color : '#64748b'}
                fontFamily="monospace"
              >
                &lt;{v.typeName}&gt;
              </text>
            </g>
          );
        })}
      </g>

      {/* 3. Optical Caliper Arm continuously gliding across vials */}
      <g className="caliper-arm">
        <line
          x1={clampPos.x}
          y1={clampPos.y - 32}
          x2={clampPos.x}
          y2={clampPos.y}
          stroke={active.color}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Caliper claws */}
        <path
          d={`M ${clampPos.x - 15} ${clampPos.y} L ${clampPos.x} ${clampPos.y - 7} L ${clampPos.x + 15} ${clampPos.y}`}
          fill="none"
          stroke={active.color}
          strokeWidth="2.2"
        />
        <circle cx={clampPos.x} cy={clampPos.y - 32} r="4.5" fill="#cbd5e1" stroke="#0f172a" strokeWidth="1" />
      </g>

      {/* 4. Precision Dial Gauge: Memory id() Hex Address */}
      <DialGauge
        x={135}
        y={-70}
        z={90}
        radius={28}
        needleDeg={smoothNeedle}
        label="id(var)"
        value={active.hexId}
        originX={originX}
        originY={originY}
        scale={scale}
        accentColor={active.color}
      />

      {/* 5. Engraved Apparatus Label Plate */}
      <LabelPlate
        x={-155}
        y={95}
        z={24}
        width={130}
        depth={32}
        title="TYPE & MEMORY CALIPER"
        sub="AUTOMATIC TYPE INFERENCE"
        originX={originX}
        originY={originY}
        scale={scale}
      />
    </svg>
  );
}
