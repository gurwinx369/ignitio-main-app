// lib/analytics/friction.ts
// Custom friction tracking for onboarding and diagnostic steps.

import posthog from 'posthog-js';
import { getOrCreateOnboardingSessionId } from './onboardingSession';

export type FrictionType =
  | 'retry'
  | 'wrong_answer'
  | 'long_pause'
  | 'back_navigation'
  | 'form_error'
  | 'payment_retry';

export interface FrictionDetail {
  attempt_count?: number;
  pause_ms?: number;
  field_name?: string;
  error_type?: string;
  from_step?: string;
  to_step?: string;
  question_id?: string;
  reason?: string;
  [key: string]: any;
}

/**
 * Captures custom friction signal when a user struggles or encounters resistance on a step.
 */
export function trackOnboardingFriction(
  stepId: string,
  frictionType: FrictionType,
  detail: FrictionDetail = {}
): void {
  try {
    const sessionId = getOrCreateOnboardingSessionId();
    posthog.capture('onboarding_friction_detected', {
      step_id: stepId,
      friction_type: frictionType,
      onboarding_session_id: sessionId,
      detail,
    });
  } catch (err) {
    // Analytics should never break user interactions
    console.warn('Failed to capture onboarding_friction_detected:', err);
  }
}
