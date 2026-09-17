'use client';

/**
 * CardLoader.jsx — Ignitio course card loading system
 *
 * Exports:
 *   useCardLoader(onNavigate, loadDuration?)  — state machine + rage-click gate
 *   LOAD_STATE                                — enum of states
 *   SpinnerIcon                               — animated arc spinner (arrow replacement)
 *   SuccessIcon                               — checkmark for success state
 *   StatusBadge                               — status pill that morphs during load
 *   CardInfoShimmer                           — shimmer overlay for the info section
 *   LevelSquaresLoading                       — wave-animated level squares
 */

import { useCallback, useEffect, useRef, useState } from 'react';

// ─── Keyframe injection (once, client-side only) ──────────────────
const KEYFRAMES = `
  @keyframes _ignitio_spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes _ignitio_shimmer {
    0%   { transform: translateX(-130%); }
    100% { transform: translateX(260%); }
  }
  @keyframes _ignitio_success_fade {
    0%   { opacity: 1; }
    100% { opacity: 0; }
  }
  @keyframes _ignitio_dot_pulse {
    0%, 100% { opacity: 1;   transform: scale(1); }
    50%       { opacity: 0.4; transform: scale(0.7); }
  }
  @keyframes _ignitio_level_wave {
    0%, 100% { transform: scaleY(1);    opacity: 0.18; }
    50%       { transform: scaleY(1.45); opacity: 0.65; }
  }
  @keyframes _ignitio_success_scale {
    0%   { transform: scale(0.6); opacity: 0; }
    60%  { transform: scale(1.15); opacity: 1; }
    100% { transform: scale(1);   opacity: 1; }
  }
`;

let _keyframesInjected = false;
function ensureKeyframes() {
    if (_keyframesInjected || typeof document === 'undefined') return;
    const el = document.createElement('style');
    el.setAttribute('data-ignitio-loader', '1');
    el.textContent = KEYFRAMES;
    document.head.appendChild(el);
    _keyframesInjected = true;
}

// ─── State enum ───────────────────────────────────────────────────
export const LOAD_STATE = {
    IDLE:     'idle',
    PRESSING: 'pressing',  // ~130 ms — tactile press sink
    LOADING:  'loading',   // async in-flight
    SUCCESS:  'success',   // ~500 ms — green flash before navigate
};

// ─── Hook — owns the state machine & rage-click gate ─────────────
/**
 * @param {Function} onNavigate   - called after success flash
 * @param {number}   loadDuration - ms to stay in LOADING (simulate or real async)
 */
export function useCardLoader(onNavigate, loadDuration = 1400) {
    const [state, setState]     = useState(LOAD_STATE.IDLE);
    const [isLocked, setLocked] = useState(false); // render-safe mirror of lockedRef
    const lockedRef             = useRef(false);    // synchronous gate inside handleClick
    const timerRefs             = useRef([]);

    // Cleanup timers on unmount
    useEffect(() => {
        ensureKeyframes();
        return () => timerRefs.current.forEach(clearTimeout);
    }, []);

    const schedule = (fn, ms) => {
        const id = setTimeout(fn, ms);
        timerRefs.current.push(id);
        return id;
    };

    // Lock/unlock both the ref (instant, synchronous) and state (triggers re-render)
    const lock   = () => { lockedRef.current = true;  setLocked(true);  };
    const unlock = () => { lockedRef.current = false; setLocked(false); };

    const handleClick = useCallback(() => {
        // ── Rage-click gate — ref read is synchronous, no stale closure risk ──
        if (lockedRef.current) return;
        lock();

        setState(LOAD_STATE.PRESSING);

        schedule(() => {
            setState(LOAD_STATE.LOADING);

            schedule(() => {
                setState(LOAD_STATE.SUCCESS);

                schedule(() => {
                    unlock();
                    setState(LOAD_STATE.IDLE);
                    onNavigate?.();
                }, 520);
            }, loadDuration);
        }, 130);
    }, [onNavigate, loadDuration]);

    return {
        state,
        handleClick,
        isLocked,                        // ✅ state value — safe to read during render
        isIdle:     state === LOAD_STATE.IDLE,
        isPressing: state === LOAD_STATE.PRESSING,
        isLoading:  state === LOAD_STATE.LOADING,
        isSuccess:  state === LOAD_STATE.SUCCESS,
    };
}

// ─── SpinnerIcon ─────────────────────────────────────────────────
/**
 * Drop-in replacement for the arrow icon during LOADING.
 * Renders a spinning arc that matches the card's stroke weight.
 */
export function SpinnerIcon({ size = 14, color = '#1e1a18' }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            style={{ animation: '_ignitio_spin 0.72s linear infinite', display: 'block' }}
            aria-label="Loading"
        >
            {/* Track */}
            <circle
                cx="12" cy="12" r="10"
                fill="none"
                stroke={color}
                strokeWidth="2.5"
                strokeOpacity="0.18"
            />
            {/* Arc */}
            <path
                d="M12 2a10 10 0 0 1 10 10"
                fill="none"
                stroke={color}
                strokeWidth="2.5"
                strokeLinecap="round"
            />
        </svg>
    );
}

// ─── SuccessIcon ─────────────────────────────────────────────────
export function SuccessIcon({ size = 14, color = '#2ecc8a' }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ animation: '_ignitio_success_scale 0.32s ease-out forwards', display: 'block' }}
        >
            <polyline points="20 6 9 17 4 12" />
        </svg>
    );
}

// ─── StatusBadge ─────────────────────────────────────────────────
/**
 * The top-left pill on the card displaying active learners.
 */
export function StatusBadge() {
    return (
        <span
            className="absolute top-3.5 left-3.5 text-[11px] font-bold tracking-[0.03em] px-[13px] py-[6px] rounded-full flex items-center gap-[6px] bg-white text-[#1a1a1a]"
            style={{
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                zIndex: 10,
            }}
        >
            {/* Green dot */}
            <span
                style={{
                    display: 'inline-block',
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: '#2ecc8a',
                    flexShrink: 0,
                    boxShadow: '0 0 6px rgba(46,204,138,0.6)',
                }}
            />
            500+ learners
        </span>
    );
}

// ─── CardInfoShimmer ─────────────────────────────────────────────
/**
 * Absolute-positioned overlay — mount inside a `position: relative` container.
 * Renders a shimmer sweep during LOADING and a green flash on SUCCESS.
 * `pointerEvents: none` so it never blocks clicks.
 */
export function CardInfoShimmer({ state }) {
    const isLoading = state === LOAD_STATE.LOADING;
    const isSuccess = state === LOAD_STATE.SUCCESS;

    if (!isLoading && !isSuccess) return null;

    return (
        <div
            aria-hidden="true"
            style={{
                position:      'absolute',
                inset:         0,
                borderRadius:  'inherit',
                overflow:      'hidden',
                pointerEvents: 'none',
                zIndex:        2,
            }}
        >
            {/* Shimmer sweep */}
            {isLoading && (
                <div
                    style={{
                        position:   'absolute',
                        top: 0, bottom: 0,
                        width:      '52%',
                        background: 'linear-gradient(105deg, transparent 0%, rgba(255,255,255,0.26) 50%, transparent 100%)',
                        animation:  '_ignitio_shimmer 1.25s ease-in-out infinite',
                    }}
                />
            )}

            {/* Success tint */}
            {isSuccess && (
                <div
                    style={{
                        position:   'absolute',
                        inset:      0,
                        background: 'rgba(46,204,138,0.11)',
                        animation:  '_ignitio_success_fade 0.52s ease-out forwards',
                    }}
                />
            )}
        </div>
    );
}
