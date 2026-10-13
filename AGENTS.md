# Ignitio — Agent Operating Instructions

> **Audience:** Antigravity and all specialized agents. This document enforces architectural boundaries and limits token waste.

## 1. Core Directives
1. **Preserve Existing Behavior:** Do not alter business logic, user flows, auth, or DB models unless explicitly requested.
2. **Smallest Safe Change:** Avoid unrelated file changes or broad refactors.
3. **Security First:** Never hardcode secrets. Validate inputs. Verify auth tokens.

## 2. Backend Architecture (Strict)
Ignitio enforces a **Layered Architecture** for Node/Next.js backend code.

- **Flow:** `Routes -> Controllers -> Services -> Repositories -> Database`
- **Routes:** ONLY route requests. Zero business logic.
- **Controllers:** Parse requests, call services, format responses. Must extend `BaseController`.
- **Services:** Contain all business rules. Framework-agnostic.
- **Repositories:** Encapsulate all Prisma/Mongoose DB access.
- **Validation:** All inputs (body, query, params) MUST be validated with `Zod`.
- **Errors:** Must be captured via Sentry. No silent failures.

## 3. Frontend Architecture
- **Structure:** Use the Feature-Sliced structure (`features/` for domain logic, `components/ui/` for shared UI).
- **State:** Enforce immutability. Never mutate React state or props directly.
- **UI Safety:** UI-only changes must NOT alter API calls, route paths, or data structures. Use existing arrays/props.

## 4. Agent Tooling Matrix
Invoke specialized agents selectively based on the task:
- `planner`: Large redesigns, risky changes > 3 files.
- `architect`: Data flow, system design, performance.
- `tdd-guide`: Business logic, APIs, scoring rules.
- `security-reviewer`: Auth, API routes, DB queries, secrets (Red-team audit).
- `build-error-resolver`: Build/TypeScript/Hydration errors.
- `code-reviewer`: General code quality after meaningful changes.

*Stitch Constraints:* Use Stitch ONLY for visual layout and medium-to-large redesigns. Adapt Stitch output to fit existing codebase architecture.