# Backend Architecture and Data-Flow Audit

## Executive Summary
This report provides a comprehensive, read-only audit of the Ignitio backend, focusing on models, onboarding, role personalization, diagnostic-to-curriculum mapping, and the V4 architecture gap analysis.

## 1. Full Model Inventory

### 1. `UserProfile` (`models/v2/user.profile.model.js`)
- **Collection**: `userprofiles`
- **Fields**: `firebaseUID`, `email`, `role`, `goal`, `onboardingComplete`, `onboardingState.step`, `entitlements.roadmaps.genAi`, `roadmapPersonalizationRef`, `streak`.
- **Primary Identifier**: `_id` (MongoDB), `firebaseUID` (Unique index).
- **Unique Indexes**: `{ firebaseUID: 1 }`, `{ email: 1 }`.
- **Readers**: Core auth middleware, `progress/route.js`, `subscription.service.js`, `onboarding.service.js`.
- **Writers**: `onboarding.service.js` (completion, streak), `subscription.service.js` (entitlement), `diagnostic/route.js`.
- **Lifecycle Responsibility**: Master identity, stores premium entitlement, current onboarding state, role, and schedule.

### 2. `OnboardingResponseModel` (`models/v2/onboarding.model.js`)
- **Collection**: `onboardingresponsemodels`
- **Fields**: `firebaseUID`, `onboardingVersion`, `entryPoint`, `responses` (array of `QuestionResponseSchema`), `roadmapExclusions`, `status`.
- **Primary Identifiers**: `firebaseUID` + `onboardingVersion`.
- **Unique Indexes**: `{ firebaseUID: 1, onboardingVersion: 1 }`.
- **Readers**: `app/api/v2/onboarding/diagnostic/results/route.js`.
- **Writers**: `app/api/v2/onboarding/diagnostic/route.js`, `lib/onboarding/onboarding.service.js`.
- **Lifecycle**: Stores diagnostic outcomes. 

### 3. `PaymentModel` (`models/v2/payment.model.js`)
- **Fields**: `userId`, `subscriptionId`, `razorpayPaymentId`, `amount`, `status` (CAPTURED, AUTHORIZED, FAILED).
- **Readers**: Webhook processor (idempotency check).
- **Writers**: `lib/subscription/subscription.service.js` (`verifyPayment`, webhooks).
- **Lifecycle**: Immutable ledger of payments.

### 4. `SubscriptionModel` (`models/v2/subscription.model.js`)
- **Fields**: `userId`, `razorpaySubscriptionId`, `status` (ACTIVE, CANCELLED, CREATED, EXPIRED).
- **Readers**: `getSubscriptionStatus`.
- **Writers**: `lib/subscription/subscription.service.js`.
- **Lifecycle**: Tracks subscription lifecycle state (1 per user).

### 5. `RoadmapTemplates` (`models/v2/roadmap.templates.model.js`)
- **Fields**: `slug`, `title`, `days` (weeks).
- **Readers**: `onboarding.service.js`.
- **Lifecycle**: Read-only source of truth for the curriculum structure.

### 6. `RoadmapPersonalized` (`models/v2/roadmap.personalized.model.js`)
- **Fields**: `userId`, `roadmapSlug`, `includedDayIds`, `optionalDayIds`, `skippedDayIds`.
- **Readers**: `onboarding.service.js` (for idempotency checks).
- **Writers**: `onboarding.service.js`.
- **Lifecycle**: A generated snapshot of the user's customized roadmap.

### 7. `RoadmapProgress` (`models/v2/roadmap.progress.model.js`)
- **Fields**: `userId`, `roadmapSlug`, `status`, `completedLevels`, `completedDays`.
- **Readers**: `app/api/v2/roadmaps/[roadmapSlug]/progress/route.js`.
- **Writers**: `onboarding.service.js` (initialization), `progress/route.js` (learning progress).
- **Lifecycle**: Tracks active learning progress.

### 8. `StreakReminderLog` (`models/v2/streak.reminder.log.model.js`)
- **Lifecycle**: Stores reminder sent logs for notification tracking.

## 2. Trace All Onboarding Versions

