'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import posthog from 'posthog-js'
import { PostHogProvider as PHProvider, usePostHog } from 'posthog-js/react'

// Init at module level — synchronous, no race condition with identify or pageview
// The requestIdleCallback pattern was causing identify/pageview to fire before init
if (
  typeof window !== 'undefined' &&
  process.env.NEXT_PUBLIC_POSTHOG_KEY &&
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1'
) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    ui_host: 'https://us.posthog.com',
    defaults: '2026-01-30',
    capture_pageview: false, // Manual SPA tracking below
    capture_pageleave: true,
    session_recording: {
      maskAllInputs: true,
      maskTextSelector: '[data-ph-mask]',
    },
  })
}

function PostHogPageViewTracker() {
  const posthogClient = usePostHog()
  const pathname = usePathname()

  useEffect(() => {
    if (pathname && posthogClient) {
      posthogClient.capture('$pageview', {
        $current_url: window.location.origin + pathname + window.location.search,
      })
    }
  }, [pathname, posthogClient])

  return null
}

export function PostHogProvider({ children }) {
  return (
    <PHProvider client={posthog}>
      <PostHogPageViewTracker />
      {children}
    </PHProvider>
  )
}