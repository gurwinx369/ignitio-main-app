// lib/analytics/onboardingSession.ts
// Handles persistent onboarding_session_id and activation timestamps.

const ONBOARDING_SESSION_STORAGE_KEY = 'ignitio:onboarding_session_id';
const SIGNUP_TIMESTAMP_STORAGE_KEY = 'ignitio:signup_timestamp';

/**
 * Retrieves the shared onboarding session ID or generates a new UUIDv4 if none exists.
 * Stored in localStorage so anonymous events and post-signup events stay correlated.
 * Returns null in SSR contexts (typeof window === 'undefined') so callers can
 * conditionally omit the property rather than sending an empty-string value to PostHog.
 */
export function getOrCreateOnboardingSessionId(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    let sessionId = localStorage.getItem(ONBOARDING_SESSION_STORAGE_KEY);
    if (!sessionId) {
      sessionId =
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : 'obs_' + Date.now() + '_' + Math.random().toString(36).substring(2, 10);
      localStorage.setItem(ONBOARDING_SESSION_STORAGE_KEY, sessionId);
    }
    return sessionId;
  } catch {
    return 'obs_' + Date.now();
  }
}

/**
 * Records the timestamp of successful signup to calculate time-to-first-lesson (activation speed).
 */
export function recordSignupTimestamp(): void {
  if (typeof window === 'undefined') return;
  try {
    if (!localStorage.getItem(SIGNUP_TIMESTAMP_STORAGE_KEY)) {
      localStorage.setItem(SIGNUP_TIMESTAMP_STORAGE_KEY, Date.now().toString());
    }
  } catch {
    // Ignore storage quota or access issues
  }
}

/**
 * Returns the recorded signup timestamp, or null if unrecorded.
 */
export function getSignupTimestamp(): number | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SIGNUP_TIMESTAMP_STORAGE_KEY);
    if (!raw) return null;
    const parsed = parseInt(raw, 10);
    return isNaN(parsed) ? null : parsed;
  } catch {
    return null;
  }
}

/**
 * Calculates time in ms since signup if known.
 */
export function getTimeSinceSignupMs(): number | null {
  const signupTime = getSignupTimestamp();
  if (!signupTime) return null;
  const diff = Date.now() - signupTime;
  return diff >= 0 ? diff : null;
}
