// lib/analytics/providers/AmplitudeProvider.ts
// Amplitude browser SDK adapter. Mirrors PostHog init pattern:
// - Disabled on localhost unless NEXT_PUBLIC_AMPLITUDE_DEBUG=true
// - Automatic pageview and session tracking enabled
// - Pre-seeds user identity from localStorage to prevent Anonymous User race
// - Integrates Session Replay with conservative privacy masking
// - Never throws — analytics must never break user interactions

import * as amplitude from '@amplitude/analytics-browser';
import { sessionReplayPlugin } from '@amplitude/plugin-session-replay-browser';

let initialized = false;

export function initAmplitude(): void {
  if (initialized || typeof window === 'undefined') return;

  const apiKey = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;
  if (!apiKey) return;

  const isLocalhost =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';

  if (isLocalhost && process.env.NEXT_PUBLIC_AMPLITUDE_DEBUG !== 'true') return;

  try {
    // 1. Register Session Replay plugin with privacy guardrails
    try {
      const sessionReplay = sessionReplayPlugin({
        sampleRate: 1.0, // Capture 100% of sessions in testing/active tier
        privacyConfig: {
          defaultMaskLevel: 'conservative', // Mask inputs and sensitive PII
        },
      });
      amplitude.add(sessionReplay);
    } catch (pluginErr) {
      console.warn('[Amplitude] Session Replay plugin failed to register:', pluginErr);
    }

    // 2. Initialize Core Browser SDK
    amplitude.init(apiKey, {
      defaultTracking: {
        pageViews: true,
        sessions: true,
        formInteractions: false,
        fileDownloads: false,
      },
      flushIntervalMillis: 500,
      // Use Debug on localhost so init is visible in DevTools console
      logLevel: isLocalhost
        ? amplitude.Types.LogLevel.Debug
        : amplitude.Types.LogLevel.Warn,
    });

    // 3. Pre-seed User ID from cached session if available to avoid Anonymous User race
    try {
      const cachedUid = localStorage.getItem('ignitio:active_uid');
      if (cachedUid) {
        amplitude.setUserId(cachedUid);
        if (isLocalhost) {
          console.log(`[Amplitude] Restored cached user ID: ${cachedUid}`);
        }
      }
    } catch {
      // Storage access may be restricted; ignore
    }

    initialized = true;
    if (isLocalhost) {
      console.log('[Amplitude] Initialized successfully in debug mode with Session Replay');
    }
  } catch (err) {
    // Init failure must never propagate — degrade silently
    console.warn('[Amplitude] Init failed:', err);
  }
}

/**
 * Track a client-side Amplitude event.
 * Never pass PII (email, full name, password) in eventProperties.
 * Lazy-init fallback: if called before initAmplitude(), self-initializes.
 */
export function amplitudeTrack(
  eventName: string,
  properties: Record<string, any> = {}
): void {
  // Lazy-init safety net: handles the case where amplitudeTrack is called
  // before the module-level initAmplitude() runs (e.g., during SSR hydration race).
  if (!initialized) initAmplitude();
  if (!initialized) return;

  try {
    if (process.env.NEXT_PUBLIC_AMPLITUDE_DEBUG === 'true') {
      console.log(`[Amplitude] track → "${eventName}"`, properties);
    }
    amplitude.track(eventName, properties);
  } catch (err) {
    console.warn(`[Amplitude] Failed to track "${eventName}":`, err);
  }
}

/**
 * Identify a user in Amplitude with stable userId and person traits.
 * Call after authentication — mirrors posthog.identify().
 */
export function amplitudeIdentify(
  userId: string,
  traits: Record<string, any> = {}
): void {
  if (!initialized) initAmplitude();
  if (!initialized || !userId) return;
  try {
    amplitude.setUserId(userId);
    const identifyObj = new amplitude.Identify();
    Object.entries(traits).forEach(([key, value]) => {
      identifyObj.set(key, value);
    });
    amplitude.identify(identifyObj);
  } catch (err) {
    console.warn('[Amplitude] Failed to identify user:', err);
  }
}

/**
 * Reset Amplitude session and userId on logout.
 * Prevents cross-user session contamination — mirrors posthog.reset().
 */
export function amplitudeReset(): void {
  if (!initialized) return;
  try {
    amplitude.reset();
  } catch (err) {
    console.warn('[Amplitude] Failed to reset session:', err);
  }
}
