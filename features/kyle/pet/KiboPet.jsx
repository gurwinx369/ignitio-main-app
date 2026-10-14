"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useKylePetPosition } from './useKylePetPosition';
import { useKiboThrowPhysics } from './useKiboThrowPhysics';
import { useKiboEyeTracking } from './useKiboEyeTracking';
import { useKiboVisibilityGuard } from './useKiboVisibilityGuard';
import { kylePetConfig } from './kylePetConfig';
import KylePetBubble from './KylePetBubble';
import { useAskKyle } from '@/features/kyle/ask/useAskKyle';
import KiboBody from './KiboBody';
import KiboParticles from './KiboParticles';
import gsap from 'gsap';
import { useKiboScrollPhysics } from './useKiboScrollPhysics';

const KYLE_BLOCKED_PATHS = ['/home/onboarding', '/auth/'];

function getKyleRouteContext(pathname) {
  if (!pathname) return 'default';
  if (pathname.includes('/quiz')) return 'quiz';
  if (pathname.includes('/assignment')) return 'assignment';
  if (pathname.includes('/lesson') || pathname.includes('/video') || pathname.includes('/interactive-overviews')) return 'lesson';
  if (pathname.includes('/roadmaps')) return 'roadmap';
  if (pathname.includes('/home')) return 'dashboard';
  return 'default';
}

