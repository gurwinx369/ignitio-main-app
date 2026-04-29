---
paths:
  - "**/*.js"
  - "**/*.jsx"
---
# JavaScript Security

> This file extends [common/security.md](../common/security.md) with JavaScript specific content.

## Secret Management

```javascript
// NEVER: Hardcoded secrets
const apiKey = "sk-proj-xxxxx"

// ALWAYS: Environment variables
const apiKey = process.env.OPENAI_API_KEY

if (!apiKey) {
  throw new Error('OPENAI_API_KEY not configured')
}
```

## Agent Support

- Use **security-reviewer** skill for comprehensive security audits
