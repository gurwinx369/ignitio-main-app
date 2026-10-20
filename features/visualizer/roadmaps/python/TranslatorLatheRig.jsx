import React from 'react';
import { HeavyBase, DialGauge, LabelPlate } from '../../components/primitives/IsoPrimitives';
import { getIsoSlabPaths, isoProject, ISO_THEME } from '../../lib/isoMath';

/**
 * TranslatorLatheRig
 * Physical apparatus demonstrating Python as a human-to-computer translator.
 * Enhanced with continuous rotation and interactive phase selection.
 */
export default function TranslatorLatheRig({
  workerState = {},
  currentStep = 0,
  smoothStep = 0,
  smoothNeedle = 35,
  onSelectStep,
  scale = 1.35,
  originX = 400,
  originY = 275,
}) {
  const translationPhases = [
    { label: "1. Human Input", source: "print('Hello')", binary: "...", mode: "SOURCE" },
    { label: "2. Syntax Lexer", source: "TOKEN: PRINT", binary: "01001...", mode: "TOKENS" },
    { label: "3. Bytecode", source: "LOAD_CONST 0", binary: "110001...", mode: "BYTECODE" },
    { label: "4. Machine Code", source: "CPU (1/0)", binary: "01001000", mode: "BINARY" },
  ];

  const phase = translationPhases[currentStep % translationPhases.length];

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

      {/* 2. Left Input Feeder (High-Level Punchcard) */}
      <g
        className="input-feeder cursor-pointer"
        onClick={() => onSelectStep?.(0)}
      >
        {(() => {
          const { topPath, leftFace, rightFace } = getIsoSlabPaths(-135, -55, 24, 65, 95, 48, originX, originY, scale);
          const topCenter = isoProject(-102, -7, 72, originX, originY, scale);

          return (
            <g>
              <path d={leftFace} fill="#1e293b" stroke="#0f172a" strokeWidth="1" />
              <path d={rightFace} fill="#0f172a" stroke="#0f172a" strokeWidth="1" />
              <path d={topPath} fill="#334155" stroke="#64748b" strokeWidth="1.2" />

              {/* Punch tape ribbon */}
              <rect
                x={topCenter.x - 24}
                y={topCenter.y - 13}
                width="48"
                height="26"
                rx="3"
                fill="#f8fafc"
                stroke="#cbd5e1"
                strokeWidth="1"
              />
              <text
                x={topCenter.x}
                y={topCenter.y + 4}
                textAnchor="middle"
                fontSize="6.5"
                fontWeight="800"
                fill="#0f172a"
                fontFamily="monospace"
              >
                {phase.source}
              </text>
            </g>
          );
        })()}
      </g>

      {/* 3. Central Translation Lathe Drum (Animated rotation) */}
      <g
        className="lathe-drum cursor-pointer"
        onClick={() => onSelectStep?.(1)}
      >
        {(() => {
          const { topPath, leftFace, rightFace } = getIsoSlabPaths(-45, -45, 24, 90, 90, 58, originX, originY, scale);
          const drumCenter = isoProject(0, 0, 82, originX, originY, scale);
          const rotationAngle = (smoothStep * 90) % 360;

          return (
            <g>
              <path d={leftFace} fill="#0284c7" stroke="#0f172a" strokeWidth="1" />
              <path d={rightFace} fill="#0369a1" stroke="#0f172a" strokeWidth="1" />
              <path
                d={topPath}
                fill="#38bdf8"
                stroke="#bae6fd"
                strokeWidth="1.5"
                style={{ filter: 'drop-shadow(0 0 16px rgba(56,189,248,0.5))' }}
              />

              {/* Rotary Gear Center with rotation */}
              <g style={{ transformOrigin: `${drumCenter.x}px ${drumCenter.y}px`, transform: `rotate(${rotationAngle}deg)` }}>
                <circle cx={drumCenter.x} cy={drumCenter.y} r="20" fill="#0f172a" stroke="#ffffff" strokeWidth="2" />
                <line x1={drumCenter.x - 16} y1={drumCenter.y} x2={drumCenter.x + 16} y2={drumCenter.y} stroke="#38bdf8" strokeWidth="2" />
                <line x1={drumCenter.x} y1={drumCenter.y - 16} x2={drumCenter.x} y2={drumCenter.y + 16} stroke="#38bdf8" strokeWidth="2" />
                <circle cx={drumCenter.x} cy={drumCenter.y} r="10" fill="#38bdf8" />
              </g>

              {/* Rotation label */}
              <text
                x={drumCenter.x}
                y={drumCenter.y + 26}
                textAnchor="middle"
                fontSize="8.5"
                fontWeight="800"
                fill="#ffffff"
                fontFamily="monospace"
              >
                TRANSLATOR
              </text>
            </g>
          );
        })()}
      </g>

      {/* 4. Right Binary Output Chamber */}
      <g
        className="binary-chamber cursor-pointer"
        onClick={() => onSelectStep?.(3)}
      >
        {(() => {
          const { topPath, leftFace, rightFace } = getIsoSlabPaths(75, -55, 24, 65, 95, 48, originX, originY, scale);
          const topCenter = isoProject(107, -7, 72, originX, originY, scale);

          return (
            <g>
              <path d={leftFace} fill="#1e293b" stroke="#0f172a" strokeWidth="1" />
              <path d={rightFace} fill="#0f172a" stroke="#0f172a" strokeWidth="1" />
              <path d={topPath} fill="#10b981" stroke="#a7f3d0" strokeWidth="1.2" />

              {/* Binary LED Matrix Display */}
              <rect
                x={topCenter.x - 26}
                y={topCenter.y - 13}
                width="52"
                height="26"
                rx="3"
                fill="#064e3b"
                stroke="#34d399"
                strokeWidth="1.2"
              />
              <text
                x={topCenter.x}
                y={topCenter.y + 4}
                textAnchor="middle"
                fontSize="7.5"
                fontWeight="800"
                fill="#6ee7b7"
                fontFamily="monospace"
              >
                {phase.binary}
              </text>
            </g>
          );
        })()}
      </g>

      {/* 5. Precision Dial Gauge: Signal Translation Fidelity */}
      <DialGauge
        x={135}
        y={-90}
        z={88}
        radius={28}
        needleDeg={smoothNeedle}
        label="BINARY"
        value={phase.mode}
        originX={originX}
        originY={originY}
        scale={scale}
        accentColor={ISO_THEME.litGreen}
      />

      {/* 6. Engraved Apparatus Label Plate */}
      <LabelPlate
        x={-155}
        y={95}
        z={24}
        width={130}
        depth={32}
        title="TRANSLATOR LATHE"
        sub="SOURCE TO BINARY RIG"
        originX={originX}
        originY={originY}
        scale={scale}
      />
    </svg>
  );
}