export default function KiboPet() {
  const pathname = usePathname();
  
  if (pathname && pathname.includes('/onboarding')) {
    return null;
  }

  const { position, isDragging, hasMovedBeyondClickThreshold, isReady, petSize, resetPosition, cleanupDragState, handlers } = useKylePetPosition();
  const {
    isOpen: isAskKyleOpen,
    openAskKyle,
    isThinking: isAskKyleThinking
  } = useAskKyle();

  const [isSleeping, setIsSleeping] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [message, setMessage] = useState(null);
  const bubbleTimeoutRef = useRef(null);
  const sleepTimeoutRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [forcedState, setForcedState] = useState(null);
  const forcedStateTimeoutRef = useRef(null);

  const [bouncingPosition, setBouncingPosition] = useState(null);
  const [isBouncingState, setIsBouncingState] = useState(false);
  const wrapperRef = useRef(null);
  const eyesRef = useRef(null);
  const buttonRef = useRef(null);
  const scrollRef = useRef(null);

  const currentPosition = isBouncingState && bouncingPosition ? bouncingPosition : position;

  // Scroll physics (using dedicated ref to avoid CSS animation conflicts)
  useKiboScrollPhysics({ scrollRef });

  // New hooks
  const { recordDragPoint, startThrow, cancel, isBouncing } = useKiboThrowPhysics({
    petSize,
    onPositionChange: setBouncingPosition,
    onBouncing: setIsBouncingState,
    storageKey: kylePetConfig.storageKeys.position
  });

  useKiboVisibilityGuard({
    position: currentPosition,
    petSize,
    resetPosition,
    isReady
  });

  useEffect(() => {
    try {
      const hiddenState = localStorage.getItem(kylePetConfig.storageKeys.hidden);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (hiddenState === 'true') setIsHidden(true);
    } catch (e) {}
  }, []);

  const resetSleepTimer = useCallback(() => {
    if (sleepTimeoutRef.current) {
      clearTimeout(sleepTimeoutRef.current);
    }
    
    setIsSleeping(false);

    sleepTimeoutRef.current = setTimeout(() => {
      setIsSleeping(true);
    }, kylePetConfig.inactivity.sleepingAfterMs);
  }, []);

  useEffect(() => {
    const events = ['keydown', 'pointerdown', 'touchstart', 'scroll', 'wheel'];
    const handler = () => resetSleepTimer();

    events.forEach(e => window.addEventListener(e, handler, { passive: true }));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    resetSleepTimer();

    return () => {
      events.forEach(e => window.removeEventListener(e, handler));
      if (sleepTimeoutRef.current) clearTimeout(sleepTimeoutRef.current);
    };
  }, [resetSleepTimer]);

  useEffect(() => {
    const handlePetState = (e) => {
      const { state, duration, action } = e.detail || {};

      if (forcedStateTimeoutRef.current) {
        clearTimeout(forcedStateTimeoutRef.current);
        forcedStateTimeoutRef.current = null;
      }

      if (action === 'clear' || state === null) {
        setForcedState(null);
        return;
      }

      if (action === 'say' && e.detail.message) {
        setMessage(e.detail.message);
        resetSleepTimer();
        if (bubbleTimeoutRef.current) clearTimeout(bubbleTimeoutRef.current);
        const autoClose = e.detail.duration || kylePetConfig.bubble.autoCloseMs;
        if (autoClose > 0) {
          bubbleTimeoutRef.current = setTimeout(() => {
            setMessage(null);
          }, autoClose);
        }
        return;
      }

      if (state === 'thinking' || state === 'celebrate' || state === 'sad' || state === 'angry') {
        setForcedState(state);
        resetSleepTimer();

        if (duration) {
          forcedStateTimeoutRef.current = setTimeout(() => {
            setForcedState(null);
          }, duration);
        }
      }
    };

    window.addEventListener('kyle-pet-state', handlePetState);
    return () => {
      window.removeEventListener('kyle-pet-state', handlePetState);
      if (forcedStateTimeoutRef.current) clearTimeout(forcedStateTimeoutRef.current);
    };
  }, [resetSleepTimer]);

  const visualState = (() => {
    if (isDragging) return 'dragging';
    if (isBouncingState) return 'bouncing';
    if (isAskKyleOpen && isAskKyleThinking) return 'thinking';
    if (forcedState) return forcedState;
    if (message) return 'speaking';
    if (isSleeping) return 'sleeping';
    if (isHovered) return 'hovered';
    return 'idle';
  })();

  useEffect(() => {
    if (visualState === 'celebrate' && buttonRef.current) {
      // Create a timeline so we can chain the flip and bounce
      const tl = gsap.timeline();
      tl.to(buttonRef.current, {
        rotateY: "+=360",
        duration: 0.8,
        ease: "back.out(1.7)",
      }, 0);
      
      tl.to(buttonRef.current, {
        y: -40,
        yoyo: true,
        repeat: 1,
        duration: 0.4,
        ease: "power2.out",
      }, 0);
    }
  }, [visualState]);

  const trackingActive = (visualState === 'idle' || visualState === 'hovered') && !isDragging;
  useKiboEyeTracking({ eyesRef, wrapperRef, active: trackingActive });

  const closeBubble = useCallback(() => {
    setMessage(null);
    if (bubbleTimeoutRef.current) {
      clearTimeout(bubbleTimeoutRef.current);
    }
    resetSleepTimer();
  }, [resetSleepTimer]);

  const handleClick = useCallback((e) => {
    if (hasMovedBeyondClickThreshold) return;
    if (isBouncing.current) return;
    
    const context = getKyleRouteContext(pathname);
    const isExamMode = document.body.getAttribute('data-kibo-exam-mode') === 'true';
    
    if (context === 'quiz' || context === 'assignment' || isExamMode) {
      setForcedState('angry');
      setMessage("I can't help you now during a test!");
      resetSleepTimer();
      if (bubbleTimeoutRef.current) clearTimeout(bubbleTimeoutRef.current);
      bubbleTimeoutRef.current = setTimeout(() => {
        closeBubble();
        setForcedState(null);
      }, 4000);
      return;
    }

    // Removed the "Use the lesson Ask Kibo tab" block to allow chat opening in lessons

    openAskKyle({
      source: "kibo-pet",
      mode: "general"
    });
    resetSleepTimer();
    closeBubble();
  }, [hasMovedBeyondClickThreshold, isBouncing, pathname, openAskKyle, resetSleepTimer, closeBubble]);

  const handleFocusTip = useCallback((e) => {
    e.stopPropagation();
    const tips = kylePetConfig.focusTips;
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    setMessage(randomTip);
    resetSleepTimer();
    if (bubbleTimeoutRef.current) clearTimeout(bubbleTimeoutRef.current);
    bubbleTimeoutRef.current = setTimeout(closeBubble, kylePetConfig.bubble.autoCloseMs);
  }, [resetSleepTimer, closeBubble]);

  useEffect(() => {
    if (!isAskKyleOpen) return;

    if (isDragging) {
      cleanupDragState();
    }

    closeBubble();
  }, [isAskKyleOpen, isDragging, cleanupDragState, closeBubble]);

  const handleAskKyle = useCallback((e) => {
    e.stopPropagation();
    const context = getKyleRouteContext(pathname);
    
    // Removed the "Use the lesson Ask Kibo tab" block to allow chat opening in lessons

    openAskKyle({
      source: "kibo-pet",
      mode: "general"
    });
    resetSleepTimer();
    closeBubble();
  }, [openAskKyle, resetSleepTimer, closeBubble, pathname]);

  const handleResetPosition = useCallback((e) => {
    e.stopPropagation();
    resetPosition();
    setMessage("Kibo is back in place.");
    resetSleepTimer();
    if (bubbleTimeoutRef.current) clearTimeout(bubbleTimeoutRef.current);
    bubbleTimeoutRef.current = setTimeout(closeBubble, kylePetConfig.bubble.autoCloseMs);
  }, [resetPosition, resetSleepTimer, closeBubble]);

  const handleHideKyle = useCallback((e) => {
    e.stopPropagation();
    setIsHidden(true);
    closeBubble();
    try {
      localStorage.setItem(kylePetConfig.storageKeys.hidden, 'true');
    } catch (err) {}
  }, [closeBubble]);

  const handleShowKyle = useCallback(() => {
    setIsHidden(false);
    resetSleepTimer();
    try {
      localStorage.removeItem(kylePetConfig.storageKeys.hidden);
    } catch (err) {}
  }, [resetSleepTimer]);

  const wrappedHandlers = {
    ...handlers,
    onPointerDown: (e) => {
      cancel(); // Cancel any existing throw
      handlers.onPointerDown(e);
    },
    onPointerMove: (e) => {
      handlers.onPointerMove(e);
      recordDragPoint(e.clientX, e.clientY);
    },
    onPointerUp: (e) => {
      const thrown = startThrow(position);
      if (!thrown) handlers.onPointerUp(e);
      else cleanupDragState();
    },
    onPointerCancel: (e) => {
      handlers.onPointerCancel(e);
    }
  };

  if (!isReady) return null;

  if (KYLE_BLOCKED_PATHS.some((p) => pathname?.startsWith(p))) return null;

  if (isHidden) {
    const btnConfig = kylePetConfig.restoreButton || {
      positionClassName: "bottom-4 right-4",
      zIndexClassName: "z-[50]",
      label: "Show Kibo"
    };

    return (
      <button
        onClick={handleShowKyle}
        className={`fixed ${btnConfig.positionClassName} ${btnConfig.zIndexClassName} text-xs font-medium px-4 py-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-full shadow-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors kibo-restore-btn`}
      >
        {btnConfig.label}
      </button>
    );
  }

  const isLeftAligned = window.innerWidth ? currentPosition.x < window.innerWidth / 2 : false;

  return (
    <div
      className={`fixed z-[110] touch-none select-none ${isDragging || isBouncingState ? 'transition-none' : 'transition-transform duration-200'} ${isAskKyleOpen ? 'pointer-events-none' : 'pointer-events-auto'}`}
      style={{
        transform: `translate3d(${currentPosition.x}px, ${currentPosition.y}px, 0)`,
        width: petSize,
        height: petSize,
      }}
    >
      <div className="relative w-full h-full">
        <KylePetBubble 
          message={message} 
          visualState={visualState}
          onClose={closeBubble} 
          isLeftAligned={isLeftAligned}
          onFocusTip={kylePetConfig.actions.focusTip?.enabled ? handleFocusTip : undefined}
          onAskKyle={kylePetConfig.actions.askKyle?.enabled ? handleAskKyle : undefined}
          onResetPosition={kylePetConfig.actions.resetPosition?.enabled ? handleResetPosition : undefined}
          onHideKyle={kylePetConfig.actions.hideKyle?.enabled ? handleHideKyle : undefined}
        />
        
        <button
          ref={buttonRef}
          className={`relative w-full h-full rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 transition-all duration-300`}
          style={{
            cursor: isDragging ? 'grabbing' : 'grab',
            filter: visualState === 'empathetic' ? 'drop-shadow(0 0 16px rgba(245, 158, 11, 0.6))' : (isHovered || isDragging ? 'drop-shadow(0 0 12px rgba(6, 182, 212, 0.3))' : 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))'),
          }}
          aria-label="Kibo AI mentor pet"
          onPointerEnter={() => setIsHovered(true)}
          onPointerLeave={() => setIsHovered(false)}
          onClick={handleClick}
          {...wrappedHandlers}
        >
          <div ref={scrollRef} className="w-full h-full">
            <KiboParticles active={visualState === 'celebrate'} />
            <KiboBody visualState={visualState} petSize={petSize} wrapperRef={wrapperRef} eyesRef={eyesRef} />
          </div>
        </button>
      </div>
    </div>
  );
}
