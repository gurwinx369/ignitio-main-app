'use client'

import { useEffect } from "react"

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'

export function PostHogProvider({ children }) {
    useEffect(() => {
        if (!posthog.__loaded) {
            posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
                api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
                defaults: '2025-11-30'
            })
        }
    }, [])

    return (
        <PHProvider client={posthog}>
            {children}
        </PHProvider>
    )
}
