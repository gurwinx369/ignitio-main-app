# Emotional Design System & Guidelines (Ignitio)

This document defines the core emotional design system for the codebase, tailored for **Google Stitch** and other AI agents to ensure that future UI/UX generation remains cohesive, engaging, and premium.

## 1. Core Philosophy: "Learning with Heart"

The design language is inspired by leading gamified experiences like Duolingo. The interface must not feel like a sterile SaaS product or a corporate tool. Instead, it should feel:

- **Welcoming & Warm:** Reduces anxiety and cognitive load.
- **Playful & Gamified:** Encourages exploration without fear of failure.
- **Tangible & Bouncy:** Elements should feel like physical, clickable objects.
- **Accessible:** High contrast where needed, but utilizing soft backgrounds to reduce eye strain.

## 2. Color Palette (Learning-Optimized)

We use a custom, semantic palette heavily defined in `globals.css` and applied via Tailwind utilities or inline styles for specialized components.

### Base Colors

- **Primary (Warm Beige):** `var(--color-primary)` / `#fcf5ee`
  - _Usage:_ Page backgrounds, large structural areas. Promotes a learning-friendly, paper-like feel.
- **Secondary (Deep Navy):** `var(--color-secondary)` / `#19183b`
  - _Usage:_ Primary text, strong interactive elements. Brings focus and professionalism.
- **Accent (Vibrant Cyan):** `var(--color-accent)` / `#00a9ff`
  - _Usage:_ Primary buttons, active states, calls to action. Injects energy.

### Semantic Colors

- **Success (Emerald):** `var(--color-success)` / `#10b981` (Progress & achievement)
- **Warning (Amber):** `var(--color-warning)` / `#f59e0b` (Attention without stress)
- **Error (Red):** `var(--color-error)` / `#ef4444` (Important alerts without aggression)

### Soft Gradients & Accents

- The system frequently uses warm, soft secondary colors (e.g., `#edeae2`, `#f2e0d0`) and gradients (`from-orange-50 to-pink-50`) in component backgrounds (like `Profile.jsx` and `GitCourseCard.jsx`) to break up the layout and add a friendly touch.

## 3. Typography & Shapes

- **Typography:** `Inter, sans-serif`. Use bold, readable font weights (`font-semibold`, `font-bold`) for headings and metrics. Keep text hierarchy distinct.
- **Border Radius:** **NEVER use sharp corners.**
  - Standard elements: `rounded-xl` or `rounded-2xl`
  - Large cards/containers: `border-radius: 24px` or `rounded-4xl`
  - Buttons/Avatars: `rounded-full`
- **Borders:** Use thick borders for interactive emphasis (e.g., `border-4 border-slate-700` on avatars) to create a "sticker" or tangible feel.

## 4. Interaction & Motion

Every interactive element must react to the user. Static elements are considered a failure in this design system.

- **Hover States:** Elements should lift up (`-translate-y-1` or `-translate-y-4px`) and increase their shadow (`box-shadow: 0 20px 56px rgba(0,0,0,0.14)`).
- **Active States:** Elements should press down (simulate a physical button press).
- **Transitions:** Always use `transition-all duration-300 ease-out` for smooth state changes.
- **Micro-animations:** Utilize subtle SVG or Canvas animations (e.g., the git flow canvas animation) for empty states, progress bars, or card headers.

## 5. Component Anatomy: The "Duolingo" Card

When building new cards or interactive widgets, follow this structure (reference: `GitCourseCard.jsx`):

1. **Visual Header:** A top section featuring a soft background color (`#edeae2`), housing an illustration, canvas animation, or icon.
2. **Pill Badges:** Small, bold, floating pill-shaped badges (e.g., status indicators) overlapping the visual header.
3. **Data Body:** A contrasting bottom section (`#f2e0d0` or white) with generous padding (`p-5`).
4. **Progress/Metrics:** Visual progress tracking (e.g., mini-squares or progress bars) rather than just raw numbers.
5. **Action Arrow/Button:** A distinct, floating action icon in the bottom right that reacts to the card's hover state.

## 6. Guidelines for Google Stitch / AI Generation

When instructed to generate a new screen or component:

1. **Do not use plain white or gray backgrounds.** Always default to the Warm Beige (`bg-primary-50`) or soft gradients.
2. **Ensure contrast:** Text should primarily be `text-slate-800` or `text-secondary-900`.
3. **Embed joy:** Add floating icons, subtle background patterns (like a faint dot grid), or emoji to empty states.
4. **Use Tailwind CN:** Use the `cn()` utility for conditional classes, but for hyper-specific card colors that don't fit the strict palette, inline styles with soft hex codes (like `#edeae2`) are acceptable if they maintain the emotional warmth.
5. **Dark Mode:** Respect the `oklch` dark mode variables defined in `globals.css` if implementing dark mode functionality.

By following these rules, the interface will continue to feel like a premium, engaging, and highly successful consumer application.
