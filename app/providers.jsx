'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import posthog from 'posthog-js'
import { PostHogProvider as PHProvider, usePostHog } from 'posthog-js/react'

// Page view tracking component
function PostHogPageViewTracker() {
  const posthogClient = usePostHog()
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (pathname && posthogClient) {
      const url = window.location.origin + pathname + window.location.search
      posthogClient.capture('$pageview', { $current_url: url })
    }
  }, [pathname, posthogClient])

  return null
}

export function PostHogProvider({ children }) {
  useEffect(() => {
    const initPostHog = () => {
      if (!posthog.__loaded && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
        posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
          api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
          ui_host: 'https://us.posthog.com',
          defaults: '2026-01-30',
          capture_pageview: false, // We handle this manually
          capture_pageleave: true,
        })
      }
    }

    if (typeof window !== 'undefined') {
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(initPostHog)
      } else {
        setTimeout(initPostHog, 1000)
      }
    }
  }, [])

  return (
    <PHProvider client={posthog}>
      <PostHogPageViewTracker />
      {children}
    </PHProvider>
  )
}