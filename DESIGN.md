# Ignitio — Core Design System

> **Audience:** AI design agents and UI engineers. This is a high-density, token-efficient summary. Violation produces off-brand, visually incoherent output.

## 1. Product Identity
Ignitio is a **gamified tech learning platform** (like Duolingo/Brilliant for devs).
**Vibe:** Warm, welcoming, playful, tangible, and progressive. No sterile white/gray SaaS layouts.

## 2. Color & Typography
Instead of hardcoding hex values, **always use the semantic tokens** defined in `app/globals.css`.

- **Dominant (60%):** Warm Beige (e.g., `bg-[--color-primary-100]`). Use for all page backgrounds.
- **Surface (30%):** White (`bg-white`). Use for cards/panels on top of beige backgrounds.
- **Accent (10%):** Vibrant Cyan (`--color-accent`). Use *sparingly* for CTAs and highlights.
- **Typography:**
  - `Inter` (sans): Primary UI font. Use `font-bold` or `font-extrabold` for headings (`text-slate-900`).
  - `Pixelify Sans`: Game-like moments.
  - *Rule:* Never use thin font weights. Minimum `font-medium`.

## 3. Shape, Elevation & Motion
- **No Sharp Corners:** Minimum `rounded-xl`. Standard cards are `rounded-3xl` or `rounded-4xl`. Buttons are `rounded-2xl` or `rounded-full`.
- **Elevation:** Use `shadow-sm` at rest.
- **Motion (Mandatory):** *Static UI is a failure.* Every interactive element must respond to hover/press.
  - **Cards:** `transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:scale-95`
  - **Buttons:** `hover:scale-[1.02] active:scale-95`

## 4. Components & Layout
- **Cards:** White bg, subtle `border-slate-200`, heavy rounded corners.
- **Empty States:** Never show a blank screen. Use a soft circular icon, bold heading, and encouraging subtext.
- **Progress:** Always visualize (bars, rings, level squares) rather than just showing numbers.

## 5. AI Generation Constraints (Stitch/Agents)
1. **Never use plain white or flat gray page backgrounds.**
2. **Never use sharp corners.**
3. **Never render static, non-interactive cards.** Add hover states.
4. **Cyan must not exceed 10% visual area.**
5. **Always add visual texture** (e.g., blur orbs, dot grids) to large empty areas.
