# PostHog Analytics Architecture & Implementation Guide

This document explains the noise-reduced, high-accuracy analytics pipeline implemented in Ignitio across both client (`posthog-js`) and server (`posthog-node`).

---

## 1. What Was the Problem Before?

Previously, the analytics setup suffered from four major issues:
1. **Excessive Noise (`autocapture: true`)**: PostHog automatically recorded every click, div interaction, focus event, dead click, and rage click across the application. This created thousands of ambiguous rows per user and bloated ingestion.
2. **Broken Session Durations**: In `app/providers.jsx`, automatic pageview tracking was disabled (`capture_pageview: false`) in favor of an uncoordinated manual hook, while `capture_pageleave: true` was kept on. Without a synchronized anchor, PostHog's duration timer produced 0-second, negative, or fragmented session lengths across Next.js SPA transitions.
3. **Double / Triple Event Firing**: In React StrictMode and during state re-renders, lifecycle effects in onboarding components (`Paywall.jsx`, `DiagnosticResults.jsx`, `DiagnosticAssessment.jsx`) lacked guards, firing identical view and abandon events multiple times per visit.
4. **Ad-Blocker Loss & Untrusted Client Events**: Direct browser network requests to `us.i.posthog.com` were blocked by client extensions, and critical conversion metrics (signups, token savings) had no authoritative server verification.

---

## 2. Summary of Touched & Created Files

