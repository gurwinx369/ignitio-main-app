import { useState, useEffect, useCallback, useRef } from 'react';
import { kylePetConfig } from './kylePetConfig';

export function useKylePetPosition() {
  const { size, breakpoint, defaultPosition, drag, storageKeys } = kylePetConfig;

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [wasDragged, setWasDragged] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [petSize, setPetSize] = useState(size.desktop);

  const startPos = useRef({ x: 0, y: 0 });
  const startMousePos = useRef({ x: 0, y: 0 });
  const rafId = useRef(null);
  const targetPos = useRef({ x: 0, y: 0 });

  const getViewportDimensions = () => {
    if (typeof window === 'undefined') return { width: 0, height: 0 };
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  };

  const getDefaultPosition = useCallback((vpWidth, vpHeight) => {
    const isMobile = vpWidth <= breakpoint.mobileMaxWidth;
    const s = isMobile ? size.mobile : size.desktop;
    const config = isMobile ? defaultPosition.mobile : defaultPosition.desktop;

    return {
      x: vpWidth - config.xOffsetFromRight - s,
      y: vpHeight - config.yOffsetFromBottom - s,
    };
  }, [breakpoint.mobileMaxWidth, size.mobile, size.desktop, defaultPosition]);

  const clampPosition = useCallback((pos, s) => {
    const { width, height } = getViewportDimensions();
    const padding = drag.viewportPaddingPx;
    
    return {
      x: Math.max(padding, Math.min(pos.x, width - s - padding)),
      y: Math.max(padding, Math.min(pos.y, height - s - padding)),
    };
  }, [drag.viewportPaddingPx]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const { width, height } = getViewportDimensions();
    const isMobile = width <= breakpoint.mobileMaxWidth;
    const s = isMobile ? size.mobile : size.desktop;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPetSize(s);

    try {
      const saved = localStorage.getItem(storageKeys.position);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          setPosition(clampPosition(parsed, s));
          setIsReady(true);
          return;
        }
      }
    } catch (err) {
      console.warn("Failed to read Kyle Pet position", err);
    }

    setPosition(clampPosition(getDefaultPosition(width, height), s));
    setIsReady(true);
  }, [storageKeys.position, size, breakpoint.mobileMaxWidth, getDefaultPosition, clampPosition]);

  useEffect(() => {
    if (!isReady) return;
    
    const handleResize = () => {
      const { width } = getViewportDimensions();
      const isMobile = width <= breakpoint.mobileMaxWidth;
      const s = isMobile ? size.mobile : size.desktop;
      setPetSize(s);
      setPosition(prev => clampPosition(prev, s));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isReady, breakpoint.mobileMaxWidth, size, clampPosition]);

  const onPointerDown = (e) => {
    e.target.setPointerCapture(e.pointerId);
    setIsDragging(true);
    setWasDragged(false);
    if (rafId.current) cancelAnimationFrame(rafId.current);
    startPos.current = { ...position };
    startMousePos.current = { x: e.clientX, y: e.clientY };
    targetPos.current = { ...position };
  };

  const onPointerMove = (e) => {
    if (!isDragging) return;
    
    if (e.cancelable) {
      e.preventDefault();
    }

    const dx = e.clientX - startMousePos.current.x;
    const dy = e.clientY - startMousePos.current.y;
    
    if (Math.abs(dx) > drag.clickThresholdPx || Math.abs(dy) > drag.clickThresholdPx) {
      setWasDragged(true);
    }

    targetPos.current = {
      x: startPos.current.x + dx,
      y: startPos.current.y + dy,
    };

    if (!rafId.current) {
      rafId.current = requestAnimationFrame(() => {
        setPosition(clampPosition(targetPos.current, petSize));
        rafId.current = null;
      });
    }
  };

  const onPointerUp = (e) => {
    if (!isDragging) return;
    e.target.releasePointerCapture(e.pointerId);
    setIsDragging(false);
    
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
      setPosition(clampPosition(targetPos.current, petSize));
    }

    try {
      localStorage.setItem(storageKeys.position, JSON.stringify(position));
    } catch (err) {
      console.warn("Failed to save Kyle Pet position", err);
    }
  };

  const resetPosition = useCallback(() => {
    const { width, height } = getViewportDimensions();
    const isMobile = width <= breakpoint.mobileMaxWidth;
    const s = isMobile ? size.mobile : size.desktop;
    const defPos = clampPosition(getDefaultPosition(width, height), s);
    
    setPosition(defPos);
    try {
      localStorage.removeItem(storageKeys.position);
    } catch (err) {
      console.warn("Failed to remove Kyle Pet position", err);
    }
  }, [breakpoint.mobileMaxWidth, size.mobile, size.desktop, getDefaultPosition, clampPosition, storageKeys.position]);

  return {
    position,
    isDragging,
    wasDragged,
    hasMovedBeyondClickThreshold: wasDragged,
    isReady,
    petSize,
    resetPosition,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
    }
  };
}
