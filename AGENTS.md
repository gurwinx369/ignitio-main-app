# Ignitio — Agent Instructions

This file defines the working rules for Antigravity when modifying the Ignitio Next.js learning platform.

The goal is to improve the product without damaging existing functionality, architecture, or maintainability.

---

## Core Priority

Always follow this priority order:

1. Preserve existing business logic and user flows.
2. Make the smallest safe change that solves the request.
3. Avoid unnecessary rewrites, broad refactors, and unrelated file changes.
4. Use specialized agents only when task complexity or risk justifies them.
5. Use Stitch only for medium-to-large visual design work.
6. Verify the result with the lightest appropriate check.

---

## Non-Negotiable Product Boundaries

Unless the user explicitly requests it, do not change:

- Authentication behavior
- Firebase Auth flow
- API route contracts
- MongoDB/Mongoose models
- Course data structures
- User progress tracking
- Level completion logic
- Level lock/unlock rules
- Video timing logic
- Route paths
- Existing environment variable usage
- Existing business rules

For UI-only work, preserve all existing data flow, props, state, API calls, and side effects.

---

## Task Classification

Before editing code, classify the task into one of the following categories.

---

### A. Small UI Fix

Examples:

- Move a popup, modal, card, or panel
- Adjust spacing, alignment, colors, shadows, border radius
- Add or improve a close button
- Fix responsive layout in one component
- Fix z-index, overflow, or positioning
- Improve one visual detail without changing logic

Workflow:

1. Identify the directly affected file or component.
2. Make a surgical edit.
3. Preserve existing props, state, handlers, API calls, and logic.
4. Do not use Stitch.
5. Do not use planner unless more than 3 files are involved.
6. Do not create a new design system.
7. Do not rewrite unrelated components.
8. Run lint/build only if practical or if the change touches shared code.

Agents:

- Usually no agent required.
- Use `build-error-resolver` only if the edit causes a build/runtime error.
- Use `code-reviewer` only if the edit becomes multi-file or complex.

---

### B. Component-Level UI Enhancement

Examples:

- Redesign an existing card
- Improve a navbar, modal, sidebar, hero section, dashboard widget
- Add animation to an existing component
- Improve one page section

Workflow:

1. Analyze the current component contract.
2. Preserve existing data flow and behavior.
3. Improve the UI using existing Tailwind/theme patterns.
4. Use Stitch only as optional visual guidance, not as a rewrite engine.
5. Prefer editing existing components over creating new files.
6. Extract reusable components only if the pattern is repeated or reduces complexity.
7. Avoid hardcoded data; use existing props, arrays, config, or API responses.

Agents:

- Use `code-reviewer` after meaningful multi-file changes.
- Use `build-error-resolver` if build/lint/runtime errors occur.

---

### C. Visual-Only Large Redesign

Examples:

- Homepage redesign
- Dashboard redesign
- Level page redesign
- Onboarding UI redesign
- Landing page redesign
- Large responsive layout improvement

Workflow:

1. Use `planner` to define scope, affected files, risks, and phases.
2. Use Stitch for layout direction, visual hierarchy, spacing, responsive structure, and component consistency.
3. Adapt Stitch output to the existing codebase.
4. Preserve business logic, API calls, route paths, auth behavior, state contracts, and data structures.
5. Do not hardcode dynamic data.
6. Prefer existing components and patterns before creating new ones.
7. Create new components only when they are reusable or reduce complexity.
8. Use `code-reviewer` after implementation.
9. Run lint and build if available.

Strict boundaries:

- Do not change backend/API logic.
- Do not change progress tracking.
- Do not change level lock/unlock behavior.
- Do not change authentication.
- Do not change database models.
- Do not introduce new libraries without approval.

---

### D. Mixed UI + Logic Change

Examples:

- Add quiz modal with scoring
- Add XP/streak UI connected to user data
- Add progress visualization connected to backend data
- Add new level interaction that affects state
- Add user-specific learning behavior

Workflow:

1. Use `planner`.
2. Separate the work into:
   - UI layer
   - State layer
   - API/data layer
   - Validation layer
3. Use Stitch only for the UI layer.
4. Use `tdd-guide` for business logic, progress rules, scoring, or API behavior.
5. Use `security-reviewer` if user data, auth, Firebase, MongoDB, API routes, or permissions are touched.
6. Use `code-reviewer` after implementation.
7. Run relevant tests, lint, and build.

Strict boundaries:

- Do not mix visual refactor with logic rewrite unless explicitly required.
- Do not change data contracts without documenting the reason.
- Do not silently alter existing user flows.
- Keep UI components driven by existing props, arrays, API responses, or config.

---

### E. Logic / Backend / Auth / Database Change

Examples:

- API route changes
- Firebase Auth changes
- MongoDB/Mongoose model changes
- Progress tracking changes
- Level lock/unlock logic changes
- Payment/security-sensitive logic
- Server-side validation

Workflow:

1. Use `planner` for complex changes.
2. Use `architect` if data flow, system design, or scalability is affected.
3. Use `tdd-guide` for new logic or bug fixes.
4. Use `security-reviewer` for auth, user data, tokens, API validation, permissions, or database access.
5. Use `code-reviewer` after implementation.
6. Run relevant tests, lint, and build.

Rules:

