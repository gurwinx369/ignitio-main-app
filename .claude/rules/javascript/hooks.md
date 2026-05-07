---
paths:
  - "**/*.js"
  - "**/*.jsx"
---
# JavaScript Hooks

> This file extends [common/hooks.md](../common/hooks.md) with JavaScript specific content.

## PostToolUse Hooks

Configure in `~/.claude/settings.json`:

- **Prettier**: Auto-format JS files after edit
- **ESLint check**: Run `eslint` after editing `.js`/`.jsx` files
- **console.log warning**: Warn about `console.log` in edited files

## Stop Hooks

- **console.log audit**: Check all modified files for `console.log` before session ends
