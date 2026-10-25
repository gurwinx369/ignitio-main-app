// lib/analytics/useGlobalDropoffTracker.ts
'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { trackEvent, ANALYTICS_EVENTS } from './events';

/**
 * Global Drop-off Tracker
 * Automatically tracks which screen/route the user abandoned the product on
 * using standard 'pagehide' browser lifecycle event.
 */
export function useGlobalDropoffTracker(): void {
  const pathname = usePathname();
  const routeEnteredAtRef = useRef<number>(0);
  const currentRouteRef = useRef<string>(pathname);

  useEffect(() => {
    currentRouteRef.current = pathname;
    routeEnteredAtRef.current = Date.now();
  }, [pathname]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePageHide = () => {
      const elapsed = Date.now() - routeEnteredAtRef.current;
      // Filter out instant/accidental sub-second bounces (< 800ms)
      if (elapsed > 800) {
        trackEvent(ANALYTICS_EVENTS.SCREEN_ABANDONED, {
          route: currentRouteRef.current || window.location.pathname,
          time_spent_ms: elapsed,
        });
      }
    };

    window.addEventListener('pagehide', handlePageHide);
    return () => {
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, []);
}

/**
 * Invisible helper component to mount the drop-off tracker in the root provider
 */
export function GlobalDropoffTracker(): null {
  useGlobalDropoffTracker();
  return null;
}
