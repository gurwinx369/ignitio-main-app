"use client";

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Info } from "lucide-react";

// ─── helpers ───────────────────────────────────────────────────────────────────

function pad(n) {
  return String(n).padStart(2, "0");
}

/** Parse "HH:MM" → { h, m } */
function parseTime(value) {
  if (!value) return { h: 8, m: 0 };
  const [h, m] = value.split(":").map(Number);
  return { h: isNaN(h) ? 8 : h, m: isNaN(m) ? 0 : m };
}

/** Format { h, m } → "HH:MM" */
function formatTime(h, m) {
  return `${pad(h)}:${pad(m)}`;
}

/**
 * Convert angle (degrees, 0° = top / 12 o'clock, clockwise)
 * → { x, y } at radius r from origin
 */
function angleToXY(angleDeg, r) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: r * Math.cos(rad), y: r * Math.sin(rad) };
}

/** Convert pointer offset (dx, dy from circle centre) → angle in [0, 360) */
function xyToAngle(dx, dy) {
  const rad = Math.atan2(dy, dx);
  let deg = (rad * 180) / Math.PI + 90;
  if (deg < 0) deg += 360;
  return deg;
}

// ─── ClockDial ─────────────────────────────────────────────────────────────────

const DIAL_OUTER_R = 116; // outer number ring radius
const THUMB_R = 18;       // draggable thumb radius

