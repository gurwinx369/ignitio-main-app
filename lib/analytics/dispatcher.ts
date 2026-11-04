// lib/analytics/dispatcher.ts
// Central fan-out layer: routes every analytics call to PostHog + Amplitude in parallel.
// Adding or removing a provider happens here — zero changes needed in call sites.
//
// Rules enforced by this module:
// - Provider failures are isolated: one failing never blocks the other
// - SSR guard: no browser SDK calls outside window context
// - Zero business logic — pure pass-through
// - Transparent proxy on posthog instance ensures legacy / direct posthog.* calls also reach Amplitude

import posthog from 'posthog-js';
import {
  amplitudeTrack,
  amplitudeIdentify,
  amplitudeReset,
} from './providers/AmplitudeProvider';

let isDispatching = false;

// Transparent bridging: intercept direct calls to posthog instance so no events are lost
if (typeof window !== 'undefined' && posthog) {
  try {
    const originalCapture = posthog.capture?.bind(posthog);
    if (originalCapture) {
      posthog.capture = (eventName: string, properties?: any, ...rest: any[]) => {
        if (!isDispatching && typeof eventName === 'string' && !eventName.startsWith('$')) {
          amplitudeTrack(eventName, properties || {});
        }
        return originalCapture(eventName, properties, ...rest);
      };
    }

    const originalIdentify = posthog.identify?.bind(posthog);
    if (originalIdentify) {
      posthog.identify = (new_distinct_id?: string, user_properties?: any, ...rest: any[]) => {
        if (!isDispatching && new_distinct_id) {
          amplitudeIdentify(new_distinct_id, user_properties || {});
        }
        return originalIdentify(new_distinct_id, user_properties, ...rest);
      };
    }

    const originalReset = posthog.reset?.bind(posthog);
    if (originalReset) {
      posthog.reset = (...rest: any[]) => {
        if (!isDispatching) {
          amplitudeReset();
        }
        return originalReset(...rest);
      };
    }
  } catch (err) {
    console.warn('[Analytics Dispatcher] Failed to attach PostHog transparent proxy:', err);
  }
}

/**
 * Fan-out a custom event to PostHog and Amplitude simultaneously.
 * Properties are shared across both providers as-is.
 */
export function dispatchTrack(
  eventName: string,
  properties: Record<string, any> = {}
): void {
  if (typeof window === 'undefined') return;

  isDispatching = true;
  try {
    // PostHog — existing behaviour, unchanged
    try {
      posthog.capture(eventName, properties);
    } catch (err) {
      console.warn(`[Analytics] PostHog failed to track "${eventName}":`, err);
    }

    // Amplitude — parallel, never blocks PostHog
    amplitudeTrack(eventName, properties);
  } finally {
    isDispatching = false;
  }
}

/**
 * Identify an authenticated user across both providers.
 * Call once after login/signup with stable internal userId.
 */
export function dispatchIdentify(
  userId: string,
  traits: { role?: string; plan?: string; [key: string]: any } = {}
): void {
  if (typeof window === 'undefined' || !userId) return;

  isDispatching = true;
  try {
    try {
      posthog.identify(userId, traits);
    } catch (err) {
      console.warn('[Analytics] PostHog failed to identify user:', err);
    }

    amplitudeIdentify(userId, traits);
  } finally {
    isDispatching = false;
  }
}

/**
 * Reset user identity on logout across both providers.
 * Prevents session cross-contamination between users on shared devices.
 */
export function dispatchReset(): void {
  if (typeof window === 'undefined') return;

  isDispatching = true;
  try {
    try {
      posthog.reset();
    } catch (err) {
      console.warn('[Analytics] PostHog failed to reset:', err);
    }

    amplitudeReset();
  } finally {
    isDispatching = false;
  }
}
