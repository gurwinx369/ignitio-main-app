# PostHog Analytics Without Autocapture Noise

**Engineering implementation standard | Next.js | Target: ~1,000 weekly active users**  
**Reviewed against PostHog documentation on 23 October 2026**

## Executive decision

Use a **hybrid, event-governed implementation**:

1. **Browser (`posthog-js`)**: keep session replay, automatic SPA pageviews/pageleaves, anonymous-to-known identity, and a small allowlisted set of meaningful UI events. Disable generic autocapture and disable dead-click capture unless the team explicitly needs it.
2. **Server (`posthog-node`)**: emit authoritative events after a database-backed outcome succeeds (e.g. `user signed up`, `lesson completed`, `payment succeeded`). Do not also emit the same completion event from the browser.
3. **Data contract**: maintain a version-controlled event registry with types, required properties, event owner, source of truth, and expected trigger.
4. **Verification**: compare server-side business events to database records. Use replays to understand *why* an action happened or failed, not as the source of truth for counts.

Disabling autocapture should materially reduce *interaction-event volume* if it currently accounts for much of the event stream. It does **not** disable session replay or pageviews. It does not, by itself, fix duplicated custom events, bad identity merges, incorrect event timing, browser blockers, or a broken SDK setup.

## 1. What “less noise” means

