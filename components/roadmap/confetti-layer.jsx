"use client";

import { useEffect } from "react";

const BIG_COLORS = ["#5eead4", "#a5b4fc", "#fdba74", "#5cc8ff", "#fcf5ee"];

const rand = (seed) => {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

function BurstView({ burst, onDone }) {
  const big = burst.kind === "big";
  const colors = burst.colors ?? BIG_COLORS;
  const count = big ? 44 : 10;
  const radius = big ? 190 : 44;

  useEffect(() => {
    const id = window.setTimeout(() => onDone(burst.id), big ? 2600 : 1400);
    return () => window.clearTimeout(id);
  }, [burst.id, big, onDone]);

  const pieces = Array.from({ length: count }, (_, i) => {
    const seed = burst.id * 100 + i;
    const angle = (i / count) * Math.PI * 2 + rand(seed) * 0.6;
    const distance = radius * (0.45 + rand(seed + 1) * 0.75);
    const width = big ? 6 + rand(seed + 2) * 6 : 4 + rand(seed + 2) * 2;
    const isDot = rand(seed + 3) > 0.55;
    return {
      key: i,
      style: {
        "--c": colors[i % colors.length],
        "--w": `${width}px`,
        "--h": `${isDot ? width : width * 0.5}px`,
        "--br": isDot ? "9999px" : "2px",
        "--dx": `${Math.cos(angle) * distance}px`,
        "--dy": `${Math.sin(angle) * distance - (big ? 50 : 8)}px`,
        "--rot": `${(rand(seed + 4) - 0.5) * 720}deg`,
        "--fall": big ? "130px" : "18px",
        "--t": big
          ? `${1.5 + rand(seed + 5) * 0.7}s`
          : `${0.7 + rand(seed + 5) * 0.2}s`,
        "--dl": `${Math.round(rand(seed + 6) * (big ? 120 : 40))}ms`,
      },
    };
  });

  return (
    <div className="absolute" style={{ left: burst.x, top: burst.y }}>
      <span
        className="rm-shock"
        style={{ "--c": colors[0], "--scale": big ? 9 : 3 }}
      />
      {pieces.map((piece) => (
        <span
          key={piece.key}
          className="rm-confetti-piece"
          style={piece.style}
        />
      ))}
    </div>
  );
}

export function ConfettiLayer({ bursts, onDone }) {
  return (
    <div
      aria-hidden="true"
      className="rm-confetti pointer-events-none fixed inset-0 z-55 overflow-hidden"
    >
      {bursts.map((burst) => (
        <BurstView key={burst.id} burst={burst} onDone={onDone} />
      ))}
    </div>
  );
}
