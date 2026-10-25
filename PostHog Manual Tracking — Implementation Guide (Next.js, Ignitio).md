# PostHog Manual Tracking — Implementation Guide

For: Ignitio (Next.js, \~1K weekly active users) · Audience: implementing engineer

## 1. The core decision: autocapture vs. manual — what each actually fixes

Two separate systems, two separate problems:

- **Autocapture (events)** auto-fires `$autocapture`, `$pageview`, `$pageleave` for every click/input/pageview using CSS-selector-based element matching. Noise here means: duplicate-looking events when your DOM changes, ambiguous names like "click" on a div with no semantic meaning, and event volume that balloons your bill without adding analytical value. **Manual events fix this** — you control exactly what's named and when it fires.
- **Session Replay** records DOM snapshots + mutations (rrweb-style) independently of whether autocapture is on. Its accuracy is governed by sampling rate, minimum duration, masking config, and whether the `/s/` upload endpoint gets through (ad blockers, broken reverse proxy). **Turning off autocapture does nothing for replay fidelity.** Replay fidelity is tuned separately — see §7.

**Recommendation for your scale (\~1K WAU):** Turn off autocapture for *events* (`autocapture: false`), keep `capture_pageview: false` and fire `$pageview` manually on route change (Next.js router doesn't reload the page, so the default pageview capture is unreliable in SPA mode anyway), and keep **session replay on as its own independent config** with explicit sampling/masking rules.

## 2. Does manual tracking reduce noise? By how much, realistically?

Yes, substantially, for a knowable reason: autocapture generates **every** click/input event, most of which answer no product question ("what do we do when this fires?" — PostHog's own recommended filter for whether an event is worth keeping). Manual tracking only generates events you decided have a downstream action attached. There's no universal percentage, because it depends on your UI density — but the practical effect at your scale is going from potentially thousands of ambiguous `$autocapture` rows per active user per week down to 10–30 well-named custom events per user per week, which is the band that actually supports clean funnels and retention analysis.

## 3. Does server-side (posthog-node) tracking improve accuracy?

**Yes, for event delivery — no, for session replay.**

- Server-side events bypass ad blockers and browser extensions entirely (no client JS involved), can't be manipulated by the end user (no dev-tools event spoofing), and are not subject to Safari ITP / third-party cookie restrictions.
- Server-side events **cannot** record session replay — replay requires a browser DOM, so it only ever comes from `posthog-js`.
- The correct pattern is **hybrid**: client-side for UX/replay-linked events (what a user clicked, saw), server-side for anything that must be accurate and tamper-proof (signups, payments, subscription changes, usage limits) — using the **same `distinct_id`** on both sides so they stitch into one timeline.
- For Next.js API routes / Server Actions specifically, PostHog's own docs are explicit: these are short-lived processes, so initialize with `flushAt: 1, flushInterval: 0` (send immediately, don't batch) and always `await posthog.shutdown()` before the function returns, or events are silently dropped when the process/lambda freezes.

## 4. Event taxonomy & the "sweet spot" per page

Industry convention for a taxonomy that doesn't rot (tracked across Amplitude/Segment/PostHog/GA4 practice): **total catalog of 10–200 events for the whole product**, each with up to \~20 properties, following **object\_action** naming (`subscription_created`, not `created_subscription`; `report_exported`, not `Export Clicked`). PostHog's own convention extends this with a namespace prefix for scale: `category:object_action` (e.g. `billing:subscription_started`).

For a single page/flow, the practical sweet spot is **3–7 manual events**, not 10+:

1. One entry event (pageview or flow-start)
2. One or two meaningful interaction events (the action that matters, not every click)
3. One completion event (success)
4. One failure/error event (so funnels show drop-off, not just silence)

If you find yourself wanting to track more than \~7 events on one page, that's usually a sign the page is doing too much, or you're tracking UI mechanics instead of product decisions — fold it into properties on fewer events instead of adding more events. (e.g. `report_exported` with a `format: 'pdf'|'csv'` property, not two separate events.)

**Never track:**

- First-time-X events ("first\_login") — PostHog derives this from the first occurrence of `login` per distinct\_id already; a dedicated event duplicates data.
- Raw PII (email, phone, full name) as an event *property*. PII belongs in **person properties via `identify()`**, never in `capture()` properties — this is the single most common mistake flagged in PostHog integration reviews.

## 5. Architecture for Next.js at \~1K WAU

```
client (posthog-js)                    server (posthog-node)
├─ instrumentation-client.ts           ├─ lib/posthog-server.ts (singleton)
│  init(), autocapture: false          │  flushAt: 1, flushInterval: 0 (API routes)
│  capture_pageview: false             │  used in: auth callbacks, Stripe webhooks,
├─ manual $pageview on route change    │  server actions, usage-limit checks
├─ identify() once, right after login  ├─ same distinct_id as client (pass user.id)
├─ reset() on logout                   └─ await posthog.shutdown() before return
└─ session_recording config (own rules)
```

**Reverse proxy is not optional at your stage.** Route PostHog traffic through your own domain via Next.js rewrites (`/ingest/* → *.i.posthog.com`). This is PostHog's own documented best practice and the single biggest lever against ad-blocker-driven event loss, since it makes requests look like first-party traffic instead of a third-party tracker domain.

## 6. Step-by-step rollout

1. **Install both SDKs**: `npm install posthog-js posthog-node`
2. **Set up the reverse proxy** in `next.config.ts` (rewrites for `/ingest/static/*` and `/ingest/*`) before anything else — retrofitting this later means a data discontinuity.
3. **Initialize client-side** in `instrumentation-client.ts` (Next.js 15.3+) with `autocapture: false`, `capture_pageview: false`.
4. **Fire `$pageview` manually** on route change via a small effect watching `usePathname()`/`useSearchParams()`.
5. **Define your event catalog as typed constants** (`analytics/events.ts`) — never allow string literals scattered through components; this is what prevents the "click vs Click vs btnClick" drift that destroys taxonomies.
6. **Call `identify()` once, immediately after login**, with non-PII or intentionally-chosen person properties; call `posthog.reset()` on logout (critical on shared/public devices).
7. **Build the server-side singleton** (`lib/posthog-server.ts`) with `flushAt: 1, flushInterval: 0` for request-scoped use; always `shutdown()`.
8. **Instrument your 10–30 events** across sign-up, activation, core feature use, and revenue — not more, at your current scale.
9. **Configure session replay independently** (see §7) — do this deliberately, don't leave it on defaults.
10. **QA the pipeline**: trigger each event, confirm it lands in PostHog's live event explorer with the right person attached, with an ad blocker ON and OFF, so you know your real loss rate.

## 7. Session replay config for accuracy (separate from event work)

- **Start at 100% sampling, not less.** You cannot judge what you're missing until you've seen full volume at your actual scale — 1K WAU is small enough that 100% sampling is cheap. Reduce later only once you know your real recording volume.
- **Set a minimum duration (2+ seconds).** This removes bounce-session junk from being billed and watched, without touching event accuracy.
- **Mask by default** (`maskAllInputs: true`) and use the `ph-no-capture` class on anything sensitive you don't want in the DOM snapshot at all — this also excludes it from analytics, not just hides it visually.
- **Diagnose real loss** using the three debug properties PostHog attaches to every event: `$session_recording_start_reason` (why a recording did/didn't start), `$sdk_debug_replay_internal_buffer_length` vs `$sdk_debug_replay_flushed_size` (growing buffer + zero flush = blocked upload, usually an ad blocker or broken proxy), and `$replay_sample_rate`/`$replay_minimum_duration` (confirms what config was actually in effect for that session).

## 8. Minimal code reference

```ts
// analytics/events.ts — single source of truth, no string literals elsewhere
export const EVENTS = {
  SIGNUP_COMPLETED: 'auth:signup_completed',
  FEATURE_USED: 'product:feature_used',
  SUBSCRIPTION_STARTED: 'billing:subscription_started',
} as const
```

```ts
// instrumentation-client.ts
import posthog from 'posthog-js'
posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  api_host: '/ingest', // reverse-proxied
  autocapture: false,
  capture_pageview: false,
})
```

```ts
// lib/posthog-server.ts — request-scoped server singleton
import { PostHog } from 'posthog-node'
export const posthogServer = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  flushAt: 1,
  flushInterval: 0, // API routes/server actions are short-lived — send immediately
})
// always: await posthogServer.shutdown() before the handler returns
```

```ts
// on login — identify once; PII goes here, never in capture() properties
posthog.identify(user.id, { plan: user.plan, role: user.role })
// on logout
posthog.reset()
```

## 9. Ongoing hygiene (don't skip this)

- Gate new event names in code review against `analytics/events.ts` — no inline strings.
- Revisit the event catalog monthly for the first quarter: delete anything nobody has queried.
- Re-check the three debug properties in §7 quarterly as traffic grows — your real ad-blocker loss rate will change as your audience changes.