PostHog exposes separate controls for autocapture and pageview capture: `autocapture: false` disables automatic interaction capture, while `capture_pageview` is configured separately. Session replay is another capability and can remain enabled. See the [JavaScript SDK configuration](https://posthog.com/docs/libraries/js/config), [Next.js integration](https://posthog.com/docs/libraries/next-js), and [Session Replay installation](https://posthog.com/docs/session-replay/installation).

Use this volume model:

- **Before** = autocaptured interactions + pageviews/pageleaves + deliberate custom events + other enabled telemetry.
- **After** = pageviews/pageleaves + deliberate custom events + other enabled telemetry.
- **Raw event-volume reduction** = `1 - (events_after / events_before)`.
- **Noise reduction** is different: label a sample of events as useful or not useful, then calculate the percentage of non-useful events before and after. Fewer events do not automatically mean more accurate events.

If autocaptured interactions represent 80% of your current event count, turning them off could reduce raw event volume by approximately 80% **in that illustrative case**. Your actual reduction cannot be predicted without inspecting your current event mix. Events like pageviews, pageleaves, dead-clicks, performance metrics, exception events, and replay data have distinct settings and may continue unless separately configured.

### A sample of 10 recordings cannot tell you a reliable accuracy percentage

A recording is not a single accuracy measurement. One session may have a perfectly useful replay but a missing pageview, a duplicate completion event, and an incorrectly identified user. Another may have no custom events at all.

For each sampled session, audit at least these dimensions:

1. **Replay fidelity**: does the replay show the expected user-visible journey, and is recording available where expected?
2. **Route coverage**: do `$pageview` events line up with actual route changes, with neither missing nor duplicated views?
3. **Event semantics**: did each named event fire only when its documented condition became true?
4. **Identity**: are anonymous and logged-in activity linked correctly, without merging different people?
5. **Properties and deduplication**: are required IDs/types present and does one business action produce one completion event?
6. **Privacy**: are text, form fields, URLs, and network details appropriately redacted?

Ten sessions are useful for a smoke test, not a defensible production accuracy estimate. Even if 10/10 independently sampled sessions pass, the rule-of-three approximation says a population defect rate of roughly 30% is still compatible with zero observed failures at the 95% upper-bound level. Validate event occurrences against the true business outcome as well as reviewing recordings.

## 2. Browser SDK configuration

Initialize the SDK **once**, in the root `instrumentation-client.ts` for current Next.js projects, or the existing single provider/init point if your app uses an older supported setup. Do not initialize PostHog in page components or on every navigation. PostHog's current Next.js guide uses `instrumentation-client.ts` and a dated `defaults` configuration snapshot.

Install `posthog-js` and configure it as follows. Replace the environment values with your project settings and the correct PostHog region host.

```ts
// instrumentation-client.ts
import posthog from 'posthog-js'

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!, {
  api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  defaults: '2026-08-30',
  autocapture: false,
  capture_pageview: 'history_change',
  capture_pageleave: 'if_capture_pageview',
  capture_dead_clicks: false,
  session_recording: {
    maskAllInputs: true,
    maskTextSelector: '*',
  },
})
```

**Configuration notes**

- `autocapture: false` disables generic click/form/DOM interaction autocapture. Pageviews are a separate setting.
- Keep `capture_pageview: 'history_change'` for Next.js SPA navigation, unless you deliberately implement and test manual route capture. Do not run both automatic and manual pageview capture for the same route.
- `capture_pageleave: 'if_capture_pageview'` keeps pageleave aligned with pageview capture.
- `capture_dead_clicks: false` is explicit because dead-click detection is separately configurable; enable it only if the team uses the signal and will review false positives.
- Leave session replay enabled in the PostHog project and do not set `disable_session_recording: true` unless intentionally turning replay off. Verify the setting in an actual production-like replay.
- The example masks all form inputs and all text in web replays as a conservative privacy baseline. It reduces readability. Reveal only explicitly approved, non-sensitive text. Masking of visible DOM text does not automatically redact sensitive information in URLs, element attributes, or network payloads; configure those separately and inspect actual replays.
- `defaults: '2026-08-30'` pins the configuration behavior documented at review time. Update that snapshot deliberately during SDK upgrades after checking the relevant changelog and validating in staging.
- The project token is intended for SDK ingestion, but never put a PostHog personal API key in browser code. Use environment variables, not hard-coded values.

If fully masking the replay makes the product unusable to debug, use `maskTextFn` to reveal only content deliberately marked safe after a privacy review. Do not broadly unmask whole screens containing learner submissions, emails, private notes, prompts, payment or authentication information.

## 3. Event design: track outcomes, not every interaction

### Event rules

- Name events in a single consistent style. PostHog recommends an **object + verb** pattern; this spec uses lowercase names such as `lesson completed` and `checkout started`.
- One event represents one understandable product fact. Do not create a new event for every button, icon, rerender, keystroke, scroll tick, hover, or modal state.
- Fire UI events from explicit user actions or confirmed state transitions—not during render and not from an unguarded React effect. Development Strict Mode and component remounts can expose duplicate-effect bugs.
- Use `*_started`/`*_submitted` for intent and `*_completed`/`*_succeeded` only when the outcome actually happened.
- Keep properties low-cardinality where practical, typed, and documented. Prefer stable IDs and enumerated values over arbitrary text.
- Never send passwords, access tokens, user-entered content, full prompts, payment details, or other sensitive data as event properties. Avoid URLs with tokens, emails, or user data in query strings.
- Do not send the same semantic completion from both browser and server. The browser may send `lesson completion submitted`; the backend owns `lesson completed` after persistence succeeds.

### Suggested initial event registry

| Event name | Owner/source | Trigger | Useful properties (examples) |
|---|---|---|---|
| `signup started` | Browser | User begins a signup flow | `method`, `entry_point` |
| `user signed up` | Server | Account record is successfully created | `signup_method`, `campaign` if known |
| `onboarding completed` | Server when persisted; otherwise browser after confirmed save | All required onboarding fields are saved | `goal`, `experience_level`, `entry_point` |
| `roadmap started` | Server if start state is persisted; otherwise browser on confirmed start action | User actually starts a roadmap | `roadmap_id`, `source` |
| `lesson started` | Browser | Lesson content becomes active, not merely preloaded | `lesson_id`, `roadmap_id` |
| `lesson completed` | Server | Completion/progress state is saved successfully | `lesson_id`, `roadmap_id`, `completion_rule_version` |
| `paywall viewed` | Browser | Paywall is meaningfully visible, not just mounted offscreen | `placement`, `plan_family` |
| `checkout started` | Server | A checkout session is successfully created | `plan_id`, `billing_period`, `provider` |
| `payment succeeded` | Server/payment webhook | Provider confirms the transaction | `transaction_id`, `plan_id`, `currency`, `amount_minor` |

Do not implement every row automatically. Keep only events tied to current product questions. For payment and other important outcomes, make the server/database or verified provider callback authoritative. Ensure webhook retries cannot emit multiple `payment succeeded` events for the same transaction.

### Type the tracking interface

Centralize browser event names and properties in `src/analytics/events.ts`. Components should call small approved helpers rather than `posthog.capture()` with arbitrary strings everywhere.

```ts
// Minimal example: the registry lives in one module.
export const track = {
  lessonStarted: (lessonId: string, roadmapId: string) =>
    posthog.capture('lesson started', {
      lesson_id: lessonId,
      roadmap_id: roadmapId,
    }),
}
```

In the real implementation, give each event an explicit TypeScript property type, keep `posthog` import and capture code inside client-only modules, and add a test that fails when an event name or required property is changed without updating the registry.

## 4. How many events per page?

There is no PostHog-prescribed event quota per page. Use the following as an engineering heuristic—not a vendor limit:

| Page/workflow type | Recommended initial custom events | Guidance |
|---|---:|---|
| Static/info page | 0–1 | Usually the pageview is enough; track a CTA only if it answers a specific question. |
| Landing/paywall page | 1–3 | Track meaningful visibility or intent and the next funnel step—not every click. |
| Onboarding flow | 2–5 across the whole flow | Track start, important branch/goal selection if actionable, and completed/saved. Avoid an event for every field edit. |
| Core lesson/workspace | 2–5 per key workflow | Usually start, meaningful help/error signal if needed, and completion; use separate event names only for actions that inform a decision. |
| Complex multi-step flow | 3–8 across the entire flow | Add steps only when step-level drop-off changes what the team will do next. |

Default to **one automatic pageview per real route change plus 1–3 high-value custom events for a simple page**. A complex flow may need more, but each event must answer a product question. Properties should describe variations in one event; do not create events such as `lesson completed beginner`, `lesson completed advanced`, etc.

For a practical 10-session sample, expect that each session may contain several route changes and only a few custom product events. The goal is not to maximize the event count; it is to make every retained custom event interpretable and testable.

## 5. Identity, client/server linking, and Node SDK

### User identity contract

- Use the stable internal user ID from your auth/database system as PostHog's `distinct_id` after login; do not use a shared constant such as `anonymous` or `user`.
- Call `posthog.identify(user.id)` as soon as authenticated user identity is available. Call `posthog.reset()` on logout so a later person using the same browser does not inherit the prior identity.
- Before login, let PostHog's generated anonymous ID represent the browser. Do not invent a placeholder user ID.
- Use exactly the same stable ID format in frontend and backend events. Never use email/display name as the primary ID unless there is no stable internal identifier and it is unique.

### Server-side events improve semantic accuracy

`posthog-node` is valuable for business outcomes because it runs after the server validates and persists the result. It is not a replacement for `posthog-js`: it cannot observe browser interactions or create DOM session recordings. A hybrid setup gives you both accurate outcomes and visual context.

Install `posthog-node` and create a server-only client module. Keep the project token in a server environment variable and do not import this module into client components.

```ts
// src/analytics/posthog-server.ts (server-only)
import { PostHog } from 'posthog-node'

export const posthogServer = new PostHog(
  process.env.POSTHOG_PROJECT_TOKEN!,
  { host: process.env.POSTHOG_HOST },
)
```

Capture after the state change succeeds:

```ts
posthogServer.capture({
  distinctId: user.id, // authenticated internal ID, not client-supplied
  event: 'lesson completed',
  properties: { lesson_id: lesson.id, roadmap_id: roadmap.id },
})
```

**Delivery semantics:** the Node SDK queues and batches in the background. In a long-lived Node server, reuse one client and let batching work; call `flush()` at controlled shutdown. In serverless/short-lived handlers, PostHog recommends reusing a client within a warm runtime and awaiting `flush()` before returning when needed to avoid the runtime freezing before delivery. A flush or shutdown is still not a guarantee that PostHog has indexed the event. Catch and log analytics delivery errors so analytics never rolls back a successful product action.

For high-value facts where losing an event is unacceptable, use a **transactional outbox**: write the business update and an outbox row in the same database transaction, then have a retryable worker send the event to PostHog. Make the outbox event idempotent using a stable business identifier. At ~1,000 weekly users, an outbox is optional for ordinary UX telemetry but appropriate for payments, entitlements, or metrics that the company treats as critical.

### Link backend events to the replay

Configure `tracing_headers` in `posthog-js` for the hostname(s) of your own API. PostHog can then send `X-POSTHOG-DISTINCT-ID` and `X-POSTHOG-SESSION-ID` on matching browser requests, helping link backend activity to a replay. Read the current [Next.js linking guidance](https://posthog.com/docs/libraries/next-js) before implementation.

Treat these headers as client-controlled analytics context, **not authentication**. Derive `distinctId` from the authenticated server session/database. You may use the session ID as correlation metadata after validation, but never use a PostHog header to authorize access or determine the true user identity.

## 6. Reliability and scalability rules

One thousand weekly active users is a modest load for these SDKs; clean semantics and correct delivery handling matter far more than throughput tuning. Avoid building a custom event transport until there is measured need.

- Initialize `posthog-js` once in the browser and use a shared `posthog-node` client per server runtime.
- Never block a user-facing feature on a non-critical analytics call. Record errors for observability, but do not fail a lesson completion or signup because PostHog is unavailable.
- For a serverless handler, explicitly flush critical queued events before the execution environment can freeze, or use an outbox worker. Do not call `shutdown()` after every request on a shared client; reserve shutdown for disposal/process exit.
- Use stable idempotency keys for business event generation and webhook handling. PostHog's deduplication is not a substitute for preventing duplicate business transitions in your application.
- Keep properties intentionally small. Do not send complete API responses, arbitrary objects, user-generated content, or request headers.
- Use a reverse proxy if blockers materially affect your required browser coverage; this improves resilience but does not remove consent requirements or make every event deliverable.
- Make separate decisions for event capture, session replay, error tracking, Web Vitals/network performance and dead-click capture. One toggle does not govern every signal.

## 7. Quality gates and rollout

### Before release

1. Confirm only one browser SDK initialization exists and the required project token/host are set per environment.
2. Keep dev/test data separate from production, or disable capture locally.
3. Test SPA route transitions and confirm one `$pageview` per intended route transition; ensure no manual duplicate pageview calls exist.
4. Run each key journey: signup, onboarding, start lesson, complete lesson, checkout and payment where relevant.
5. Verify browser events fire at the intended trigger and do not run on render, prefetch, failed API calls, or duplicate effects.
6. Verify server events are emitted only after the authoritative write/callback succeeds and once per business action.
7. Verify `distinct_id`, session linkage, required properties, types, and privacy masking by opening real recordings in a staging environment.
8. Test analytics with network failures, slow requests, refreshes, back/forward navigation, double-clicks, retries, logout/login, and browser privacy/blocker conditions.

### Suggested acceptance criteria

These are proposed engineering gates, not guarantees from PostHog:

- For automated tests of critical server-side outcomes: every successful seeded business transition produces exactly one expected event; failed transitions produce none.
- Required properties are present and valid for 100% of test events.
- Each tested route transition produces exactly one pageview under the chosen SPA configuration.
- No sampled production replay exposes sensitive text, form values, query parameters, or network payloads that the team did not approve.
- In a controlled test run, compare database/outbox counts to PostHog's server-side event counts after an agreed ingestion delay; investigate every discrepancy rather than explaining it away as noise.
- For client-side intent events, document expected losses from blockers, denied consent, navigation and network failure; do not use their count as a financial source of truth.

### First 14 days

- **Days 1–2:** inventory existing event names and current event-volume distribution; record the top noisy event types and the current critical conversion counts.
- **Days 3–5:** implement the config, registry, identity lifecycle, replay privacy policy and 5–9 core events.
- **Days 6–7:** test the core journeys in staging and manually inspect at least 10 recordings across different routes/devices. Treat this as smoke testing only.
- **Week 2:** roll out to production, compare authoritative server-side outcomes to PostHog, monitor missing/duplicate events, and review sampled recordings. Calculate the actual volume/noise reduction using the formula in Section 1.

## 8. Source documentation reviewed

- [PostHog Next.js integration](https://posthog.com/docs/libraries/next-js) — current `instrumentation-client.ts` setup, identity, tracing headers, server-side analytics, serverless lifecycle.
- [PostHog JavaScript SDK configuration](https://posthog.com/docs/libraries/js/config) — `autocapture`, `capture_pageview`, `capture_pageleave`, dead-clicks, current `defaults` snapshots, session recording configuration.
- [PostHog JavaScript SDK](https://posthog.com/docs/libraries/js) — browser usage, replay triggers, capture controls.
- [PostHog Node.js SDK](https://posthog.com/docs/libraries/node) — queueing/batching, identity, capture, `flush()`/`shutdown()`, serverless considerations.
- [PostHog Session Replay installation](https://posthog.com/docs/session-replay/installation) — replay setup and recording model.
- [PostHog Session Replay privacy controls](https://posthog.com/docs/session-replay/privacy) — text/input masking, URLs, network-request redaction.
- [PostHog anonymous vs identified events](https://posthog.com/docs/data/anonymous-vs-identified-events) — stable distinct IDs and identify best practices.
- [PostHog cutting product analytics costs](https://posthog.com/docs/product-analytics/cutting-costs) — auto pageview/pageleave controls and capture-volume considerations.
