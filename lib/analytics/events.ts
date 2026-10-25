// lib/analytics/events.ts
// Single source of truth for PostHog event taxonomy across Ignitio.
// Follows object_action naming convention and prevents scattered string literals.

import posthog from 'posthog-js';

export const ANALYTICS_EVENTS = {
  // Onboarding lifecycle
  ONBOARDING_STARTED: 'onboarding_started',
  ONBOARDING_STEP_VIEWED: 'onboarding_step_viewed',
  ONBOARDING_STEP_COMPLETED: 'onboarding_step_completed',
  ONBOARDING_STEP_ABANDONED: 'onboarding_step_abandoned',
  ONBOARDING_FRICTION_DETECTED: 'onboarding_friction_detected',

  // Authentication & Identity
  SIGNUP_SUBMITTED: 'signup_submitted',
  USER_SIGNED_UP: 'user_signed_up',
  USER_LOGGED_IN: 'user_logged_in',

  // Learning & Roadmaps
  ROADMAP_STARTED: 'roadmap_started',
  LESSON_STARTED: 'lesson_started',
  LESSON_COMPLETED: 'lesson_completed',

  // Gamification & Streak
  STREAK_CELEBRATION_CLICKED: 'streak_celebration_clicked',

  // Notifications & Permissions
  NOTIFICATION_ACTIVATED: 'notification_activated',
  NOTIFICATION_DECLINED: 'notification_declined',

  // Paywall & Monetization
  PAYWALL_VIEWED: 'paywall_viewed',
  PRICING_TIER_SELECTED: 'pricing_tier_selected',
  PAYMENT_ATTEMPTED: 'payment_attempted',
  PAYMENT_SUCCEEDED: 'payment_succeeded',
  PAYMENT_FAILED: 'payment_failed',
  CHECKOUT_ABANDONED: 'checkout_abandoned',
  PAYWALL_SKIPPED: 'paywall_skipped',

  // Navigation & Drop-Off
  SCREEN_ABANDONED: 'screen_abandoned',
  PAGE_NOT_FOUND_VIEWED: 'page_not_found_viewed',
} as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

/**
 * Capture a typed client-side analytics event.
 * Never pass PII (passwords, email, full names) in event properties;
 * use posthog.identify() for person traits.
 */
export function trackEvent(
  eventName: AnalyticsEventName,
  properties: Record<string, any> = {}
): void {
  if (typeof window === 'undefined') return;

  try {
    posthog.capture(eventName, properties);
  } catch (err) {
    // Analytics should never break user interactions
    console.warn(`[Analytics] Failed to track ${eventName}:`, err);
  }
}

/**
 * Identify an authenticated user with stable internal ID and person traits.
 */
export function identifyUser(
  userId: string,
  traits: { role?: string; plan?: string; [key: string]: any } = {}
): void {
  if (typeof window === 'undefined' || !userId) return;

  try {
    posthog.identify(userId, traits);
  } catch (err) {
    console.warn('[Analytics] Failed to identify user:', err);
  }
}

/**
 * Reset identity on user logout to prevent session cross-contamination.
 */
export function resetUserIdentity(): void {
  if (typeof window === 'undefined') return;

  try {
    posthog.reset();
  } catch (err) {
    console.warn('[Analytics] Failed to reset user identity:', err);
  }
}