- **V2 (Legacy but Active)**: Reachable via `app/api/v2/onboarding/route.js`. Gathers all data in one POST, validates schedule, grades diagnostics, and delegates entirely to `runOnboarding` in `lib/onboarding/onboarding.service.js`.
- **V4 (Active)**: Reachable. State machine broken into steps. 
  - `diagnostic/route.js`: Collects answers, saves `OnboardingResponseModel`, moves state to `results`.
  - `diagnostic/results/route.js`: Returns diagnostic transform.
  - `results/continue/route.js`: Moves state from `results` to `paywall`.
  - **Missing**: V4 has NO implemented routes for `role_selection`, schedule collection, roadmap assignment, or completion.

## 3. Trace Diagnostic Lifecycle

For the V4 Flow:
1. `POST /api/v2/onboarding/diagnostic`
   - `verifyFirebaseToken()`
   - Payload parsed by Zod.
   - `runDiagnostics()` executes `gradeQ2()` through `gradeQ8()`.
   - Idempotently upserts `OnboardingResponseModel` (responses array includes `passed`, `skipped`, `gradingMethod`).
   - Idempotently updates `UserProfile` `onboardingState.step` to `results`.
2. `GET /api/v2/onboarding/diagnostic/results`
   - Reads `OnboardingResponseModel`.
   - Transforms it via `buildDiagnosticResults()`.
3. `POST /api/v2/onboarding/results/continue`
   - `UserProfile.findOneAndUpdate` moving `onboardingState.step` to `paywall`.

## 4. Audit `roadmapCompiler.js`

- **File**: `lib/onboarding/roadmapCompiler.js`.
- **Function**: `buildRouting(diagnostics)` - Maps raw diagnostic pass/fail into week-by-week actions (`skip`, `optional`, `keep`). Uses Q2 to gate Week 1, etc.
- **Function**: `compileRoadmap(template, routing)` - Takes the lean template and routing decisions to return `{ includedDayIds, optionalDayIds, skippedDayIds, totalLevels }`.
- **Usage**: Pure functions, fully idempotent.
- **Role Usage**: Role is NOT passed into the compiler and does not affect curriculum structure.
- **Goal/Schedule/Entitlement Usage**: None. It only processes diagnostics.

## 5. Trace Roadmap Assignment

- **V2 Users**: Assigned in `lib/onboarding/onboarding.service.js` -> `runOnboarding()`.
  1. Idempotency check on `UserProfile.onboardingComplete`.
  2. Runs `compileRoadmap()`.
  3. Writes `OnboardingResponseModel`.
  4. Writes `RoadmapPersonalized`.
  5. Writes `RoadmapProgress` (status `not_started`).
  6. Updates `UserProfile` (sets `onboardingComplete = true`, `streak.onboardingStartDate`).
- **V4 Users**: **No current implementation found**. Assignment logic does not exist in the V4 flow API routes.

## 6. Complete Role Audit

- **Locations**: `UserProfile.role`, `app/api/v2/roadmaps/[roadmapSlug]/progress/route.js`, `features/kyle/lib/role.context.js`.
- **Conclusion**: **Role controls only framing/context.**
- **Evidence**: `compileRoadmap` does not accept a role. `onboarding.service.js` passes `user.role` into `RoadmapProgress`, but this is used for context. Kyle uses `role.context.js` to change AI prompt personas based on `role`.

## 7. Complete Payment and Entitlement Integration

- **File**: `lib/subscription/subscription.service.js`.
- **Verification**: `verifyPayment()` validates Razorpay HMAC-SHA256 signature using `crypto.createHmac()`. It fetches authoritative data from Razorpay API.
- **Transactions**: Enclosed in a `mongoose.startSession()` and `session.withTransaction()`. Writes `Payment`, `Subscription`, and `UserProfile` entitlements in one atomic block.
- **Entitlement Authority**: `UserProfile.entitlements.roadmaps.genAi` is the source of truth checked via `getAccessStatus()`.
- **Webhooks**: `handleWebhookEvent` in `subscription.service.js` re-fetches from Razorpay, idempotently updating local states. Subscriptions are marked `cancelAtPeriodEnd: true` upon cancellation; access persists until the period ends.

## 8. Audit Schedule and Streak Initialization

- **V2 Initialization**: `lib/onboarding/onboarding.service.js` updates `UserProfile.streak.timezone` and `streak.onboardingStartDate` using the user's `schedule.timezone`.
- **V4 Initialization**: **No current implementation found**.

## 9. Find Every Onboarding Completion Write

- **V2**: `lib/onboarding/onboarding.service.js` -> `UserProfile.updateOne({ $set: { onboardingComplete: true, completedAt: now } })`. Preconditions: Roadmap personalized and progress created. Side effect: Initializes streaks.
- **V4**: **No current implementation found**. V4 routes stop at `onboardingState.step = "paywall"`.

