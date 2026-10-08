"use client";

import { useEffect, useRef } from "react";

export function CanvasBackground() {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const finePointer = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    ).matches;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (!finePointer || reduceMotion) return;

    let frame = 0;
    let x = 0;
    let y = 0;

    const apply = () => {
      frame = 0;
      const rect = root.getBoundingClientRect();
      root.style.setProperty("--mx", `${x - rect.left}px`);
      root.style.setProperty("--my", `${y - rect.top}px`);
      root.dataset.pointer = "on";
    };

    const onMove = (event) => {
      x = event.clientX;
      y = event.clientY;
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      root.dataset.pointer = "off";
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="rm-canvas pointer-events-none absolute inset-0 -z-10"
    >
      <div className="rm-canvas-aurora absolute inset-0" />
      <div className="rm-canvas-dots absolute inset-0" />
      <div className="rm-canvas-spot absolute inset-0" />
      <div className="rm-canvas-spot-dots absolute inset-0" />
      <div className="rm-canvas-vignette absolute inset-0" />
    </div>
  );
}
