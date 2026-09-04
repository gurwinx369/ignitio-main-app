---
name: animation-micro-interactions
description: Adds purposeful micro-interactions for EdTech products at real scale (1k+ weekly active users) — correct/incorrect feedback, streaks, progress, celebrations, loading states — that stay smooth from low-end Android phones to high-end devices, and respect prefers-reduced-motion. Use when adding motion or feedback animation to a learning product's frontend.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

# Animation and Micro-Interactions (EdTech, scale-aware)

Motion here has one job: tell the learner what just happened (right, wrong, progress, milestone) as fast and cheaply as possible. At 1k+ weekly active users, a meaningful slice of them are on a cheap Android phone or an old laptop — design and test for that device, not the one on your desk.

## Step 1 — Check what already exists

Glob for `**/animations/**/*`, `**/styles/**/*`, `**/globals.css`, `**/tailwind.config.*`, and component files.

Grep for: `transition:`, `@keyframes` / `animation:`, `framer-motion` / `motion.`, `lottie` / `rive`, `prefers-reduced-motion`, `will-change`.

Note whether a motion library is already installed, whether reduced-motion is handled anywhere, and whether there's an existing streak/progress/celebration component you should extend instead of duplicating.

## Step 2 — Only animate `transform` and `opacity`

These are the only two properties that don't force the browser to re-lay-out or repaint the page — everything else costs real, visible frames, and that cost is much larger on a budget Android phone than on your laptop.

- Resizing something → `transform: scale()`, never `width`/`height`.
- Moving something → `transform: translate()`, never `top`/`left`/`margin`.
- A progress bar filling → `transform: scaleX()` on the fill element, or an SVG `stroke-dashoffset` animation — never animate `width` on a growing bar.
- Never write `transition: all` — list the specific properties, or you'll accidentally animate things you didn't mean to and tank performance.

## Step 3 — Set a performance budget before you design anything

This is the step that's easy to skip and the one that breaks first at scale.

- **One animation carries the message.** Don't stack three effects (scale + shake + color + confetti) on a routine action — cost adds up and it stops reading as "feedback" and starts reading as noise.
- **Animate only what's visible.** In a lesson list or leaderboard, animate the items on screen, not all 50 in the DOM. Use an `IntersectionObserver` (or your framework's equivalent) to skip animating off-screen elements entirely.
- **Cap concurrent animations.** If ten things could animate at once (e.g., a batch of correct answers loading in), stagger them or animate only the first few — don't fire ten simultaneous animations on a phone with a weak GPU.
- **Prefer plain CSS over a JS animation library** for anything simple (hover, fade, bounce, progress fill). CSS transitions/keyframes are cheaper and don't need a JS bundle. Reach for Framer Motion / Lottie / Rive only for things CSS genuinely can't do (physics-based drag, complex character rigs) — and lazy-load that library so it doesn't slow down the first paint for everyone.
- **Keep exported animation assets small.** A Lottie/Rive file for a mascot or celebration should be optimized (simplified paths, no embedded raster images) — an unoptimized export can be several megabytes and will stutter or fail to load on a slow connection.
- **Test throttled, not just on your machine.** Use browser dev tools' CPU throttling (4x–6x) to approximate a mid/low-end phone before calling an animation "done."

## Step 4 — Timing that feels instant, not decorative

| What                                 | Duration             | Why                                                        |
| ------------------------------------ | -------------------- | ---------------------------------------------------------- |
| Tap/press feedback                   | 80–120ms             | Must feel instant                                          |
| Correct/incorrect answer feedback    | 150–250ms            | Fast enough to not delay the next question                 |
| Hover / focus state                  | 150–200ms            | Quick, no lag                                              |
| Progress bar / streak counter update | 200–400ms            | Visible but not slow                                       |
| Milestone / celebration animation    | 400ms–1.2s, one time | Bigger moment, still doesn't block the user from moving on |
| Loading animation                    | loops at 1.5–2s      | Should feel calm, not urgent                               |

