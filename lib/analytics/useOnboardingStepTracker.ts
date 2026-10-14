// lib/analytics/useOnboardingStepTracker.ts
'use client';

import { useEffect, useRef, useCallback, useMemo } from 'react';
import posthog from 'posthog-js';
import { getStepIndex } from './onboardingSteps';
import { getOrCreateOnboardingSessionId } from './onboardingSession';

interface UseOnboardingStepTrackerOptions {
  stepId: string;
  stepIndex?: number;
  extraProps?: Record<string, any>;
  enabled?: boolean;
}

/**
 * Reusable hook to track onboarding step view, completion, and drop-off/abandonment.
 * Uses 'pagehide' for reliable exit detection across mobile and desktop browsers.
 */
export function useOnboardingStepTracker({
  stepId,
  stepIndex,
  extraProps = {},
  enabled = true,
}: UseOnboardingStepTrackerOptions) {
  const stepEnteredAtRef = useRef<number>(0);
  const completedRef = useRef<boolean>(false);
  const resolvedIndex = stepIndex ?? getStepIndex(stepId);
  const serializedExtraProps = useMemo(() => JSON.stringify(extraProps), [extraProps]);

  useEffect(() => {
    if (!enabled || !stepId) return;

    stepEnteredAtRef.current = Date.now();
    completedRef.current = false;
    const sessionId = getOrCreateOnboardingSessionId();
    const props = JSON.parse(serializedExtraProps);

    try {
      posthog.capture('onboarding_step_viewed', {
        step_id: stepId,
        step_index: resolvedIndex,
        onboarding_session_id: sessionId,
        ...props,
      });
    } catch (e) {
      console.warn('PostHog capture onboarding_step_viewed error:', e);
    }

    const handleLeave = () => {
      // Only fire abandonment if the user did not explicitly complete this step
      if (!completedRef.current) {
        try {
          const elapsed = stepEnteredAtRef.current > 0 ? Date.now() - stepEnteredAtRef.current : 0;
          posthog.capture('onboarding_step_abandoned', {
            step_id: stepId,
            step_index: resolvedIndex,
            onboarding_session_id: sessionId,
            time_on_step_ms: elapsed,
            ...props,
          });
        } catch {
          // Ignore exit tracking errors
        }
      }
    };

    window.addEventListener('pagehide', handleLeave);
    return () => {
      window.removeEventListener('pagehide', handleLeave);
    };
  }, [stepId, resolvedIndex, enabled, serializedExtraProps]);

  const markStepCompleted = useCallback(
    (customProperties: Record<string, any> = {}) => {
      if (!enabled || !stepId) return;
      completedRef.current = true;
      const sessionId = getOrCreateOnboardingSessionId();
      const props = JSON.parse(serializedExtraProps);

      try {
        const elapsed = stepEnteredAtRef.current > 0 ? Date.now() - stepEnteredAtRef.current : 0;
        posthog.capture('onboarding_step_completed', {
          step_id: stepId,
          step_index: resolvedIndex,
          onboarding_session_id: sessionId,
          time_on_step_ms: elapsed,
          ...props,
          ...customProperties,
        });
      } catch (e) {
        console.warn('PostHog capture onboarding_step_completed error:', e);
      }
    },
    [stepId, resolvedIndex, enabled, serializedExtraProps]
  );

  return {
    markStepCompleted,
  };
}