## 10. API Route Inventory

| Method | Route | Authentication | Service | Models Read | Models Written | State Transition |
| --- | --- | --- | --- | --- | --- | --- |
| POST | `/api/v2/onboarding` (V2) | Firebase | `onboarding.service.js` | UserProfile, RoadmapTemplate | OnboardingResponse, RoadmapPersonalized, RoadmapProgress, UserProfile | -> `onboardingComplete: true` |
| POST | `/api/v2/onboarding/diagnostic` | Firebase | inline | UserProfile | OnboardingResponse, UserProfile | -> `results` |
| GET | `/api/v2/onboarding/diagnostic/results`| Firebase | inline | UserProfile, OnboardingResponse | None | N/A |
| POST | `/api/v2/onboarding/results/continue` | Firebase | inline | UserProfile, OnboardingResponse | UserProfile | `results` -> `paywall` |

## 11. Source-of-Truth Matrix

| Concept | Authoritative Source | Derived Copies | Writers | Readers | Risk |
| --- | --- | --- | --- | --- | --- |
| Authentication identity | `UserProfile.firebaseUID` | `Payment.firebaseUID`, `Subscription.firebaseUID` | Auth / Auth Sync | All services | Low |
| Premium entitlement | `UserProfile.entitlements.roadmaps.genAi` | N/A | `subscription.service.js` | Protected routes | Low |
| Active roadmap | `UserProfile.roadmapPersonalizationRef` | `RoadmapProgress.roadmapSlug` | `onboarding.service.js` | Progress route | Medium |
| Onboarding state | `UserProfile.onboardingState.step` | N/A | Diagnostic routes | Route guards | Low |

## 12. Capability Matrix

| Capability | Status | Code Owner | Evidence |
| --- | --- | --- | --- |
| Diagnostic persistence | Supported | `diagnostic/route.js` | `OnboardingResponseModel.findOneAndUpdate` |
| Diagnostic curriculum effect | Supported (V2) / Missing (V4) | `onboarding.service.js` | `buildRouting(diagnostics)` call exists in V2 only |
| Role curriculum effect | Stored but unused | `onboarding.service.js` | `compileRoadmap` takes no role parameter |
| Premium generation | Supported (V2) / Missing (V4) | `onboarding.service.js` | Generates `RoadmapPersonalized` in V2 only |
| RoadmapProgress init | Supported (V2) / Missing (V4) | `onboarding.service.js` | `RoadmapProgress.create` in V2 only |
| Streak initialization | Supported (V2) / Missing (V4) | `onboarding.service.js` | Updates `streak.onboardingStartDate` in V2 only |
| Onboarding completion | Supported (V2) / Missing (V4) | `onboarding.service.js` | `onboardingComplete: true` in V2 only |

## 13. Transactions and Idempotency

| Flow | Transaction | Idempotent | Partial-failure state | Recovery |
| --- | --- | --- | --- | --- |
| V4 Diagnostic save | No | Yes | Profile step updated, response fails (or vice versa) | User retries, `$setOnInsert` and `$set` are idempotent |
| Payment verification | Yes (`session.withTransaction`) | Yes | None | Transaction rolls back, safe to retry |
| V2 Roadmap Assignment | No | Yes | Orphaned `OnboardingResponse` or `RoadmapPersonalized` docs | Rejected if `onboardingComplete` is true. Retries recreate and overwrite safely |

## 14. Security Findings

- **Idempotency**: High quality. `verifyPayment` checks `Payment.findOne({ razorpayPaymentId })` first. Webhooks re-fetch from Razorpay API. (Informational)
- **HMAC Signatures**: Correctly implemented in Razorpay webhook verification and payment verification. (Informational)

## 15. Final Required Answer

For a V4 user who completes the diagnostic, buys or skips Premium, selects a role, and provides a schedule:

1. choose the roadmap: **No current implementation found.**
2. apply diagnostic exclusions: **No current implementation found.**
3. use role: **No current implementation found.**
4. persist the roadmap: **No current implementation found.**
5. create RoadmapProgress: **No current implementation found.**
6. initialize streak state: **No current implementation found.**
7. mark onboarding complete: **No current implementation found.**

*Note: While V2 correctly handles these steps via `lib/onboarding/onboarding.service.js`, the V4 API architecture simply stops at `onboardingState.step = "paywall"`. The core logic to stitch these pieces together for V4 is missing.*
