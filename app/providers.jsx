'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { GlobalDropoffTracker } from '@/lib/analytics/useGlobalDropoffTracker'
import { initAmplitude } from '@/lib/analytics/providers/AmplitudeProvider'
import '@/lib/analytics/dispatcher'

// PostHog: init at module level - synchronous, no race condition with identify or pageview
const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

if (
  typeof window !== 'undefined' &&
  process.env.NEXT_PUBLIC_POSTHOG_KEY &&
  (!isLocalhost || process.env.NEXT_PUBLIC_POSTHOG_DEBUG === 'true')
) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: isLocalhost
      ? (process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com')
      : '/ingest',
    ui_host: 'https://us.posthog.com',
    defaults: '2026-08-30',
    autocapture: false,
    capture_pageview: 'history_change',
    capture_pageleave: 'if_capture_pageview',
    capture_dead_clicks: false,
    capture_exceptions: true,
    session_recording: {
      maskAllInputs: true,
      maskTextSelector: '*',
    },
  });
}

// Amplitude: also init at module level (same pattern as PostHog above).
// The typeof window guard inside initAmplitude() handles SSR correctly.
// MUST be module-level — useEffect() runs AFTER child components' effects,
// causing a race where tracked events fire before initialized=true.
initAmplitude();

export function PostHogProvider({ children }) {
  return (
    <PHProvider client={posthog}>
      <GlobalDropoffTracker />
      {children}
    </PHProvider>
  );
}