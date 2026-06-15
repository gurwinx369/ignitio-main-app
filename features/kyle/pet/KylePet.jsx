"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useKylePetPosition } from './useKylePetPosition';
import { kylePetConfig } from './kylePetConfig';
import KylePetBubble from './KylePetBubble';
import { useAskKyle } from '@/features/kyle/ask/useAskKyle';

function getKyleRouteContext(pathname) {
  if (!pathname) return 'default';
  if (pathname.includes('/quiz')) return 'quiz';
  if (pathname.includes('/assignment')) return 'assignment';
  if (pathname.includes('/lesson') || pathname.includes('/video') || pathname.includes('/interactive-overviews')) return 'lesson';
  if (pathname.includes('/roadmaps')) return 'roadmap';
  if (pathname.includes('/home')) return 'dashboard';
  return 'default';
}

export default function KylePet() {
  const pathname = usePathname();
  const { position, isDragging, hasMovedBeyondClickThreshold, isReady, petSize, resetPosition, cleanupDragState, handlers } = useKylePetPosition();
  const [isSleeping, setIsSleeping] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [message, setMessage] = useState(null);
  const bubbleTimeoutRef = useRef(null);
  const sleepTimeoutRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [forcedState, setForcedState] = useState(null);
  const forcedStateTimeoutRef = useRef(null);

  useEffect(() => {
    try {
      const hiddenState = localStorage.getItem(kylePetConfig.storageKeys.hidden);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (hiddenState === 'true') setIsHidden(true);
    } catch (e) {}

    if (typeof window !== 'undefined' && kylePetConfig.preloadStates) {
      kylePetConfig.preloadStates.forEach((stateName) => {
        const src = kylePetConfig.states[stateName];
        if (src) {
          const img = new window.Image();
          img.src = src;
        }
      });
    }
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
    // Removed mousemove to prevent excessive resets and performance issues
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

      if (state === 'thinking' || state === 'celebrating') {
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
    if (forcedState) return forcedState;
    if (message) return 'speaking';
    if (isSleeping) return 'sleeping';
    if (isHovered) return 'hovered';
    return 'idle';
  })();

  const closeBubble = useCallback(() => {
    setMessage(null);
    if (bubbleTimeoutRef.current) {
      clearTimeout(bubbleTimeoutRef.current);
    }
    resetSleepTimer();
  }, [resetSleepTimer]);

  const handleClick = useCallback((e) => {
    if (hasMovedBeyondClickThreshold) return;
    
    const context = getKyleRouteContext(pathname);
    const msgs = kylePetConfig.routeMessages[context] || kylePetConfig.routeMessages.default;
    const randomMsg = msgs[Math.floor(Math.random() * msgs.length)];
    
    setMessage(randomMsg);
    resetSleepTimer();

    if (bubbleTimeoutRef.current) {
      clearTimeout(bubbleTimeoutRef.current);
    }

    bubbleTimeoutRef.current = setTimeout(() => {
      closeBubble();
    }, kylePetConfig.bubble.autoCloseMs);
  }, [hasMovedBeyondClickThreshold, resetSleepTimer, closeBubble, pathname]);

  const handleFocusTip = useCallback((e) => {
    e.stopPropagation();
    const tips = kylePetConfig.focusTips;
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    setMessage(randomTip);
    resetSleepTimer();
    if (bubbleTimeoutRef.current) clearTimeout(bubbleTimeoutRef.current);
    bubbleTimeoutRef.current = setTimeout(closeBubble, kylePetConfig.bubble.autoCloseMs);
  }, [resetSleepTimer, closeBubble]);

  const { isOpen: isAskKyleOpen, openAskKyle } = useAskKyle();

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
    
    if (context === 'lesson') {
      setMessage("Use the lesson Ask Kyle tab for this concept-specific question.");
      resetSleepTimer();
      if (bubbleTimeoutRef.current) clearTimeout(bubbleTimeoutRef.current);
      bubbleTimeoutRef.current = setTimeout(closeBubble, kylePetConfig.bubble.autoCloseMs);
      return;
    }

    openAskKyle({
      source: "kyle-pet",
      mode: "general"
    });
    resetSleepTimer();
    closeBubble();
  }, [openAskKyle, resetSleepTimer, closeBubble, pathname]);

  const handleResetPosition = useCallback((e) => {
    e.stopPropagation();
    resetPosition();
    setMessage("Kyle is back in place.");
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

  if (!isReady) return null;

  if (isHidden) {
    const btnConfig = kylePetConfig.restoreButton || {
      positionClassName: "bottom-4 right-4",
      zIndexClassName: "z-[50]",
      label: "Show Kyle"
    };

    return (
      <button
        onClick={handleShowKyle}
        className={`fixed ${btnConfig.positionClassName} ${btnConfig.zIndexClassName} text-xs font-medium px-4 py-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-full shadow-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors`}
      >
        {btnConfig.label}
      </button>
    );
  }

  const isLeftAligned = window.innerWidth ? position.x < window.innerWidth / 2 : false;

  return (
    <div
      className={`fixed z-[90] touch-none select-none ${isDragging ? 'transition-none' : 'transition-transform duration-200'} ${isAskKyleOpen ? 'pointer-events-none' : ''}`}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        width: petSize,
        height: petSize,
      }}
    >
      <style>{`
        @keyframes kyle-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @media (prefers-reduced-motion: no-preference) {
          .kyle-idle-float {
            animation: kyle-float 4s ease-in-out infinite;
          }
        }
      `}</style>

      <div className="relative w-full h-full">
        <KylePetBubble 
          message={message} 
          onClose={closeBubble} 
          isLeftAligned={isLeftAligned}
          onFocusTip={kylePetConfig.actions.focusTip?.enabled ? handleFocusTip : undefined}
          onAskKyle={kylePetConfig.actions.askKyle?.enabled ? handleAskKyle : undefined}
          onResetPosition={kylePetConfig.actions.resetPosition?.enabled ? handleResetPosition : undefined}
          onHideKyle={kylePetConfig.actions.hideKyle?.enabled ? handleHideKyle : undefined}
        />
        
        <button
          className={`relative w-full h-full rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 transition-all duration-300 ${!isDragging && !message && visualState === 'idle' ? 'kyle-idle-float' : ''}`}
          style={{
            cursor: isDragging ? 'grabbing' : 'grab',
            filter: isHovered || isDragging ? 'drop-shadow(0 0 12px rgba(6, 182, 212, 0.3))' : 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))',
          }}
          aria-label="Kyle AI mentor pet"
          onPointerEnter={() => setIsHovered(true)}
          onPointerLeave={() => setIsHovered(false)}
          onClick={handleClick}
          {...handlers}
        >
          <div className="relative w-full h-full">
            <Image
              src={kylePetConfig.states[visualState] || kylePetConfig.states.idle}
              alt={`Kyle is ${visualState}`}
              fill
              sizes={`${petSize}px`}
              className="object-contain pointer-events-none"
              priority
              draggable={false}
            />
          </div>
        </button>
      </div>
    </div>
  );
}
