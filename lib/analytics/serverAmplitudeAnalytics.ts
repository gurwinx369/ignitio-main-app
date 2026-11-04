// lib/analytics/serverAmplitudeAnalytics.ts
// Node.js server-side Amplitude client for capturing authoritative server events.
// Mirrors the pattern in serverAnalytics.ts (PostHog server-side).
//
// Security: Uses NEXT_PUBLIC_AMPLITUDE_API_KEY for HTTP ingestion (safe on server too).
// AMPLITUDE_SECRET_KEY is reserved for Management API calls only — never used here.

import * as amplitude from '@amplitude/analytics-node';

let initialized = false;

function ensureInit(): boolean {
  if (initialized) return true;

  // HTTP ingestion key — safe for server use despite NEXT_PUBLIC_ prefix
  const apiKey = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;
  if (!apiKey) return false;

  try {
    amplitude.init(apiKey, {
      flushIntervalMillis: 0,   // Flush immediately in serverless contexts
      flushQueueSize: 1,
    });
    initialized = true;
    return true;
  } catch {
    return false;
  }
}

/**
 * Capture an authoritative server-side Amplitude event after database commit succeeds.
 * Mirrors captureServerEvent() in serverAnalytics.ts.
 *
 * @param userId - Stable internal user ID (not email, not anonymous)
 * @param eventType - Event name from ANALYTICS_EVENTS taxonomy
 * @param eventProperties - Structured event data. Never include PII.
 */
export async function captureAmplitudeServerEvent(
  userId: string,
  eventType: string,
  eventProperties: Record<string, any> = {}
): Promise<void> {
  if (!ensureInit() || !userId) return;

  try {
    amplitude.track({
      event_type: eventType,
      user_id: userId,
      event_properties: eventProperties,
    });
    // Flush immediately — serverless functions shut down after response
    await amplitude.flush();
  } catch (e) {
    console.warn(`[Amplitude Server] Failed to capture event "${eventType}":`, e);
  }
}