| File | Type | Changes & Purpose |
| :--- | :--- | :--- |
| [`next.config.mjs`](file:///c:/ignitio_launch/ignitio-main-app/next.config.mjs) | Config | Added first-party reverse proxy rewrites for `/ingest/static/*` and `/ingest/*` to bypass ad blockers cleanly without custom middleware overhead. |
| [`app/providers.jsx`](file:///c:/ignitio_launch/ignitio-main-app/app/providers.jsx) | Client Provider | Set `autocapture: false`, enabled synchronized SPA navigation (`capture_pageview: 'history_change'`, `capture_pageleave: 'if_capture_pageview'`), enabled strict input/text masking, and mounted the global drop-off tracker. |
| [`lib/analytics/events.ts`](file:///c:/ignitio_launch/ignitio-main-app/lib/analytics/events.ts) | Core Utility | Centralized, type-safe registry of canonical event names (`object_action`) and safe client capture/identity helpers (`trackEvent`, `identifyUser`, `resetUserIdentity`). |
| [`lib/analytics/serverAnalytics.ts`](file:///c:/ignitio_launch/ignitio-main-app/lib/analytics/serverAnalytics.ts) | Server Utility | Configured `posthog-node` with `flushAt: 1, flushInterval: 0` and created `captureServerEvent()` for reliable, non-dropping serverless event dispatch. |
| [`lib/analytics/useGlobalDropoffTracker.ts`](file:///c:/ignitio_launch/ignitio-main-app/lib/analytics/useGlobalDropoffTracker.ts) | Client Hook | Listens to browser `pagehide` events to track which route the user was on when they abandoned the product and how much time was spent. |
| [`features/auth/components/SignupForm.jsx`](file:///c:/ignitio_launch/ignitio-main-app/features/auth/components/SignupForm.jsx) | Client Component | Fires `signup_submitted` (`method: 'email' \| 'google'`) when the user submits credentials. |
| [`app/api/v2/onboarding/(core)/bootstrap/route.js`](file:///c:/ignitio_launch/ignitio-main-app/app/api/v2/onboarding/%28core%29/bootstrap/route.js) | Server Route | Emits authoritative `user_signed_up` via `posthog-node` after MongoDB account creation succeeds. |
| [`app/onboarding/(core)/streak/page.js`](file:///c:/ignitio_launch/ignitio-main-app/app/onboarding/%28core%29/streak/page.js) | Client Page | Tracks `notification_activated` (allowed) and `notification_declined` (skipped) after the first lesson. Uses lazy state initialization to prevent render cascading. |
| [`features/notifications/context/NotificationContext.js`](file:///c:/ignitio_launch/ignitio-main-app/features/notifications/context/NotificationContext.js) | Client Context | Tracks `notification_activated` (`source: 'in_app_modal'`) when native permissions are granted. |
| [`app/api/v1/notifications/save-token/route.js`](file:///c:/ignitio_launch/ignitio-main-app/app/api/v1/notifications/save-token/route.js) | Server Route | Emits authoritative `notification_activated` via `posthog-node` once the FCM token is persisted in MongoDB. |
| [`components/streak-sparked/celebrate-cta.jsx`](file:///c:/ignitio_launch/ignitio-main-app/components/streak-sparked/celebrate-cta.jsx) | Client Component | Tracks `streak_celebration_clicked` (`action: 'continue_to_roadmap'`) when the user clicks Continue. |
| [`components/streak-sparked/streak-sparked.jsx`](file:///c:/ignitio_launch/ignitio-main-app/components/streak-sparked/streak-sparked.jsx) | Client Component | Tracks `streak_celebration_clicked` (`action: 'brew_revealed'`) when the brew animation completes. |
| [`features/onboarding/v4-genai/paywall/Paywall.jsx`](file:///c:/ignitio_launch/ignitio-main-app/features/onboarding/v4-genai/paywall/Paywall.jsx) | Client Component | Added `hasFiredPaywallViewRef` guard to eliminate duplicate `paywall_viewed` events on mount. |
| [`features/onboarding/v4-genai/results/DiagnosticResults.jsx`](file:///c:/ignitio_launch/ignitio-main-app/features/onboarding/v4-genai/results/DiagnosticResults.jsx) | Client Component | Added `hasFiredLoadingViewRef` guard to eliminate duplicate `roadmap_loading` view events. |
| [`features/onboarding/v4-genai/diagnostic/DiagnosticAssessment.jsx`](file:///c:/ignitio_launch/ignitio-main-app/features/onboarding/v4-genai/diagnostic/DiagnosticAssessment.jsx) | Client Component | Added `lastTrackedQRef` to ensure question view events only fire on genuine question transitions. |

---

## 3. How the New Analytics Works Step-by-Step

### A. First-Party Ingestion (Ad-Blocker Resilience)
```
Browser Request (/ingest/...)
  │
  ▼
Next.js Edge Rewrites (next.config.mjs)
  ├─► /ingest/static/* ──► https://us-assets.i.posthog.com/static/*
  └─► /ingest/*        ──► https://us.i.posthog.com/*
```
Because traffic goes through your domain, ad blockers do not flag it as a third-party tracker. Browser events, replays, and flags load cleanly for all users.

### B. Clean Navigation & Accurate Session Durations
```
User navigates /onboarding/streak ──► /home
  │
  ├─► PostHog history_change captures $pageleave for previous route with exact duration_seconds
  ├─► PostHog starts new $pageview session anchor for /home
  └─► GlobalDropoffTracker updates internal enteredAt timestamp
```
`capture_pageview: 'history_change'` and `capture_pageleave: 'if_capture_pageview'` ensure that every route transition creates an exact, paired entry and exit timestamp. Session duration metrics are no longer 0 or corrupted.

### C. The Signup Funnel Flow
```
1. User clicks "Sign Up" in SignupForm.jsx
   └─► Client emits: signup_submitted (method: "email" | "google")

2. POST /api/v2/onboarding/bootstrap
   ├─► UserProfile created in MongoDB
   └─► Server (posthog-node) emits: user_signed_up (role, goal, roadmap)

3. Redirection to /home
```
Comparing `signup_submitted` to `user_signed_up` in PostHog reveals the exact drop-off during credential validation or network delays.

### D. The Drop-Off Detection Flow
```
User closes tab or navigates away
  │
  └─► Window 'pagehide' event triggers
        └─► GlobalDropoffTracker checks elapsed time (> 800ms)
              └─► Emits: screen_abandoned { route: "/onboarding/paywall", time_spent_ms: 14200 }
```
This isolates the exact bottlenecks where users leave the product.

### E. Notification Activation Tracking (Hybrid)
```
Client Action (streak/page.js or NotificationContext.js)
  ├─ User allows prompt: client emits notification_activated
  └─ User skips prompt: client emits notification_declined

Server Persistence (/api/v1/notifications/save-token)
  └─ After MongoDB writes FCM token: posthog-node emits notification_activated (source: "fcm_token_persisted")
```
This gives both the UI conversion rate (`activated / (activated + declined)`) and authoritative database-backed push reach.

### F. Streak Celebration Loop
```
User completes "Hold to Brew"
  └─► streak-sparked.jsx emits: streak_celebration_clicked { action: "brew_revealed", streak_count: 1 }

User clicks "Continue"
  └─► celebrate-cta.jsx emits: streak_celebration_clicked { action: "continue_to_roadmap", target_href: "/home/roadmaps/python-beginner" }
```

---

## 4. Architectural Alternatives Considered

1. **Custom Middleware vs Next.js Rewrites**:
   - *Alternative:* Running a custom Node middleware for proxying.
   - *Decision:* Next.js `rewrites` run natively at the routing layer without spawning Node.js request runtime execution for static script chunks.
2. **Manual `usePathname` Hook vs Native `history_change`**:
   - *Alternative:* Firing manual `$pageview` in a `useEffect` on pathname changes.
   - *Decision:* Manual pageview hooks desynchronize with PostHog's `$pageleave` calculations. Letting PostHog listen directly to the History API (`history_change` + `if_capture_pageview`) guarantees matching entry/exit duration calculations.
3. **Client-Only vs Hybrid Server (`posthog-node`) Tracking**:
   - *Alternative:* Firing all events from React components.
   - *Decision:* Business-critical milestones (`user_signed_up`, `notification_activated`) are verified by the backend after database commit. If a user closes the browser or network drops right after submitting, the database event is still captured with 100% fidelity.
