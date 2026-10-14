"use client";
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export function useKiboScrollPhysics({ scrollRef }) {
  const lastScrollY = useRef(0);
  const lastScrollTarget = useRef(null);
  const scrollVelocity = useRef(0);
  const isScrolling = useRef(false);
  const scrollTimeout = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = (e) => {
      const target = e.target;
      const currentScrollY = target === document || target === window
        ? window.scrollY
        : (target.scrollTop || 0);

      // If we switched scroll containers, just reset the baseline
      if (lastScrollTarget.current !== target) {
        lastScrollTarget.current = target;
        lastScrollY.current = currentScrollY;
        return;
      }

      const dy = currentScrollY - lastScrollY.current;
      lastScrollY.current = currentScrollY;
      
      if (dy === 0) return;

      // Accumulate velocity, clamp it
      scrollVelocity.current += dy * 0.4;
      if (scrollVelocity.current > 50) scrollVelocity.current = 50;
      if (scrollVelocity.current < -50) scrollVelocity.current = -50;

      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);

      // Deadzone: Only apply stretch if velocity is high enough (avoids triggering on small scrolls)
      if (Math.abs(scrollVelocity.current) > 15) {
        isScrolling.current = true;

        if (scrollRef.current) {
          gsap.to(scrollRef.current, {
            y: -scrollVelocity.current * 0.6, // lag behind slightly less
            scaleY: 1 + Math.abs(scrollVelocity.current) * 0.003, // softer stretch
            scaleX: 1 - Math.abs(scrollVelocity.current) * 0.001, // softer squash
            duration: 0.15,
            ease: 'power1.out',
            overwrite: 'auto'
          });
        }
      }
      
      // When scroll stops, spring back
      scrollTimeout.current = setTimeout(() => {
        isScrolling.current = false;
        scrollVelocity.current = 0;
        
        if (scrollRef.current) {
          gsap.to(scrollRef.current, {
            y: 0,
            scaleY: 1,
            scaleX: 1,
            duration: 0.8,
            ease: 'elastic.out(1, 0.5)',
            overwrite: 'auto'
          });
        }
      }, 100);
    };

    // Use capture phase to catch scroll events on any child elements before they bubble
    window.addEventListener('scroll', handleScroll, { capture: true, passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll, { capture: true });
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, [scrollRef]);
}
