---
paths:
  - "**/*.js"
  - "**/*.jsx"
---
# JavaScript Patterns

> This file extends [common/patterns.md](../common/patterns.md) with JavaScript specific content.

## API Response Format

```javascript
// Standard API response envelope
const ApiResponse = {
  success: true,
  data: null,
  error: null,
  meta: {
    total: 0,
    page: 1,
    limit: 10
  }
}
```

## Custom Hooks Pattern

```javascript
import { useState, useEffect } from 'react'

export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}
```

## Repository Pattern

```javascript
// Repository base implementation
class BaseRepository {
  async findAll(filters = {}) {
    // Implementation
  }
  async findById(id) {
    // Implementation
  }
  async create(data) {
    // Implementation
  }
  async update(id, data) {
    // Implementation
  }
  async delete(id) {
    // Implementation
  }
}
```
