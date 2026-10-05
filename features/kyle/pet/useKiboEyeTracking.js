import { useEffect, useRef, useCallback } from 'react';

const MAX_EYE_OFFSET = 8;
const LERP_FACTOR = 0.08;

export function useKiboEyeTracking({ eyesRef, wrapperRef, active, trackFullPage = false }) {
  const cursorPos = useRef({ x: 0, y: 0 });
  const currentOffset = useRef({ x: 0, y: 0 });
  const rafId = useRef(null);
  const hasMouse = useRef(false);

  const tick = useCallback(() => {
    if (!eyesRef.current || !wrapperRef.current || !hasMouse.current) return;

    const rect = wrapperRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = cursorPos.current.x - centerX;
    const dy = cursorPos.current.y - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;

    const targetX = (dx / dist) * Math.min(dist * 0.15, MAX_EYE_OFFSET);
    const targetY = (dy / dist) * Math.min(dist * 0.1,  MAX_EYE_OFFSET * 0.6);

    currentOffset.current.x += (targetX - currentOffset.current.x) * LERP_FACTOR;
    currentOffset.current.y += (targetY - currentOffset.current.y) * LERP_FACTOR;

    const x = currentOffset.current.x.toFixed(2);
    const y = currentOffset.current.y.toFixed(2);
    
    // Set CSS variables so animations can combine with the track offset
    eyesRef.current.style.setProperty('--eye-track-x', `${x}px`);
    eyesRef.current.style.setProperty('--eye-track-y', `${y}px`);
    // Fallback/base transform using the variables
    eyesRef.current.style.transform = `translate(var(--eye-track-x, ${x}px), var(--eye-track-y, ${y}px))`;

    rafId.current = requestAnimationFrame(tick);
  }, [eyesRef, wrapperRef]);

  useEffect(() => {
    if (!active) {
      if (eyesRef.current) eyesRef.current.style.transform = '';
      if (wrapperRef.current) wrapperRef.current.classList.remove('tracking-active');
      if (rafId.current) cancelAnimationFrame(rafId.current);
      currentOffset.current = { x: 0, y: 0 };
      hasMouse.current = false;
      return;
    }

    const onMove = (e) => {
      if (!wrapperRef.current) return;
      
      let shouldIgnore = false;
      
      if (!trackFullPage) {
        const rect = wrapperRef.current.getBoundingClientRect();
        const kiboCenterX = rect.left + rect.width / 2;
        const screenWidth = window.innerWidth;
        
        const isKiboOnLeft = kiboCenterX < screenWidth / 2;
        
        if (isKiboOnLeft) {
          // If Kibo is on the left, ignore cursor if it is on the far right 30% of the screen
          shouldIgnore = e.clientX > screenWidth * 0.70;
        } else {
          // If Kibo is on the right, ignore cursor if it is on the far left 30% of the screen
          shouldIgnore = e.clientX < screenWidth * 0.30;
        }
      }
      
      if (shouldIgnore) {
        if (hasMouse.current) {
          hasMouse.current = false;
          if (eyesRef.current) eyesRef.current.style.transform = '';
          wrapperRef.current.classList.remove('tracking-active');
        }
        return;
      }

      if (!hasMouse.current) {
        hasMouse.current = true;
        wrapperRef.current.classList.add('tracking-active');
        // Restart the RAF loop if it was paused
        if (rafId.current) cancelAnimationFrame(rafId.current);
        rafId.current = requestAnimationFrame(tick);
      }
      
      cursorPos.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    
    // Initial check in case cursor is already on the right side
    // We don't have clientX yet, so we wait for the first mousemove.
    
    return () => {
      window.removeEventListener('mousemove', onMove);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [active, tick, eyesRef, wrapperRef]);
}
