import React from 'react';
import { HeavyBase, GuideRails, DialGauge, CoilSpring, LabelPlate } from '../../components/primitives/IsoPrimitives';
import { getIsoSlabPaths, isoProject, ISO_THEME } from '../../lib/isoMath';

/**
 * GenericConceptRig
 * Versatile high-precision physical test rig for any concept.
 * Enhanced with 60fps continuous spring carriage and interactive phase selection.
 */
export default function GenericConceptRig({
  conceptTitle = "Python Concept",
  workerState = {},
  currentStep = 0,
  smoothStep = 0,
  smoothNeedle = 35,
  onSelectStep,
  scale = 1.35,
  originX = 400,
  originY = 275,
}) {
  const targetX = -65 + smoothStep * 44;
  const carriageWidth = 54;
  const carriageDepth = 46;
  const carriageHeight = 32;
  const carriageZ = 28;

  const { topPath: carTop, leftFace: carLeft, rightFace: carRight } = getIsoSlabPaths(
    targetX - carriageWidth / 2,
    -carriageDepth / 2,
    carriageZ,
    carriageWidth,
    carriageDepth,
    carriageHeight,
    originX,
    originY,
    scale
  );

  const carCenter = isoProject(targetX, 0, carriageZ + carriageHeight, originX, originY, scale);

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

      {/* 2. Stainless Steel Guide Rails */}
      <GuideRails
        startX={-125}
        endX={125}
        y={0}
        z={24}
        spacing={40}
        originX={originX}
        originY={originY}
        scale={scale}
      />

      {/* 3. Compression Spring */}
      <CoilSpring
        startX={-120}
        endX={targetX - carriageWidth / 2}
        y={0}
        z={24}
        coils={7}
        radius={7}
        originX={originX}
        originY={originY}
        scale={scale}
        color={ISO_THEME.litCyan}
      />

      {/* 4. Sliding Transformation Carriage (Smooth continuous follow) */}
      <g
        className="concept-carriage cursor-pointer"
        onClick={() => onSelectStep?.((currentStep + 1) % 4)}
      >
        <path d={carLeft} fill="#1e293b" stroke="#0f172a" strokeWidth="1.2" />
        <path d={carRight} fill="#0f172a" stroke="#0f172a" strokeWidth="1.2" />
        <path d={carTop} fill="#334155" stroke="#64748b" strokeWidth="1.2" />

        <circle cx={carCenter.x} cy={carCenter.y} r="13" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
        <circle cx={carCenter.x} cy={carCenter.y} r="7" fill="#38bdf8" />

        <text
          x={carCenter.x}
          y={carCenter.y + 22}
          textAnchor="middle"
          fontSize="8.5"
          fontWeight="bold"
          fill="#cbd5e1"
          fontFamily="monospace"
        >
          PHASE {currentStep + 1}
        </text>
      </g>

      {/* 5. Precision Dial Gauge */}
      <DialGauge
        x={130}
        y={-80}
        z={88}
        radius={28}
        needleDeg={smoothNeedle}
        label="METRIC"
        value={`${(currentStep + 1) * 25}%`}
        originX={originX}
        originY={originY}
        scale={scale}
        accentColor={ISO_THEME.litCyan}
      />

      {/* 6. Engraved Apparatus Label Plate */}
      <LabelPlate
        x={-155}
        y={95}
        z={24}
        width={130}
        depth={32}
        title={conceptTitle.slice(0, 18).toUpperCase()}
        sub="ANATOMY RIG"
        originX={originX}
        originY={originY}
        scale={scale}
      />
    </svg>
  );
}