Use an ease-out curve for anything appearing on screen, ease-in for anything leaving, and skip the plain `ease` keyword — pick one on purpose so every animation in the product feels consistent.

## Step 5 — EdTech-specific patterns (what Duolingo, Brilliant, and similar products actually do)

**Correct answer:** immediate (under 200ms) checkmark or green pulse, no delay before the user can continue. This one should never be skipped or downgraded for low-end devices — it's core feedback, not decoration, and it's cheap (color + small scale change).

**Incorrect answer:** a gentle shake or a brief color pulse — never a harsh or punishing effect. The goal is "try again," not "you failed."

**Streaks / daily-habit counters:** a small bounce or flame/number pop when the counter updates. This runs every single time a user opens the app, so it must be one of the cheapest animations in the product — a scale + color change, not a heavy character animation.

**Progress paths/bars:** animate the fill continuously as it happens (transform-based, per Step 2), not as a jump-cut. Users should see it moving, not just land on a new number.

**Celebrations must scale with the size of the win.** This is the mistake to actively avoid: firing the same full-screen confetti animation for every small action trains users to tune it out, and gets genuinely annoying by the tenth repetition in a session. Finishing one question gets a small, quick animation. Finishing a lesson gets more. A big milestone (course completion, a long streak) earns the full celebration — mascot, sound, the works. Match the animation's size to the size of the achievement.

**Mascot/character reactions:** treat these as an enhancement, not a requirement, on low-end devices. On capable devices, play the full character animation; on low-end devices or slow connections, fall back to a static image swap that still conveys the emotion (happy/sad/proud) without the animation cost.

**Loading states:** a small branded animation (a shape, an icon morph) reads better than a generic spinner and reinforces identity — but keep it as lightweight CSS/SVG, not a video or a large Lottie file, since it's the thing users watch while waiting on a slow connection.

**Lesson/screen transitions:** keep navigation chrome (header, progress bar, nav) still; animate only the content area swapping in.

**Sound pairing (if audio is used):** if a correct/incorrect animation has a matching sound, always show the visual regardless of whether audio is muted or fails to load — the animation must carry the meaning on its own.

## Step 6 — Reduced motion and accessibility

This is required, not optional — some users get real physical discomfort (motion sickness, vestibular issues) from animation.

- Wrap non-essential motion in `@media (prefers-reduced-motion: no-preference)`. When the user has reduced motion on: keep functional state changes (checkmark appears, bar fills) but make them instant or a short fade only — drop shakes, bounces, confetti, and parallax.
- Gate hover-only effects behind `@media (hover: hover)` so touch devices don't get stuck in a hover state.
- Never let an animation delay the user from moving on — if a celebration takes 1 second, the "continue" action should already be tappable, not blocked until the animation finishes.

## Step 7 — Verify before shipping

- [ ] Every animation uses only `transform` and `opacity`.
- [ ] Tested with CPU throttling (4x–6x) to approximate a low-end phone.
- [ ] No more than one animation is carrying the message for any single action.
- [ ] Off-screen elements are not animating.
- [ ] Celebration size matches achievement size (small win → small animation).
- [ ] Correct/incorrect feedback is instant and never skipped, even in the low-end fallback.
- [ ] `prefers-reduced-motion` is respected everywhere — grep for any `@keyframes`/`transition`/`motion.` not covered by it.
- [ ] Hover effects are gated behind `@media (hover: hover)`.
- [ ] Any Lottie/Rive/animation asset is optimized and lazy-loaded, not blocking first paint.

## Anti-patterns to flag

- Animating `width`, `height`, `margin`, `top`, `left` — use `transform` instead.
- The same big celebration (e.g., full-screen confetti) firing on every small action — causes celebration fatigue.
- Stacking multiple effects on one routine action.
- An animation-heavy mascot or character reaction with no lighter fallback for low-end devices.
- A loading animation big enough that it's slow to load itself.
- Any animation that blocks the user from continuing until it finishes.
- `transition: all` instead of naming specific properties.
