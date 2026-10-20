import React from 'react';
import { HeavyBase, GuideRails, DialGauge, CoilSpring, LabelPlate } from '../../components/primitives/IsoPrimitives';
import { getIsoSlabPaths, isoProject, ISO_THEME } from '../../lib/isoMath';

/**
 * InterpreterConveyorRig
 * Physical apparatus demonstrating Python Interpreter sequential execution:
 * Punchcard code input -> Sliding PVM Carriage -> Bytecode Drum -> Live Output Tape.
 */
export default function InterpreterConveyorRig({
  workerState = {},
  currentStep = 0,
  smoothStep = 0,
  smoothNeedle = 35,
  onSelectStep,
  scale = 1.35,
  originX = 400,
  originY = 275,
}) {
  const { simulationState = {} } = workerState;
  const bytecode = simulationState.bytecode || [
    { op: 'LOAD_CONST', arg: '10' },
    { op: 'STORE_NAME', arg: 'x' },
    { op: 'LOAD_CONST', arg: "'Ignitio'" },
    { op: 'STORE_NAME', arg: 'y' },
  ];
  const output = simulationState.output || ['[PVM Ready]'];

  // Smooth continuous carriage X coordinate (-75 to +75)
  const targetX = -75 + smoothStep * 50;

  // Carriage box paths
  const carriageWidth = 56;
  const carriageDepth = 48;
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

  // Carriage center for glowing lens / laser
  const carCenter = isoProject(targetX, 0, carriageZ + carriageHeight, originX, originY, scale);

  return (
    <svg
      viewBox="0 0 800 520"
      className="w-full h-full select-none"
      style={{ overflow: 'visible' }}
    >
      <defs>
        <radialGradient id="laserGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
          <stop offset="60%" stopColor="#38bdf8" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
        </radialGradient>
      </defs>

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

      {/* 3. Compression Spring on Left Rail */}
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

      {/* 4. Sliding PVM Carriage Assembly (Smooth 60fps translation) */}
      <g className="pvm-carriage">
        <path d={carLeft} fill="#1e293b" stroke="#0f172a" strokeWidth="1.2" />
        <path d={carRight} fill="#0f172a" stroke="#0f172a" strokeWidth="1.2" />
        <path d={carTop} fill="#334155" stroke="#64748b" strokeWidth="1.2" />

        {/* Optical Sensor Aperture on Carriage */}
        <circle cx={carCenter.x} cy={carCenter.y} r="14" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
        <circle cx={carCenter.x} cy={carCenter.y} r="8" fill="#38bdf8" opacity="0.85" />
        <circle cx={carCenter.x} cy={carCenter.y} r="24" fill="url(#laserGlow)" pointerEvents="none" />

        {/* Step indicator on carriage face */}
        <text
          x={carCenter.x}
          y={carCenter.y + 22}
          textAnchor="middle"
          fontSize="9"
          fontWeight="bold"
          fill="#e2e8f0"
          fontFamily="monospace"
        >
          STEP 0{currentStep + 1}
        </text>
      </g>

      {/* 5. Bytecode Stack Rack (Interactive clickable cards) */}
      <g className="bytecode-stack">
        {bytecode.map((b, idx) => {
          const posX = -75 + idx * 50;
          const pos = isoProject(posX, -70, 20, originX, originY, scale);
          const isActive = idx === currentStep;

          return (
            <g
              key={idx}
              onClick={() => onSelectStep?.(idx)}
              className="cursor-pointer transition-all duration-300"
            >
              {/* Stand connector */}
              <line
                x1={pos.x}
                y1={pos.y}
                x2={pos.x}
                y2={pos.y - 30}
                stroke={isActive ? '#38bdf8' : '#475569'}
                strokeWidth={isActive ? '2' : '1'}
              />
              {/* Opcode Card */}
              <rect
                x={pos.x - 30}
                y={pos.y - 48}
                width="60"
                height="22"
                rx="4"
                fill={isActive ? '#0284c7' : '#0f172a'}
                stroke={isActive ? '#7dd3fc' : '#334155'}
                strokeWidth={isActive ? '1.8' : '1'}
                style={{
                  filter: isActive ? 'drop-shadow(0 0 12px rgba(56,189,248,0.6))' : 'none',
                }}
              />
              <text
                x={pos.x}
                y={pos.y - 36}
                textAnchor="middle"
                fontSize="7"
                fontWeight="bold"
                fill="#ffffff"
                fontFamily="monospace"
              >
                {b.op}
              </text>
              <text
                x={pos.x}
                y={pos.y - 28}
                textAnchor="middle"
                fontSize="6"
                fontWeight="500"
                fill={isActive ? '#e0f2fe' : '#94a3b8'}
                fontFamily="monospace"
              >
                {b.arg}
              </text>
            </g>
          );
        })}
      </g>

      {/* 6. Precision Dial Gauge: Clock / Execution Meter */}
      <DialGauge
        x={130}
        y={-80}
        z={88}
        radius={28}
        needleDeg={smoothNeedle}
        label="EXEC CLOCK"
        value={`${Math.min(100, Math.round((currentStep + 1) * 25))}%`}
        originX={originX}
        originY={originY}
        scale={scale}
        accentColor={ISO_THEME.litCyan}
      />

      {/* 7. Output Ticker Tape (Lower Right) */}
      <g className="output-ticker">
        {(() => {
          const tapePos = isoProject(40, 80, 24, originX, originY, scale);
          return (
            <g>
              <rect
                x={tapePos.x - 70}
                y={tapePos.y}
                width="140"
                height="32"
                rx="4"
                fill="#0f172a"
                stroke="#38bdf8"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              <text
                x={tapePos.x}
                y={tapePos.y + 13}
                textAnchor="middle"
                fontSize="7"
                fontWeight="bold"
                fill="#38bdf8"
                fontFamily="monospace"
              >
                TERMINAL STDOUT
              </text>
              <text
                x={tapePos.x}
                y={tapePos.y + 24}
                textAnchor="middle"
                fontSize="7"
                fontWeight="600"
                fill="#f8fafc"
                fontFamily="monospace"
              >
                {output[output.length - 1] || 'Running...'}
              </text>
            </g>
          );
        })()}
      </g>

      {/* 8. Engraved Apparatus Label Plate */}
      <LabelPlate
        x={-155}
        y={95}
        z={24}
        width={130}
        depth={32}
        title="PYTHON INTERPRETER"
        sub="PVM STEPPER RIG"
        originX={originX}
        originY={originY}
        scale={scale}
      />
    </svg>
  );
}