- Never hardcode secrets.
- Use environment variables for secrets.
- Validate user input.
- Validate Firebase Auth tokens server-side where required.
- Avoid leaking sensitive details in error messages.
- Preserve existing behavior unless the request explicitly changes it.

---

### F. Build, Lint, Type, or Runtime Error

Examples:

- Next.js build failure
- ESLint error
- TypeScript error
- Hydration error
- Runtime crash
- Import/export error

Workflow:

1. Use `build-error-resolver`.
2. Read the exact error.
3. Fix incrementally.
4. Do not refactor unrelated code.
5. Verify after each fix.

---

### G. Large Refactor

Before refactoring:

1. Explain why the refactor is needed.
2. Identify exact files affected.
3. Define what behavior must remain unchanged.
4. Avoid unrelated code.
5. Refactor in small phases.
6. Verify after each phase.

Rules:

- No broad rewrites.
- No new architecture unless justified.
- No renaming public props/functions/routes without updating all usages.
- No removing code unless confirmed unused.
- Preserve existing behavior by default.
- Prefer incremental cleanup over total replacement.

Agents:

- Use `planner`.
- Use `architect` if architecture changes.
- Use `code-reviewer` after each major phase.
- Use `tdd-guide` if logic is changed.

---

## Available Agents

| Agent | Purpose | Use When |
|---|---|---|
| `planner` | Implementation planning | Complex features, large redesigns, refactors, risky changes |
| `architect` | System design and scalability | Architecture, data flow, performance, scalability |
| `tdd-guide` | Test-driven development | Business logic, APIs, bug fixes, progress rules |
| `code-reviewer` | Code quality review | After meaningful code changes |
| `security-reviewer` | Vulnerability detection | Auth, APIs, user data, tokens, database, permissions |
| `build-error-resolver` | Build/type/runtime fixes | Build, lint, TypeScript, hydration, runtime errors |
| `e2e-runner` | End-to-end testing | Critical user flows and integration testing |
| `refactor-cleaner` | Dead code cleanup | Removing unused code after confirmation |
| `doc-updater` | Documentation updates | README, API docs, code comments, implementation notes |

---

## Agent Usage Policy

Use agents selectively.

Do not use agents just because they exist.

### Use `planner` when:

- More than 3 files may change
- A task has multiple phases
- Architecture or data flow may be affected
- There is meaningful risk
- The request is a large redesign or refactor

### Use `architect` when:

- Data flow changes
- System boundaries change
- Performance/scalability matters
- A new major feature affects multiple domains

### Use `tdd-guide` when:

- Business logic changes
- API behavior changes
- Progress/locking/scoring rules change
- A bug fix needs regression coverage

### Use `security-reviewer` when:

- Auth is touched
- Firebase tokens are touched
- API routes are touched
- MongoDB/Mongoose queries are touched
- User data or permissions are touched
- Secrets or environment variables are touched

### Use `code-reviewer` when:

- Meaningful code has been modified
- Multiple files changed
- Logic changed
- A large UI implementation was completed

### Use `build-error-resolver` when:

- Build fails
- Lint fails
- TypeScript fails
- Runtime errors appear
- Hydration errors appear

Do not use agents for simple CSS/layout-only edits unless the edit fails or becomes complex.

---

## Stitch Usage Policy

Stitch is a design engine, not an architecture authority.

Use Stitch for:

- Full page redesigns
- Landing pages
- Dashboards
- Onboarding flows
- Large layout systems
- Design systems
- Reusable section/component systems
- Major responsive redesigns
- Complex visual hierarchy decisions

Do not use Stitch for:

- Small component edits
- CSS-only fixes
- Popup/modal positioning
- Button/card spacing
- Bug fixes
- Backend/API/auth/database work
- Build errors
- Logic changes

When Stitch is used:

- Treat Stitch as visual guidance.
- Adapt output to the existing codebase.
- Preserve existing data flow.
- Preserve component contracts.
- Preserve business logic.
- Use existing Tailwind/theme tokens where possible.
- Do not introduce one-off visual patterns.
- Do not introduce new libraries without approval.
- Do not hardcode dynamic data.

---

## UI Refactor Safety Rules

For UI-only work:

- Do not change API calls.
- Do not change route paths.
- Do not change Firebase Auth behavior.
- Do not change MongoDB/Mongoose logic.
- Do not change course progress logic.
- Do not change level lock/unlock rules.
- Do not change video timing logic unless explicitly requested.
- Do not change existing data structures unless required.
- Do not hardcode course, roadmap, lesson, or level data.
- Use existing arrays, props, API responses, and config.
- Preserve existing event handlers and side effects.
- Preserve existing loading and error states.
- Preserve responsive behavior or improve it without breaking current layouts.

---

## Modal / Popup Standard

When converting side popups, panels, or overlays into centered modals:

- Use a fixed full-screen overlay.
- Center the modal using flex or grid.
- Add a clear close button.
- Preserve existing open/close state logic when possible.
- Preserve existing button actions and data flow.
- Support Escape key if practical.
- Close on backdrop click only if it does not harm UX.
- Prevent background scroll while modal is open if needed.
- Use responsive width, not fixed pixel-only width.
- Keep z-index high enough to appear above page content.
- Add basic accessibility attributes where practical:
  - `role="dialog"`
  - `aria-modal="true"`
  - accessible close button label

---

## Coding Style

### Immutability

Do not mutate React state or shared objects directly.

Wrong:

```javascript
state.items.push(newItem)