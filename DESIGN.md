# Ignitio — Comprehensive Design System & Guidelines

> **Audience:** This document is the single source of truth for Google Stitch and any AI design agent generating UI for Ignitio. Every new screen, component, or interaction must conform to the rules here. Violation of this document produces visually incoherent, off-brand output.

---

## 1. Product Identity & Philosophy

### 1.1 What Ignitio Is

Ignitio is an **AI-powered, gamified tech learning platform** targeting aspiring and early-career software developers. It delivers curated, structured roadmaps (Git & GitHub, C++, Prompt Engineering, DSA) through short video lessons, interactive coding notebooks, AI doubt solvers, and assignment gating — all wrapped in a **game-like progression experience** inspired by Duolingo and Brilliant.

The tagline is implicitly: **"Learning that feels like playing."**

### 1.2 Core Design Philosophy: "Learning with Heart"

The interface must feel like a **premium consumer app**, not a corporate SaaS tool or a bare LMS. The emotional register is:

| Feeling | How It's Achieved |
|---|---|
| **Warm & Welcoming** | Beige/warm paper-like backgrounds; rounded, friendly shapes |
| **Playful & Gamified** | Pill badges, node-based roadmap maps, level squares, confetti, glows |
| **Tangible & Bouncy** | Every card lifts, presses, and reacts to user input |
| **Focused & Professional** | Deep navy text (#19183b), strong typographic hierarchy |
| **Rewarding & Progressive** | XP energy cores, streak counters, certificates, progress rings |

**Do not** produce sterile white/gray designs, flat UI, or corporate-looking layouts. Every screen must embed joy.

### 1.3 Target Audience

- **Primary:** Students and fresh graduates in India (17–26 years old) learning tech for the first time
- **Secondary:** Developers upskilling in AI/ML, Prompt Engineering, DSA
- **User Mindset:** They may feel intimidated by tech. The UI must reduce cognitive anxiety through warmth, progress feedback, and celebration.
- **Device Split:** Mobile-first (significant mobile traffic), but desktop receives richer, more animated experiences

---

## 2. Color System

Ignitio uses a **custom semantic token system** defined in `app/globals.css`. All colors are exposed as CSS custom properties and consumed via Tailwind or inline styles.

### 2.1 The 60 / 30 / 10 Color Law

| Role | Proportion | Color | Token | Hex |
|---|---|---|---|---|
| **Dominant (Base)** | 60% | Warm Beige | `--color-primary` | `#fcf5ee` |
| **Secondary (Structure)** | 30% | White + Slate | `bg-white`, `border-slate-200` | `#ffffff`, `#e2e8f0` |
| **Accent (Energy)** | 10% | Vibrant Cyan | `--color-accent` | `#00a9ff` |

- The 60% warm beige creates the paper-like, anxiety-reducing learning environment. It is the **default page background** (`bg-[#fffaf3]` or `bg-[--color-primary-50]`).
- The 30% white is used for **cards, panels, and contained surfaces** (`bg-white`, `rounded-3xl`, `border border-slate-200`).
- The 10% cyan is reserved **exclusively** for calls-to-action, active states, highlights, and progress elements. Never overuse it.

### 2.2 Full Color Palette

#### Primary — Warm Beige (Learning-Friendly)
```
--color-primary-50:  #fefcf9   <- Lightest page wash
--color-primary-100: #fcf5ee   <- Main page background
--color-primary-200: #f9ebe0   <- Warmer section backgrounds
--color-primary-300: #f5ddc9
--color-primary-400: #f0caa8
--color-primary:     #fcf5ee   <- Default
```
_Usage: All page backgrounds, section washes, profile card backgrounds._

#### Secondary — Deep Navy (Focus & Professionalism)
```
--color-secondary-900: #19183b   <- Main body text, high-emphasis headings
--color-secondary-700: #2f2e6c
--color-secondary-500: #3d3c7f
--color-secondary-300: #7775a5
--color-secondary-100: #c5c4d9
--color-secondary-50:  #e8e8f0
```
_Usage: Primary text color, strong CTA buttons (bg-slate-900), footer, data-heavy areas._

#### Accent — Vibrant Cyan (Energy & Action)
```
--color-accent-500: #00a9ff   <- Primary CTA, links, highlights
--color-accent-600: #0095e6   <- Hover state for CTAs
--color-accent-700: #007bcc
--color-accent-50:  #e6f7ff   <- Tinted backgrounds for accent elements
```
_In code, this appears frequently as `#06b6d4` (Tailwind cyan-500) or `#0891b2` (cyan-600) as an in-practice approximation. Treat these as equivalent to the accent family._

#### Semantic Colors
```
Success (Emerald):  #10b981   -- Completed levels, streak done, positive feedback
Warning (Amber):    #f59e0b   -- Streak at risk, caution states
Error (Red):        #ef4444   -- Errors, destructive actions (used sparingly)
```

#### Card-Specific Warm Tones (Inline Only)
These are used directly in `style={}` for course cards and must not be replicated with plain Tailwind:
```
Course card header background: #edeae2  (warm gray-beige)
Course card body background:   #f2e0d0  (peach-warm)
Profile section background:    #fffaf3  (warmest beige)
Profile decorative border:     #f1e4d2
```

#### Roadmap Theme Colors (Per-Roadmap, Not Difficulty-Based)

Roadmap accent colors are **assigned per roadmap**, not by difficulty tier. Each roadmap gets its own accent + secondary + glow triple that harmonises with the warm beige (`#fffaf3`) page background. The legacy difficulty-based mapping (teal/orange/indigo) was a prototype artifact and is **no longer the rule**.

**How to pick a valid roadmap color:**
- The accent must achieve clear contrast against both the warm beige background and white card surfaces.
- Avoid pure primaries (plain red, blue, green). Prefer curated tones — saturated-but-warm, or vivid-but-cool that complement beige.
- Derive a secondary (lighter tint, ~60% lightness) and a glow (accent at ~35% opacity) from the chosen accent.
- Use the same accent for node borders, node glow, SVG path stroke, `border-top` on the lesson popup, and the CTA button inside the popup.

**Token shape every roadmap must define:**
```
accent:    #XXXXXX   <- Primary roadmap color (high saturation)
secondary: #XXXXXX   <- Lighter tint of accent (~40% lighter)
glow:      rgba(R, G, B, 0.35)  <- Accent at 35% opacity for box-shadows / drop-shadows
backgroundPattern: 'clouds' | 'circuit' | 'galaxy' | 'dots' | 'lines'
```

**Beige Compatibility Rules:**
When pairing a roadmap accent with the `#fffaf3` / `#fcf5ee` warm beige background:
- Cool accents (teal, cyan, indigo, purple) work naturally — the warm-cool contrast is attractive.
- Warm accents (orange, amber, coral) work well but must be sufficiently dark to avoid blending into beige. Use the 600–700 shade, not 300–400.
- Avoid yellow and pure lime — they lose contrast against beige.
- Always verify the glow shadow is visible on the beige page background before shipping.

**Current Roadmap Color Examples (reference, not constraint):**
| Roadmap | Accent | Secondary | Glow |
|---|---|---|---|
| Git & GitHub | `#14B8A6` (teal-500) | `#5EEAD4` | `rgba(20,184,166,0.35)` |
| C++ | `#F97316` (orange-500) | `#FDBA74` | `rgba(249,115,22,0.35)` |
| Prompt Engineering | `#6366F1` (indigo-500) | `#A5B4FC` | `rgba(99,102,241,0.35)` |
| DSA | `#8B5CF6` (violet-500) | `#C4B5FD` | `rgba(139,92,246,0.35)` |

_New roadmaps may freely choose a different accent as long as the beige compatibility rules above are satisfied._

#### Special Colors (One-off but consistent)
```
Discord brand:  #5865F2
Pixel font:     Pixelify Sans (used for game-like moments)
Glow/shadow:    0 20px 56px rgba(0,0,0,0.14)  <- hovered card
                0 6px 24px rgba(0,0,0,0.08)   <- default card
                0 12px 40px rgba(0,0,0,0.10)  <- pressed/active card
```

### 2.3 Dark Mode

**Ignitio does not have a dark mode.** Do not generate dark-mode variants of any screen or component. The `.dark` class and `oklch` dark mode variables in `globals.css` are legacy/shadcn scaffolding — they are inactive and not part of the product. All output must target the light-mode warm beige experience exclusively.

---

## 3. Typography

### 3.1 Font Families

| Font | Variable | Usage |
|---|---|---|
| **Inter** | `--font-inter` | Primary — all body, UI, headings, labels |
| **Pixelify Sans** | `--font-pixelify` | Accent — game-like moments, badge names, pixel-styled decorations |

Both fonts are loaded via `next/font/google`. The `body` default is Inter, `font-sans`.

### 3.2 Type Scale & Usage

| Level | Classes | Usage |
|---|---|---|
| Display | `text-3xl sm:text-4xl font-extrabold` | Hero headings, page titles |
| H1 (Page) | `text-2xl sm:text-3xl font-bold text-slate-900` | Dashboard welcome, roadmap name |
| H2 (Section) | `text-2xl font-bold text-slate-900` | Section titles ("Roadmap Worlds") |
| H3 (Card) | `text-xl font-bold text-slate-900` | Card headings, lesson titles |
| Label / Caption | `text-xs font-bold uppercase tracking-widest` | Badge labels, overline text |
| Body | `text-sm font-medium leading-relaxed text-slate-600` | Descriptions, paragraph text |
| Metric | `text-2xl sm:text-3xl font-black text-slate-900` | Stats counters, numbers |
| Metadata | `text-[11px] font-semibold text-slate-400` | Duration, level count indicators |

**Rules:**
- **Never** use plain, thin font weights for important UI. Minimum `font-medium` for all labels.
- **Tracking** (`tracking-widest` or `tracking-wider`) is used on uppercase badge labels and overlines — adds a professional, gamified feel.
- Heading contrast must always be `text-slate-900` or `text-slate-950` on light backgrounds.

---

## 4. Shape & Border System

### 4.1 Border Radius — "No Sharp Corners" Rule

Ignitio is built on a philosophy of **soft, rounded, tactile shapes**. Sharp corners (< `rounded-lg`) are explicitly prohibited for user-facing interactive elements.

| Element Type | Radius | Class |
|---|---|---|
| Page-level cards / sections | 24px | `rounded-[2rem]` or `rounded-4xl` |
| Dashboard widget cards | 24px | `rounded-3xl` |
| Buttons (primary) | 16px | `rounded-2xl` |
| Buttons (small/icon) | Full | `rounded-full` |
| Badge / pill elements | Full | `rounded-full` |
| Dropdown / popover panels | 16px | `rounded-2xl` |
| Lesson popup / modal | 32px mobile top, 32px all desktop | `rounded-t-[2rem] md:rounded-[2rem]` |
| Input fields | 12px | `rounded-xl` |
| Inline icon containers | 8px | `rounded-lg` |
| Menu items (within panels) | 12px | `rounded-xl` |
| Progress bars / tracks | Full | `rounded-full` |
| Roadmap nodes | Full circle | `rounded-full` |

### 4.2 Borders & Dividers

- Cards use `border border-slate-200` — a single pixel, very subtle divider
- Highlighted cards use `border border-[#f1e4d2]` (warm beige tone for profile/warm sections)
- Lesson popup on mobile has `border-t-8` with the roadmap theme accent color — this is a strong visual anchor
- Dividers within dropdowns: `div.h-px bg-slate-100 my-2 mx-4` (thin, inset)

### 4.3 Avatar Frames

Avatars use ring-based frames with color variants:
```
ring-2 ring-offset-2 ring-offset-[#fffaf3] ring-{color}-300
```
Available frame colors: cyan, blue, purple, orange, green, slate, gold.

---

## 5. Elevation & Shadow System

Ignitio uses **four shadow levels** to create depth:

| State | Shadow | Usage |
|---|---|---|
| **Resting** | `0 6px 24px rgba(0,0,0,0.08)` | Default card in carousel |
| **Hovered** | `0 20px 56px rgba(0,0,0,0.14)` | Card on mouse enter |
| **Pressed/Active** | `0 12px 40px rgba(0,0,0,0.10)` | Card during click action |
| **Subtle** | `shadow-sm` (Tailwind) | Dashboard widget cards, navigation buttons |

Cards also use **ambient glow layers** (Tailwind): a blurred, tinted circle (e.g., `bg-[#06b6d4]/5 rounded-full blur-3xl`) placed absolutely within the card as a decorative accent. This creates the premium "light source" feel.

---

## 6. Interaction & Motion System

**Core Rule: Static elements are a failure.** Every interactive element must visually respond to the user.

### 6.1 Card Hover / Press Cycle

The primary card interaction pattern (sourced from `git-course-card.jsx`):

```
Resting:  translateY(0),    shadow: 0 6px 24px rgba(0,0,0,0.08)
Hovered:  translateY(-4px), shadow: 0 20px 56px rgba(0,0,0,0.14)
Pressing: scale(0.972),     shadow: 0 12px 40px rgba(0,0,0,0.10)
```

Transition: `transition: transform 0.28s ease, box-shadow 0.28s ease;`

### 6.2 Standard Transitions

| Use Case | Tailwind Class |
|---|---|
| All interactive elements | `transition-all duration-300 ease-out` |
| Card hover (custom) | `transition: transform 0.28s ease, box-shadow 0.28s ease` |
| Dropdown/panel open | `transition-all duration-200 ease-out` + opacity scale translate-y |
| Progress bars | `transition-all duration-1000 ease-out` |
| Node reveal | `transition-all duration-300` |

### 6.3 Micro-Animations

| Animation | Applied To | Class / Keyframe |
|---|---|---|
| Card enter | Dashboard widgets | `animate-in fade-in slide-in-from-bottom-4 duration-500` |
| Dropdown appear | Profile menu | `animate-in fade-in slide-in-from-top-2 duration-200` |
| Rotating ring | XP Energy Core | `animate-[spin_10s_linear_infinite]` |
| Orbiting particle | XP Energy Core | `animate-[spin_4s_linear_infinite]` |
| Pulsating glow | XP Core inner | `animate-pulse` |
| Moving dot (trail) | Mission Energy | `animate-[slide_4s_ease-in-out_infinite_alternate]` |
| Roadmap node unlocked | Pulse until tapped | `animate-pulse hover:animate-none` |
| Streak badge pulse | On status change | `animate-pulse` (2s, then off) |
| Cell ripple | Canvas backgrounds | `@keyframes cell-ripple` (opacity 0.4 -> 0.8 -> 0.4) |
| Shine | Gradient overlays | `@keyframes shine` (background-position sweep) |
| Onboarding entry | Step slides | `@keyframes slideIn` (translateX 20px -> 0) |
| Onboarding bounce | Decorative icons | `@keyframes bounce` (translateY 0 -> -10px -> 0) |

### 6.4 Menu Item Hover Behavior

Dropdown/menu items use a **translate-x micro-animation** on hover — the item slides 1px right:
```
hover:translate-x-1
```
This creates a subtle directional affordance that feels premium and responsive.

### 6.5 Button Active States

Buttons that need a physical "press" feel:
```
active:scale-95
```
Large CTA buttons also use:
```
hover:scale-[1.02]  hover:shadow-lg
```

---

## 7. Component Design Specifications

### 7.1 The "Ignitio Card" — Anatomy (Course Cards)

Every course card (Git, C++, DSA, Prompt Engineering) follows this strict two-part anatomy:

**Part 1 — Visual Header (height: 260px)**
- Background: `#edeae2` (warm gray-beige, never white)
- Contains: Canvas animation or illustration (full bleed)
- Floating pill badge (top-right): Shows course status ("Not Started", "In Progress", "Completed") — morphs through loading states
- Loading overlay: semi-transparent on canvas during click
- `border-radius: 24px` on the entire card wrapping div

**Part 2 — Info Body**
- Background: `#f2e0d0` (warm peach)
- Padding: `px-5 pt-4.5 pb-5`
- Duration label: clock icon + `text-[11px] font-bold tracking-widest uppercase` in `#3a3330`
- Description: `text-[15.5px] font-medium leading-[1.55]` in `#1e1a18`
- Level squares (progress): mini colored squares showing completion per level
- Level count: `levelsFinished/totalLevels levels` in muted opacity
- Action arrow (bottom-right): circle button `w-8 h-8 rounded-full` — translates right on hover, morphs to spinner/checkmark during load

### 7.2 Dashboard Widget Cards

Dashboard cards (MissionControl, Streak, ActiveRoadmap, LearningStats) follow:
```
bg-white
rounded-3xl
p-6 sm:p-8
shadow-sm
border border-slate-200
animate-in fade-in slide-in-from-bottom-4 duration-500
transition-shadow hover:shadow-md
```

**Section label (overline):**
```
text-xs font-bold text-[#06b6d4] tracking-widest uppercase flex items-center gap-2
```

**MissionControlCard** additionally features:
- Ambient glow: `absolute -right-24 -top-24 w-64 h-64 bg-[#06b6d4]/5 rounded-full blur-3xl`
- XP Energy Core: SVG progress ring with rotating dashed ring, orbiting particle, Zap icon
- Mission Energy Trail: animated dot traveling across a track with labeled nodes (Learn -> Practice -> Unlock)

### 7.3 Roadmap World View

The core learning experience UI:
- Background: `var(--color-primary)` (warm beige)
- Background pattern layer at `opacity-[0.08]` with difficulty-based motif (clouds / circuit grid / galaxy)
- Nodes: circular, `w-14 h-14 md:w-[72px] md:h-[72px]`, `border-4`, `rounded-full`
  - **Locked:** `bg-gray-200 border-gray-300 text-gray-400 opacity-60 grayscale` + Lock icon
  - **Unlocked:** `bg-white text-gray-900 animate-pulse hover:animate-none hover:scale-110` + number label
  - **Completed:** background = `theme.accent`, border = `theme.accent`, `boxShadow: 0 0 20px theme.glow` + Check icon
- Connecting paths: SVG curved paths, `stroke={theme.accent}`, `strokeWidth="8"`, `filter: drop-shadow(0 0 8px ${theme.glow})`
- Path opacity container: `opacity-40`

**Node title tooltip:** floats below node, `text-xs font-bold uppercase tracking-wider`, fades in on group hover.

**"Start here" hint bubble:** `bg-white/95 backdrop-blur shadow-md border border-slate-200 rounded-2xl` with a CSS caret pointing to the node.

### 7.4 Lesson Popup (Node Click Panel)

Two modes:
- **Mobile:** Full-screen bottom sheet — `fixed left-0 right-0 bottom-0`, `rounded-t-[2rem]`, `border-t-8` (accent color), `bg-white/95 backdrop-blur`, `max-h-[85dvh]`, drag handle at top
- **Desktop:** Smart-positioned panel — `absolute`, `rounded-[2rem]`, `border border-[#f1e4d2]`, `w-[380px]`, smart left/right placement based on available space

Panel interior:
- Difficulty badge: `bg={theme.glow} text={theme.accent}` pill
- Status badge: `bg-green-100 text-green-700` (completed) or `bg-blue-50 text-blue-700` (up next)
- Title: `text-xl md:text-2xl font-extrabold text-gray-900`
- Description: `text-gray-600 text-sm leading-relaxed`
- Duration info: gray-50 row with clock icon
- CTA button: full-width, `py-4 rounded-2xl`, background = `theme.accent`, `font-bold text-lg`, `hover:scale-[1.02]` + arrow icon that translates right on hover

### 7.5 Level Content (Learning Screen)

Three tabs: **Video**, **Practice**, **Kyle (AI)**

The tab bar sits above the content area. Active tab is visually distinguished with the roadmap's theme accent color underline or background.

**Video tab:** YouTube segment player or full-video player — embedded, takes primary focus.
**Practice tab:** Split panel — notebook iframe on right, TabBar controls on top (Fullscreen, Reset).
**Kyle tab:** AI doubt solver / quiz modal overlay.

Level completion is gated by either video watch-time (50% of duration) or AI quiz gate passing.

### 7.6 Buttons

The `Button` component uses `cva` (class-variance-authority) with these variants:

| Variant | Visual Style | Use When |
|---|---|---|
| `default` | `bg-primary text-primary-foreground` | Generic shadcn default — rarely used in Ignitio custom UI |
| `destructive` | `bg-destructive text-white` | Delete / logout actions |
| `outline` | `border bg-background` | Secondary actions |
| `secondary` | `bg-secondary text-secondary-foreground` | Subtle secondary |
| `ghost` | Transparent with hover bg | Icon buttons, menu items |
| `link` | Underline on hover | In-text navigation |

**Ignitio custom button patterns** (not shadcn variants — used directly in components):

| Pattern | Classes | Use |
|---|---|---|
| Primary CTA | `bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 shadow-md active:scale-95` | Continue Learning, Submit |
| Accent CTA | `bg-[#06b6d4]/10 text-[#0891b2] rounded-xl font-bold hover:bg-[#06b6d4]/20` | Daily Task, secondary accent |
| White bordered | `bg-white border border-slate-200 rounded-xl shadow-sm text-slate-700 hover:bg-slate-50` | Feedback, menu toggles |
| Icon round | `w-10 h-10 rounded-full flex items-center justify-center` | Profile toggle, nav circles |
| Lesson Start | `w-full py-4 rounded-2xl font-bold text-lg text-white active:scale-95 hover:scale-[1.02] hover:shadow-lg` | Start/Review Lesson |

### 7.7 Badges & Pills

Pills follow this standard:
```
px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider
```

Color combinations:
| Semantic | Background | Text |
|---|---|---|
| Done / Completed | `bg-green-100` | `text-green-700` |
| At Risk | `bg-orange-100` | `text-orange-700` |
| Pending | `bg-slate-200` | `text-slate-700` |
| Up Next | `bg-blue-50` | `text-blue-700` |
| Difficulty (theme) | `bg={theme.glow}` | `text={theme.accent}` |
| Active (roadmap) | `bg-slate-50 border-slate-100` | `text-slate-500` |

### 7.8 Progress Indicators

Ignitio uses four types of progress visualization:

1. **Linear progress bar:** `h-2.5 bg-slate-100 rounded-full` -> inner `h-full bg-[#06b6d4] rounded-full` with shimmer animation
2. **SVG circular ring:** (XP Energy Core) — circle stroke with `strokeDasharray/Dashoffset` technique, cyan stroke
3. **Level squares:** Small colored squares (6x6 or 8x8 px) in a scrollable row — filled = completed, empty = remaining (`progress-squares-container` class)
4. **GitHub-style heatmap grid:** `GitHubProgressGrid` — small cells with ripple animation

### 7.9 Profile Section

Profile card uses:
```css
rounded-[2rem]
bg-[#fffaf3]
border border-[#f1e4d2]
shadow-sm
motion-safe:hover:-translate-y-1 motion-safe:hover:scale-[1.01] motion-safe:hover:shadow-lg
will-change-transform
```

Decorative internal elements:
- Top-right: `w-64 h-64 bg-cyan-100 rounded-full blur-3xl opacity-30` (clipped, off-screen)
- Bottom-left: `w-48 h-48 bg-orange-100 rounded-full blur-3xl opacity-50` (clipped, off-screen)
- Decorative dot: `w-3 h-3 rounded-full bg-[#f1e4d2]`

Avatar button:
- Full circle `rounded-full`, with optional `ring-2 ring-offset-2` frame
- Backdrop on hover: `hover:shadow-md transition-all duration-300`

### 7.10 Dropdown / Profile Menu

Panels:
```
w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-[9999]
transition-all duration-200 ease-out
opacity + scale + translate-y animation (CSS state, not JS class swap)
```

Menu items:
```
flex items-center gap-3 px-4 py-3 mx-2 text-sm font-bold
rounded-xl transition-all hover:translate-x-1
```
Icon containers within items:
```
p-1.5 bg-[color]/10 text-[color] rounded-lg
```

### 7.11 Streak Status Card

Sub-components within the card:
- **Stats grid:** 3 cells — Current / Longest / Freezes
  - Current: `bg-orange-50/50 border-orange-100`
  - Longest: `bg-slate-50 border-slate-100`
  - Freezes: `bg-blue-50/50 border-blue-100`
- **Day tracker:** 7 circles — status-driven colors (green/white/blue/gray)
- **Earn-back alert:** `border-orange-200 bg-orange-50 text-orange-700 rounded-2xl` + Flame icon

### 7.12 Roadmap Carousel (RoadmapWorldsCarousel)

Desktop carousel: 3D-stacked effect
- Center card: `scale(1)`, `opacity-1`, `zIndex: 10`
- Side cards: `scale(0.85)`, `opacity-0.4`, `zIndex: 0`, `translateX(+/-55%)`
- Non-center cards: `cursor-pointer hover:opacity-100 hover:scale-105`
- Transition: `transition-all duration-500 ease-out`

### 7.13 Loading / Skeleton States

- Skeleton elements: `animate-pulse bg-slate-100 rounded-2xl` (full area shimmer)
- Card-level loading: spinner icon (SVG rotate animation) replaces the CTA arrow
- Success state: checkmark icon (`2ecc8a` green), success overlay on canvas (`rgba(57,211,83,0.06)`)
- Status badge morphs through: "Not Started" -> loading spinner -> success check -> completion message

---

## 8. Layout & Spacing System

### 8.1 Page-Level Layout

**Dashboard page:**
```
min-h-screen bg-[#fffaf3] pb-24 font-sans text-slate-900
max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8
```

Dashboard grid:
- Mobile: Single column stacked (`flex flex-col`)
- Desktop: `lg:grid lg:grid-cols-3 gap-6`
  - Row 1: MissionControl (`lg:col-span-2`) + Streak (`lg:col-span-1`)
  - Row 2: ActiveRoadmap (`lg:col-span-2`) + LearningStats (`lg:col-span-1`)

**Roadmap page:**
```
relative w-full bg-[var(--color-primary)]
```
Nodes positioned absolutely within a calculated `minHeight` container.

### 8.2 Spacing Scale Usage

| Context | Value |
|---|---|
| Card internal padding | `p-5` (sm), `p-6` (md), `p-8` (lg) |
| Gap between grid cells | `gap-3` to `gap-6` |
| Section bottom margin | `mb-8` to `mb-12` |
| Icon-to-text gap | `gap-2` to `gap-3` |
| Badge padding | `px-2.5 py-1` |
| Button padding | `px-4 py-2` (sm), `px-8 py-3.5` (lg) |

### 8.3 Mobile Bottom Navigation

Mobile-only pill nav at the bottom of the dashboard:
```
grid grid-cols-3 gap-1
rounded-full border border-slate-200 bg-white p-1.5 shadow-sm
max-w-[480px] mx-auto
```
Active tab: `bg-slate-900 text-white rounded-full`
Inactive: `text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-full`

---

## 9. Background Patterns & Visual Texture

Ignitio's backgrounds are **never plain white or flat gray**. They use:

1. **Warm Beige base** — always `#fffaf3` or `#fcf5ee`
2. **Dot grid pattern** — subtle 0.8px dots at 24px intervals, `rgba(0,0,0,0.06)` fill (used in git canvas animation background)
3. **Blur glow orbs** — large blurred circles (`blur-3xl`, `rounded-full`) in cyan or orange, `opacity-20-50%`, clipped to containers
4. **Roadmap theme backgrounds:**
   - Beginner: cloud blobs (`rounded-full blur-xl/2xl`) + pulsing particles
   - Intermediate: CSS grid lines (`linear-gradient` 1px lines at 40px interval)
   - Advanced: radial gradient nebula + floating rings (`border-2 rounded-full blur-[1px]`)

---

## 10. Iconography

- **Icon library:** Lucide React (`lucide-react`)
- **Standard icon size:** `w-4 h-4` (small UI) / `w-5 h-5` (standard) / `w-6 h-6` (emphasis)
- Icons in icon containers: always wrapped in a `p-1.5 bg-{color}/10 text-{color} rounded-lg` div
- SVG custom icons: used for clock, arrow-right in course card bodies (custom paths, not lucide)
- Emoji: used sparingly in empty states and onboarding for warmth (e.g., notebook, laptop, warning)

---

## 11. Animation Canvas Components

Ignitio uses **Canvas API animations** as visual headers in course cards:

### Git Course Card Canvas
- Renders an animated Git commit graph (nodes + edges + flowing particle)
- Node colors: dark gray (`#3a3a3a`), bright green (`#39d353`), purple (`#bc8cff`)
- Background: subtle dot grid `rgba(0,0,0,0.06)`
- Nodes appear with a pulse/glow on entry, particle flows along edges
- Canvas fills parent container, DPR-aware

### Canvas Reveal Effect
- `canvas-reveal-effect.jsx` provides a generative cell-based reveal animation used in card headers
- Cells animate with ripple opacity: `@keyframes cell-ripple` (0.4 -> 0.8 -> 0.4)

---

## 12. Onboarding Flow Design

The onboarding screen uses inline animations:

Keyframes used:
- `slideIn`: `translateX(20px) -> translateX(0)` + opacity
- `pulse`: `scale(1) -> scale(1.05) -> scale(1)`
- `bounce`: `translateY(0) -> translateY(-10px) -> translateY(0)`
- `fadeIn`: opacity 0 -> 1
- `spin`: rotate 360deg

Multi-step form with an **animated progress bar** that smoothly fills from 50% (step 1) to 100% (step 2) over 800ms using JavaScript interval.

Tech field selector: grid of pill-shaped toggle chips, max 3 selectable simultaneously.

---

## 13. Stitch AI Generation Guidelines

When using Stitch to generate new screens or components for Ignitio, enforce these rules:

### 13.1 Absolute Constraints

1. **Never use plain white or flat gray page backgrounds.** Always use `#fffaf3`, `#fcf5ee`, or a warm gradient.
2. **Never use sharp corners** (`rounded-none`, `rounded-sm`). Minimum `rounded-xl` for any user-facing element.
3. **Never use thin font weights** for UI text. Use `font-medium` or heavier.
4. **Never render static, non-interactive cards.** Every card must have hover lift + shadow change.
5. **Cyan (`#00a9ff` / `#06b6d4`) must never exceed 10% visual area.** It is an accent, not a dominant color.
6. **Never hardcode course titles, levels, or user names.** Always use props/data bindings.

### 13.2 Required Additions

1. **Embed decorative blur orbs** in cards and section backgrounds. Minimum one `blur-3xl rounded-full` per major card.
2. **Add a dot grid or subtle texture** to any large ambient area (canvas, empty states, roadmap backgrounds).
3. **Use the appropriate roadmap theme color** (teal/orange/indigo) based on difficulty — not generic Tailwind blue.
4. **Animate progress elements** — never use static numbers. Use `transition-all duration-1000 ease-out`.
5. **Pill badges** must be present on all cards showing status.
6. **Typography hierarchy** must be clear: overline label -> heading -> body -> metadata.

### 13.3 Screen-Specific Rules

| Screen | Key Constraints |
|---|---|
| Dashboard | 3-col grid (desktop), warm beige bg, white widget cards, cyan accent only for CTAs |
| Roadmap World | Beige bg + difficulty pattern, teal/orange/indigo theme per level, all-circle nodes |
| Lesson Popup | Mobile = bottom sheet; desktop = smart side panel; accent border-top |
| Level Content | Video-first, tab bar; full-height layout; no warm beige — use white/gray for reading focus |
| Onboarding | Centered card on warm beige, animated progress bar, pill chip selectors |
| Profile | Warm beige card with glow orbs, round avatar with ring frame |
| Certificate | Celebratory — confetti, gold/amber accents, achievement language |

### 13.4 Color Application Checklist

Before delivering any generated component, verify:
- [ ] Page background uses warm beige family, not white
- [ ] Cards use `bg-white` on warm background (contrast achieved)
- [ ] Cyan accent used only for 1-2 highlights per view
- [ ] All interactive elements have hover + active states
- [ ] Progress is visualized (not just text numbers)
- [ ] Border radius is `rounded-xl` minimum on all interactive elements
- [ ] Shadows are applied at rest, increase on hover
- [ ] Typography uses `Inter`, with bold weights for headings and labels

---

## 14. Product Voice & Empty States

When there is no data to display (e.g., no streak, no active roadmap, no completed levels):

- **Never show a blank area.** Always render an empty state.
- Empty state structure:
  1. Icon in a soft circle: `w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center`
  2. Heading: `text-lg font-bold text-slate-900`
  3. Subtext: `text-sm text-slate-500`
  4. Optional CTA button

Empty state copy is encouraging, not apologetic:
- "Start learning to build your streak."
- "Start a roadmap to track your progress here."
- Never: "No data found." / "Nothing to show."

---

## 15. Accessibility Standards

- All interactive elements must have `aria-label` or visible label text
- Modals use `role="dialog"` and escape key closes them
- Focus rings: `focus-visible:ring-[3px] focus-visible:ring-ring/50`
- Color contrast: text on warm beige backgrounds uses `text-slate-900` (dark) to ensure WCAG compliance
- Disabled states: `opacity-50 cursor-not-allowed pointer-events-none`
- `motion-safe:` prefix on heavy animations to respect `prefers-reduced-motion`

---

*This document was synthesized from a full audit of `app/globals.css`, all components in `components/ui/`, `features/dashboard/`, `layout/`, and `features/roadmaps/`. It supersedes the previous shorter DESIGN.md. Last updated: August 2026.*