function ClockDial({ mode, value, onChange, onClamp, min, max, reducedMotion }) {
  const svgRef = useRef(null);
  const dragging = useRef(false);

  const MARGIN = THUMB_R + 28;
  const SIZE = (DIAL_OUTER_R + MARGIN) * 2;
  const CX = SIZE / 2;
  const CY = SIZE / 2;

  // Outer ring labels
  const OUTER_LABELS =
    mode === "hours"
      ? [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
      : [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  // ── angle ↔ value conversion ──────────────────────────────────────────────

  function valueToAngle(v) {
    if (mode === "hours") {
      const h12 = v % 12; // 0–11 (12 maps to 0)
      return (h12 / 12) * 360;
    }
    // minutes: snap to nearest 5 on the dial face but value is exact
    return (v / 60) * 360;
  }

  function angleToValue(angleDeg) {
    if (mode === "hours") {
      // 12 hour positions
      const slot = Math.round((angleDeg / 360) * 12) % 12; // 0–11
      const isPM = value >= 12;
      return isPM ? slot + 12 : slot; // Add 12 if we are currently in PM mode
    }
    // minutes: 12 positions × 5 minutes
    const slot = Math.round((angleDeg / 360) * 12) % 12;
    return slot * 5; // 0,5,10,...55
  }

  // ── pointer handling ──────────────────────────────────────────────────────

  function resolvePointer(e) {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const src = e.touches ? e.touches[0] : e;
    return { dx: src.clientX - cx, dy: src.clientY - cy };
  }

  const processPointer = useCallback(
    (e) => {
      if (!dragging.current) return;
      const pos = resolvePointer(e);
      if (!pos) return;
      const { dx, dy } = pos;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const angle = xyToAngle(dx, dy);
      let v = angleToValue(angle);
      let clamped = false;
      if (min !== undefined && v < min) { v = min; clamped = true; }
      if (max !== undefined && v > max) { v = max; clamped = true; }
      
      if (onClamp) onClamp(clamped);
      onChange(v);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mode, min, max, onChange]
  );

  const onPointerDown = useCallback(
    (e) => {
      dragging.current = true;
      processPointer(e);
    },
    [processPointer]
  );
  const onPointerUp = useCallback(() => { dragging.current = false; }, []);

  useEffect(() => {
    window.addEventListener("pointermove", processPointer);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("touchmove", processPointer, { passive: true });
    window.addEventListener("touchend", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", processPointer);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("touchmove", processPointer);
      window.removeEventListener("touchend", onPointerUp);
    };
  }, [processPointer, onPointerUp]);

  // ── geometry ──────────────────────────────────────────────────────────────

  const angle = valueToAngle(value);
  const thumbXY = angleToXY(angle, DIAL_OUTER_R - THUMB_R * 0.15);
  const handTipXY = angleToXY(angle, DIAL_OUTER_R - THUMB_R);

  const springTransition = reducedMotion
    ? { duration: 0 }
    : { type: "spring", stiffness: 340, damping: 28 };

  return (
    <svg
      ref={svgRef}
      width={SIZE}
      height={SIZE}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      onPointerDown={onPointerDown}
      role="slider"
      aria-label={mode === "hours" ? "Select hour" : "Select minute"}
      aria-valuemin={0}
      aria-valuemax={mode === "hours" ? 23 : 59}
      aria-valuenow={value}
      style={{ touchAction: "none", cursor: "pointer", display: "block" }}
    >
      {/* Face background */}
      <circle cx={CX} cy={CY} r={DIAL_OUTER_R + 16} fill="#FFF8F2" />

      {/* Outer ring border */}
      <circle
        cx={CX}
        cy={CY}
        r={DIAL_OUTER_R + 16}
        fill="none"
        stroke="#FFDCBC"
        strokeWidth={2}
      />

      {/* Subtle inner guide circles */}
      <circle cx={CX} cy={CY} r={DIAL_OUTER_R} fill="none" stroke="#FFE8D2" strokeWidth={1} strokeDasharray="2 4" />

      {/* Hand stem */}
      <motion.line
        x1={CX}
        y1={CY}
        x2={CX + handTipXY.x}
        y2={CY + handTipXY.y}
        stroke="#00A9FF"
        strokeWidth={2.5}
        strokeLinecap="round"
        animate={{ x2: CX + handTipXY.x, y2: CY + handTipXY.y }}
        transition={springTransition}
      />

      {/* Centre dot */}
      <circle cx={CX} cy={CY} r={5} fill="#00A9FF" />

      {/* Thumb */}
      <motion.circle
        cx={CX + thumbXY.x}
        cy={CY + thumbXY.y}
        r={THUMB_R}
        fill="#00A9FF"
        animate={{ cx: CX + thumbXY.x, cy: CY + thumbXY.y }}
        transition={springTransition}
        style={{ filter: "drop-shadow(0 3px 8px rgba(0,169,255,0.38))" }}
      />

      {/* Outer ring numbers */}
      {OUTER_LABELS.map((label, idx) => {
        const a = (idx / 12) * 360;
        const { x, y } = angleToXY(a, DIAL_OUTER_R);
        const active =
          mode === "hours"
            ? value % 12 === (label === 12 ? 0 : label)
            : value === label;
        return (
          <text
            key={`o-${label}`}
            x={CX + x}
            y={CY + y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={13}
            fontWeight={active ? "700" : "500"}
            fontFamily="Outfit, system-ui, sans-serif"
            fill={active ? "#ffffff" : "#44677D"}
            style={{ pointerEvents: "none", userSelect: "none" }}
          >
            {mode === "hours" ? label : pad(label)}
          </text>
        );
      })}
    </svg>
  );
}

// ─── TimeDisplay ───────────────────────────────────────────────────────────────

function TimeDisplay({ h, m, ampm, mode, onSelectMode, onToggleAmPm }) {
  const displayH = h % 12 === 0 ? 12 : h % 12;

  return (
    <div className="flex items-center justify-center gap-1 select-none">
      {/* Hours segment */}
      <button
        type="button"
        onClick={() => onSelectMode("hours")}
        aria-label="Edit hours"
        className={`min-w-[76px] rounded-2xl px-3 py-2 text-center text-5xl font-bold leading-none outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-[#00A9FF] ${
          mode === "hours"
            ? "bg-[#A8E2FF] text-[#001D32]"
            : "bg-[#FFF3EB] text-[#44677D] hover:bg-[#FFE8D2]"
        }`}
        style={{ fontFamily: "Outfit, system-ui, sans-serif" }}
      >
        {pad(displayH)}
      </button>

      <span
        className="text-4xl font-bold leading-none text-[#44677D]"
        style={{ marginBottom: 2 }}
      >
        :
      </span>

      {/* Minutes segment */}
      <button
        type="button"
        onClick={() => onSelectMode("minutes")}
        aria-label="Edit minutes"
        className={`min-w-[76px] rounded-2xl px-3 py-2 text-center text-5xl font-bold leading-none outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-[#00A9FF] ${
          mode === "minutes"
            ? "bg-[#A8E2FF] text-[#001D32]"
            : "bg-[#FFF3EB] text-[#44677D] hover:bg-[#FFE8D2]"
        }`}
        style={{ fontFamily: "Outfit, system-ui, sans-serif" }}
      >
        {pad(m)}
      </button>

      {/* AM / PM toggle */}
      <div className="ml-2 flex flex-col gap-1">
        {["AM", "PM"].map((p) => (
          <button
            key={p}
            type="button"
            aria-label={p}
            aria-pressed={ampm === p}
            className={`rounded-lg px-2.5 py-1 text-xs font-bold uppercase tracking-wide outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-[#00A9FF] ${
              ampm === p
                ? "bg-[#A8E2FF] text-[#001D32]"
                : "text-[#44677D] hover:bg-[#FFF3EB]"
            }`}
            style={{ fontFamily: "Outfit, system-ui, sans-serif" }}
            onClick={() => onToggleAmPm(p)}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── ClockDialPicker (public API) ──────────────────────────────────────────────

/**
 * Drop-in replacement for the native <input type="time" />.
 *
 * Props:
 *   label    {string}  – displayed above the trigger and inside the modal
 *   value    {string}  – "HH:MM" (24-hour format, same as input[type=time])
 *   onChange {fn}      – called with the new "HH:MM" string
 *   minTime  {string?} – "HH:MM" lower bound (inclusive)
 *   maxTime  {string?} – "HH:MM" upper bound (inclusive)
 */
export default function ClockDialPicker({ label, value, onChange, minTime, maxTime, periodName }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("hours");
  const [showWarning, setShowWarning] = useState(false);

  const handleClamp = useCallback((isClamped) => {
    setShowWarning((prev) => (prev !== isClamped ? isClamped : prev));
  }, []);

  const { h, m } = parseTime(value);
  const ampm = h < 12 ? "AM" : "PM";

  const minH = minTime ? parseTime(minTime).h : 0;
  const maxH = maxTime ? parseTime(maxTime).h : 23;

  const reducedMotion =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  function openPicker() {
    setMode("hours");
    setShowWarning(false);
    setOpen(true);
  }

  function handleHourChange(newH) {
    onChange(formatTime(newH, m));
  }

  function handleMinuteChange(newM) {
    onChange(formatTime(h, newM));
    // auto-close 350ms after minute selection gives nice confirmation feedback
    setTimeout(() => setOpen(false), reducedMotion ? 0 : 350);
  }

  function handleAmPmToggle(newAmPm) {
    let newH = h;
    if (newAmPm === "AM" && h >= 12) {
      newH = h - 12;
    } else if (newAmPm === "PM" && h < 12) {
      newH = h + 12;
    }

    if (newH < minH || newH > maxH) {
      setShowWarning(true);
    } else {
      setShowWarning(false);
      onChange(formatTime(newH, m));
    }
  }

  // Formatted for trigger button
  const displayH12 = h % 12 === 0 ? 12 : h % 12;

  return (
    <div className="flex flex-col gap-1.5">
      {/* Label */}
      <span
        className="block text-xs font-bold uppercase tracking-wider text-slate-500"
        style={{ fontFamily: "Outfit, system-ui, sans-serif" }}
      >
        {label}
      </span>

      {/* Trigger */}
      <button
        type="button"
        id={`clock-trigger-${label.toLowerCase().replace(/\s+/g, "-")}`}
        onClick={openPicker}
        aria-label={`${label}: ${pad(displayH12)}:${pad(m)} ${ampm}. Tap to change.`}
        className="flex h-14 w-full items-center justify-between rounded-2xl border-2 border-[#FFDCBC] bg-white px-4 outline-none transition-all duration-150 hover:border-[#4EC3FF] focus-visible:border-[#00A9FF] focus-visible:ring-2 focus-visible:ring-[#00A9FF]/30 active:scale-[0.98]"
        style={{ fontFamily: "Outfit, system-ui, sans-serif" }}
      >
        <span className="flex items-center gap-2.5">
          {/* Clock icon */}
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="#00A9FF" strokeWidth="2" />
            <path
              d="M12 7v5l3 3"
              stroke="#00A9FF"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span
            className="text-base font-bold tracking-tight text-[#001D32]"
            style={{ fontFamily: "Outfit, system-ui, sans-serif" }}
          >
            {pad(displayH12)}:{pad(m)}
          </span>
          <span className="rounded-md bg-[#FFF3EB] px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-[#00A9FF]">
            {ampm}
          </span>
        </span>

        {/* Edit hint */}
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-slate-400">
          <path
            d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
            stroke="#00A9FF"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.16 }}
              className="fixed inset-0 z-40 bg-[#001D32]/50 backdrop-blur-sm"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />

            {/* Dialog */}
            <motion.div
              key="dialog"
              role="dialog"
              aria-modal="true"
              aria-label={`Pick ${label}`}
              initial={
                reducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.91, y: 24 }
              }
              animate={
                reducedMotion
                  ? { opacity: 1 }
                  : { opacity: 1, scale: 1, y: 0 }
              }
              exit={
                reducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.93, y: 16 }
              }
              transition={
                reducedMotion
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 380, damping: 30 }
              }
              className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-[340px] rounded-3xl border-2 border-[#FFDCBC] bg-white p-6"
              style={{
                boxShadow:
                  "0 28px 72px -12px rgba(0,29,50,0.22), 0 0 0 1px rgba(255,220,188,0.5)",
              }}
            >
              {/* Step label */}
              <p
                className="mb-2 text-xs font-bold uppercase tracking-widest text-[#44677D]"
                style={{ fontFamily: "Outfit, system-ui, sans-serif" }}
              >
                {label}
              </p>

              {/* HH:MM + AM/PM header */}
              <div className="mb-4">
                <TimeDisplay
                  h={h}
                  m={m}
                  ampm={ampm}
                  mode={mode}
                  onSelectMode={setMode}
                  onToggleAmPm={handleAmPmToggle}
                />
              </div>

              {/* Mode indicator pill */}
              <div className="mb-4 flex items-center justify-center gap-2">
                {["hours", "minutes"].map((md) => (
                  <button
                    key={md}
                    type="button"
                    onClick={() => setMode(md)}
                    className={`rounded-full px-3 py-0.5 text-xs font-bold uppercase tracking-widest transition-colors duration-150 ${
                      mode === md
                        ? "bg-[#A8E2FF] text-[#001D32]"
                        : "text-slate-400 hover:text-[#44677D]"
                    }`}
                    style={{ fontFamily: "Outfit, system-ui, sans-serif" }}
                  >
                    {md === "hours" ? "Hour" : "Min"}
                  </button>
                ))}
              </div>

              {/* Clock face (animates between hours ↔ minutes) */}
              <div className="flex justify-center overflow-hidden">
                <AnimatePresence mode="wait">
                  {mode === "hours" ? (
                    <motion.div
                      key="hours"
                      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 20 }}
                      transition={reducedMotion ? { duration: 0 } : { duration: 0.18 }}
                    >
                      <ClockDial
                        mode="hours"
                        value={h}
                        onChange={handleHourChange}
                        onClamp={handleClamp}
                        min={minH}
                        max={maxH}
                        reducedMotion={reducedMotion}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="minutes"
                      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -20 }}
                      transition={reducedMotion ? { duration: 0 } : { duration: 0.18 }}
                    >
                      <ClockDial
                        mode="minutes"
                        value={m}
                        onChange={handleMinuteChange}
                        onClamp={handleClamp}
                        min={0}
                        max={59}
                        reducedMotion={reducedMotion}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Actions */}
              <div className="mt-5 flex flex-col gap-3">
                <AnimatePresence>
                  {showWarning && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, y: 10 }}
                      animate={{ opacity: 1, height: "auto", y: 0 }}
                      exit={{ opacity: 0, height: 0, y: 10 }}
                      className="flex items-start gap-2.5 rounded-2xl bg-[#FFF8F2] p-3 text-[#44677D] border border-[#FFDCBC]/50 overflow-hidden"
                    >
                      <Info size={16} className="mt-0.5 shrink-0 text-[#00A9FF]" />
                      <p className="text-[12px] font-medium leading-tight">
                        Times are locked to{" "}
                        {periodName === "MORNING"
                          ? "Morning"
                          : periodName === "NOON"
                          ? "Noon"
                          : periodName === "EVENING"
                          ? "Evening"
                          : periodName === "NIGHT"
                          ? "Night"
                          : "this window"}
                        . Change the period to unlock other slots.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                  className="flex-1 rounded-2xl border-2 border-[#FFDCBC] py-3 text-sm font-bold text-[#44677D] transition-all duration-150 hover:border-[#4EC3FF] hover:text-[#001D32] active:scale-[0.97]"
                  style={{ fontFamily: "Outfit, system-ui, sans-serif" }}
                >
                  Cancel
                </button>

                {mode === "hours" ? (
                  <button
                    type="button"
                    onClick={() => setMode("minutes")}
                    className="flex-1 rounded-2xl bg-[#00A9FF] py-3 text-sm font-bold text-white transition-all duration-150 hover:bg-[#0096e6] active:scale-[0.97]"
                    style={{
                      fontFamily: "Outfit, system-ui, sans-serif",
                      boxShadow: "0 4px 0 #004B74",
                    }}
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="flex-1 rounded-2xl bg-[#00A9FF] py-3 text-sm font-bold text-white transition-all duration-150 hover:bg-[#0096e6] active:scale-[0.97]"
                    style={{
                      fontFamily: "Outfit, system-ui, sans-serif",
                      boxShadow: "0 4px 0 #004B74",
                    }}
                  >
                    Done
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
