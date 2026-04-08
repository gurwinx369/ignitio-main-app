# Ignitio — Agent Instructions

This file defines specialized agents for delegation when working with this Next.js learning platform.

## Core Principles

1. **Agent-First** — Delegate to specialized agents for domain tasks
2. **Test-Driven** — Write tests before implementation, 80%+ coverage required
3. **Security-First** — Never compromise on security; validate all inputs
4. **Immutability** — Always create new objects, never mutate existing ones
5. **Plan Before Execute** — Plan complex features before writing code

## Available Agents

| Agent | Purpose | When to Use |
|-------|---------|-------------|
| planner | Implementation planning | Complex features, refactoring, architectural decisions |
| architect | System design and scalability | Architectural decisions, performance optimization |
| tdd-guide | Test-driven development | New features, bug fixes, API endpoints |
| code-reviewer | Code quality review | After writing/modifying code |
| security-reviewer | Vulnerability detection | Before commits, sensitive code, auth flows |
| build-error-resolver | Fix build/type errors | When build fails, TypeScript errors |
| e2e-runner | End-to-end testing | Critical user flows, integration testing |
| refactor-cleaner | Dead code cleanup | Code maintenance, removing unused exports |
| doc-updater | Documentation updates | API docs, README updates, code comments |

## Agent Orchestration

**Use agents proactively without user prompt:**

| Scenario | Agent to Use |
|----------|-------------|
| Complex feature request | planner |
| Code just written/modified | code-reviewer |
| Bug fix or new feature | tdd-guide |
| Architectural decision | architect |
| Security-sensitive code (auth, payments) | security-reviewer |
| Build failing | build-error-resolver |
| Dead code removal | refactor-cleaner |

**Use parallel execution for independent operations.**

## Security Guidelines

**Before ANY commit:**
- [ ] No hardcoded secrets (Firebase config, API keys, tokens)
- [ ] All user inputs validated
- [ ] Firebase Auth tokens validated server-side
- [ ] MongoDB queries use parameterized queries
- [ ] XSS prevention (sanitized HTML)
- [ ] Error messages don't leak sensitive data

**Secret management:**
- NEVER hardcode secrets in source code
- Use environment variables (`process.env.*`)
- Validate required secrets at startup
- Rotate any exposed secrets immediately

**If security issue found:**
1. STOP immediately
2. Use **security-reviewer** agent
3. Fix CRITICAL issues before continuing
4. Rotate any exposed secrets
5. Review entire codebase for similar issues

## Coding Style

**Immutability (CRITICAL):**
```javascript
// WRONG: Mutating state
state.items.push(newItem)

// CORRECT: Creating new state
setState({ items: [...state.items, newItem] })
```

**File organization:**
- Many small files over few large ones
- 200-400 lines typical, 800 max
- Organize by feature/domain, not by type
- High cohesion, low coupling

**Error handling:**
- Handle errors at every level
- User-friendly messages in UI
- Log detailed context server-side
- Never silently swallow errors

**React/Next.js patterns:**
- Server Components by default
- 'use client' only when needed
- Extract reusable logic to custom hooks
- Keep components focused on single responsibility

## Testing Requirements

**Minimum coverage: 80%**

Test types (all required):
1. **Unit tests** — Individual functions, utilities, components
2. **Integration tests** — API endpoints, database operations
3. **E2E tests** — Critical user flows (auth, progress tracking)

**TDD workflow:**
1. Write test first (RED) — test should FAIL
2. Write minimal implementation (GREEN) — test should PASS
3. Refactor (IMPROVE) — verify coverage 80%+

## Development Workflow

1. **Plan** — Use planner agent, identify dependencies and risks, break into phases
2. **TDD** — Use tdd-guide agent, write tests first, implement, refactor
3. **Review** — Use code-reviewer agent immediately, address CRITICAL/HIGH issues
4. **Commit** — Conventional commits format, comprehensive PR summaries

## Git Workflow

**Commit format:** `<type>: <description>`

Types: feat, fix, refactor, docs, test, chore, perf, ci

**PR workflow:**
1. Analyze full commit history
2. Draft comprehensive summary
3. Include test plan
4. Push with `-u` flag

## Architecture Patterns

**React Context Pattern:**
```javascript
// features/context/AuthContext.js
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // ...
  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
```

**API Route Pattern:**
```javascript
// app/api/v1/roadmaps/route.js
export async function GET(request) {
  try {
    const data = await Roadmap.find()
    return Response.json({ success: true, data })
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}
```

**Mongoose Model Pattern:**
```javascript
// models/roadmap.model.js
const RoadmapSchema = new mongoose.Schema({
  title: { type: String, required: true },
  // ...
}, { timestamps: true })

export default mongoose.models.Roadmap || mongoose.model('Roadmap', RoadmapSchema)
```

## Performance Guidelines

**Context management:**
- Avoid last 20% of context window for large refactoring
- Use `/clear` between unrelated tasks
- Use `/compact` at logical breakpoints
- Single edits, docs, simple fixes tolerate higher utilization

**Build troubleshooting:**
- Use build-error-resolver agent
- Analyze errors
- Fix incrementally
- Verify after each fix

## Success Metrics

- All tests pass with 80%+ coverage
- No security vulnerabilities
- Code is readable and maintainable
- Performance is acceptable
- User requirements are met