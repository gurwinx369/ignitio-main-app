import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { X, Play, Pause, ChevronLeft, ChevronRight, RotateCcw, Sun, Moon } from 'lucide-react';
import { PythonApparatus } from '../roadmaps/python';
import { getConceptVisualization } from '../lib/roadmapConceptRegistry';
import '../lib/iso.css';

/**
 * ConceptVisualizerModal
 * Calibrated to authentic Anatomy standards (Image 1: Horology Watch Caliber; Image 2: Raptor Test Stand).
 * Framed inside the signature .iso-plate card with 4-corner annotations and crisp technical pen aesthetic.
 */
export default function ConceptVisualizerModal({
  isOpen,
  onClose,
  level = {},
  roadmapType = "python-beginner",
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [theme, setTheme] = useState("light"); // Default to Light theme (matching Image 1 & Image 2)

  // Continuous 60fps spring interpolation states
  const [smoothStep, setSmoothStep] = useState(0);
  const [smoothNeedle, setSmoothNeedle] = useState(35);

  const targetStepRef = useRef(0);
  const smoothStepRef = useRef(0);
  const targetNeedleRef = useRef(35);
  const smoothNeedleRef = useRef(35);
  const rafIdRef = useRef(null);

  const workerRef = useRef(null);
  const playTimerRef = useRef(null);

  // Dynamic Anatomy specification resolved for ANY Python roadmap level
  const spec = useMemo(() => getConceptVisualization(level), [level]);
  const apparatusType = level.visualization?.apparatus || spec.apparatus;

  const totalSteps = 4;

  // Initialize Web Worker
  useEffect(() => {
    if (!isOpen) {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
      return;
    }

    try {
      workerRef.current = new Worker('/workers/conceptVisualizerWorker.js');
      workerRef.current.onmessage = (e) => {
        const { type, needleDeg } = e.data || {};
        if (type === 'FRAME_UPDATE' && needleDeg !== undefined) {
          targetNeedleRef.current = needleDeg;
        }
      };

      workerRef.current.postMessage({
        type: 'INIT',
        payload: {
          apparatus: apparatusType,
          initialStep: 0,
          totalSteps,
          concept: level.concept,
        },
      });
    } catch (err) {
      console.warn('Concept visualizer worker fallback active:', err);
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, [isOpen, apparatusType, level.concept]);

  // Synchronize target refs when currentStep changes
  useEffect(() => {
    targetStepRef.current = currentStep;
    targetNeedleRef.current = 35 + currentStep * 38;
  }, [currentStep]);

  // Continuous 60fps spring interpolation loop
  useEffect(() => {
    if (!isOpen) {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      return;
    }

    let lastTime = performance.now();

    const tick = (now) => {
      const dt = Math.min(0.064, (now - lastTime) / 1000);
      lastTime = now;

      // Smooth critically damped spring follow
      const springSpeed = 8.5;
      const stepDiff = targetStepRef.current - smoothStepRef.current;
      smoothStepRef.current += stepDiff * Math.min(1, dt * springSpeed);

      const needleDiff = targetNeedleRef.current - smoothNeedleRef.current;
      smoothNeedleRef.current += needleDiff * Math.min(1, dt * springSpeed);

      setSmoothStep(smoothStepRef.current);
      setSmoothNeedle(smoothNeedleRef.current);

      rafIdRef.current = requestAnimationFrame(tick);
    };

    rafIdRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [isOpen]);

  // Handle step change
  const handleStepChange = useCallback((newStep) => {
    const clamped = Math.max(0, Math.min(newStep, totalSteps - 1));
    setCurrentStep(clamped);

    if (workerRef.current) {
      workerRef.current.postMessage({
        type: 'SET_STEP',
        payload: { step: clamped },
      });
    }
  }, [totalSteps]);

  // Autoplay tour loop
  useEffect(() => {
    if (!isPlaying) {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
      return;
    }

    playTimerRef.current = setInterval(() => {
      setCurrentStep((prev) => {
        const next = (prev + 1) % totalSteps;
        if (workerRef.current) {
          workerRef.current.postMessage({
            type: 'SET_STEP',
            payload: { step: next },
          });
        }
        return next;
      });
    }, 2800);

    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, [isPlaying, totalSteps]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleStepChange(currentStep + 1);
      if (e.key === 'ArrowLeft') handleStepChange(currentStep - 1);
      if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, currentStep, handleStepChange]);

  if (!isOpen) return null;

  // Live telemetry readout string (matching Image 2 corner readout)
  const getCornerReadout = () => {
    if (spec.telemetry && spec.telemetry.length > 0) {
      return spec.telemetry[currentStep % spec.telemetry.length];
    }
    return `0x7FF0 · 28 B · PY_OBJ [VAL_${currentStep + 1}]`;
  };

  const getStepExplanation = () => {
    if (spec.phases && spec.phases.length > 0) {
      return spec.phases[currentStep % spec.phases.length];
    }
    return `Phase 0${currentStep + 1}: Executing telemetry analysis for ${level.title || 'Python concept'}.`;
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      {/* ── Signature Anatomy .iso-plate Technical Blueprint Card ── */}
      <div
        className="iso relative w-full max-w-4xl max-h-[94vh] rounded-none shadow-2xl flex flex-col overflow-hidden my-auto"
        data-theme={theme}
        style={{
          background: 'var(--anatomy-card)',
          boxShadow: '0 25px 70px rgba(0,0,0,0.55), 0 0 0 1px var(--anatomy-mid)',
        }}
      >
        {/* Frame Top Utility Bar (Close & Theme Toggle) */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 border-b border-[var(--anatomy-faint)] shrink-0 bg-[var(--anatomy-card)]">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] sm:text-[10px] tracking-widest uppercase text-[var(--anatomy-muted)]">
              ANATOMY TECHNICAL SPECIFICATION
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
              className="p-1 rounded text-[var(--anatomy-muted)] hover:text-[var(--anatomy-strong)] transition-colors"
              title={`Switch to ${theme === 'light' ? 'Dark Blueprint' : 'Light Paper'} theme`}
            >
              {theme === 'light' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded text-[var(--anatomy-muted)] hover:text-[var(--anatomy-strong)] transition-colors"
              title="Close specification (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Authentic .iso-plate Card with Four-Corner Annotations (Image 2) ── */}
        <div className="iso-plate relative flex-1 min-h-0 flex flex-col justify-center items-center px-4 py-8 sm:px-8 sm:py-10 overflow-hidden" style={{ padding: '36px 16px 28px' }}>
          {/* Four Corner Annotations */}
          <div className="iso-plate-corners" style={{ inset: '10px 14px' }}>
            {/* Top-Left: Fig number */}
            <div className="iso-plate-corner" data-corner="fig">
              {spec.fig || 'Fig 1.1'}
            </div>

            {/* Top-Right: Technical Apparatus Title */}
            <div className="iso-plate-corner" data-corner="title">
              {spec.specTitle} · {level.title || 'LEVEL SPECIFICATION'}
            </div>

            {/* Bottom-Left: Interactive Action Hint (Image 2 style) */}
            <div className="iso-plate-corner" data-corner="hint">
              <button
                onClick={() => setIsPlaying((p) => !p)}
                className="inline-flex items-center gap-1 hover:underline font-bold"
              >
                <span className="w-2 h-2 rounded-full bg-[var(--anatomy-lit)]" />
                {isPlaying ? 'PAUSE TOUR' : '• TOUR'}
              </button>
              <span className="ml-2.5 opacity-60 hidden sm:inline">
                CLICK CASSETTE TO EXPLODE
              </span>
            </div>

            {/* Bottom-Right: Live Telemetry Monospace Readout */}
            <div className="iso-plate-corner" data-corner="readout">
              {getCornerReadout()}
            </div>
          </div>

          {/* ── Main Technical SVG Figure Container (Strictly bounded height) ── */}
          <div className="w-full flex-1 min-h-0 flex items-center justify-center max-h-[52vh] sm:max-h-[58vh]">
            <PythonApparatus
              apparatusType={apparatusType}
              conceptTitle={level.concept || level.title || 'Rig'}
              currentStep={currentStep}
              smoothStep={smoothStep}
              smoothNeedle={smoothNeedle}
              onSelectStep={handleStepChange}
              theme={theme}
            />
          </div>
        </div>

        {/* ── Bottom Step Narrative & Scrubbable Calibration Track ── */}
        <div className="px-4 sm:px-6 py-3 border-t border-[var(--anatomy-faint)] bg-[var(--anatomy-card)] flex flex-col gap-2 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <span className="font-mono text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded bg-[var(--anatomy-shade-1)] text-[var(--anatomy-strong)] border border-[var(--anatomy-lo)] shrink-0">
                PHASE 0{currentStep + 1} / 0{totalSteps}
              </span>
              <p className="text-[11px] sm:text-xs font-medium text-[var(--anatomy-text)] leading-snug font-sans truncate sm:whitespace-normal">
                {getStepExplanation()}
              </p>
            </div>

            {/* Stepper Buttons */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                disabled={currentStep === 0}
                onClick={() => handleStepChange(currentStep - 1)}
                className="p-1 sm:p-1.5 rounded border border-[var(--anatomy-lo)] hover:bg-[var(--anatomy-shade-1)] disabled:opacity-30 transition-colors text-[var(--anatomy-text)]"
                title="Previous Phase"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                disabled={currentStep === totalSteps - 1}
                onClick={() => handleStepChange(currentStep + 1)}
                className="p-1 sm:p-1.5 rounded border border-[var(--anatomy-lo)] hover:bg-[var(--anatomy-shade-1)] disabled:opacity-30 transition-colors text-[var(--anatomy-text)]"
                title="Next Phase"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleStepChange(0)}
                className="p-1 sm:p-1.5 rounded border border-[var(--anatomy-lo)] hover:bg-[var(--anatomy-shade-1)] text-[var(--anatomy-muted)] hover:text-[var(--anatomy-strong)] transition-colors"
                title="Reset to Phase 1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Stepper calibration ticks */}
          <div className="flex items-center gap-1.5 w-full pt-0.5">
            {Array.from({ length: totalSteps }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => handleStepChange(idx)}
                className={`h-1 sm:h-1.5 rounded-none flex-1 transition-all duration-200 ${
                  idx === currentStep
                    ? 'bg-[var(--anatomy-strong)]'
                    : idx < currentStep
                    ? 'bg-[var(--anatomy-mid)]'
                    : 'bg-[var(--anatomy-faint)]'
                }`}
                title={`Jump to Phase ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
