# KIBO.md — Kibo AI Pet: Character and Behavioral Architecture

> Written directly from source code. Master reference for Kibo design, physics, animations, and interaction rules.

---

## File Map

| File | Role |
|---|---|
| features/kyle/pet/KiboPet.jsx | Root orchestrator — state machine, event listener, drag/throw wiring |
| features/kyle/pet/KiboBody.jsx | All CSS @keyframes animations + SVG layer rendering |
| features/kyle/pet/KylePetBubble.jsx | Speech bubble + typewriter effect |
| features/kyle/pet/KiboParticles.jsx | GSAP confetti particle emitter (celebration) |
| features/kyle/pet/useKiboScrollPhysics.js | GSAP scroll lag/squash/stretch hook |
| features/kyle/pet/useKiboThrowPhysics.js | Velocity throw + wall bounce physics |
| features/kyle/pet/useKiboEyeTracking.js | Mouse-tracking eye follow |
| features/kyle/pet/useKylePetPosition.js | Drag position + pointer events |
| features/kyle/pet/useKiboVisibilityGuard.js | Safe-zone enforcement after resize/throw |
| features/kyle/pet/kylePetConfig.js | Central config (timeouts, focus tips, action toggles) |

---

## 1. DOM Layer Architecture

Three separated DOM layers prevent animation conflicts:

`
Position div (translate3d, z-index: 110)
  KylePetBubble
  button ref=buttonRef        <- GSAP celebration flip target
    div ref=scrollRef         <- GSAP scroll squash/stretch target
      KiboParticles           <- Particle emitter (absolute overlay)
      KiboBody ref=wrapperRef <- CSS @keyframes target
        img kibo_body.svg     <- Static body (z-index: 1)
        img kibo_eyes.svg     <- Animated eyes (z-index: 2)
`

GSAP inline transforms applied to scrollRef (scroll) and buttonRef (flip).
CSS @keyframes applied to wrapperRef.
These never share an element so they cannot conflict.

---

## 2. Visual State Machine

Priority cascade (highest wins):

`
isDragging            -> dragging
isBouncingState       -> bouncing
AskKyle thinking      -> thinking
forcedState           -> forcedState value
message exists        -> speaking
isSleeping            -> sleeping
isHovered             -> hovered
(default)             -> idle
`

Drop-shadow mapping on the button element:
- empathetic: amber rgba(245,158,11,0.6) — unique warm glow
- hovered/dragging: cyan rgba(6,182,212,0.3)
- idle: subtle black rgba(0,0,0,0.1)

---

## 3. CSS Animations (all defined inline in KiboBody.jsx)

### .kibo-idle
4s vertical float with subtle breathing scaleX/scaleY.
Eyes: slow horizontal drift (kibo-eye-idle) + blink every 4s (kibo-blink).
Blink delay randomised per mount: CSS var --blink-delay set to 0-3s random.

### .kibo-hovered
Cancels float. Scales up to 1.06. Eyes perk up and blink faster.

### .kibo-dragging
Tilts -5deg, scales down to 0.97. Eyes sag downward (gravity feel).

### .kibo-bouncing
scaleX: 1.05, scaleY: 0.95 — impact compression squash.
Eyes sag 4px down.

### .kibo-thinking
Slow float at 3s cycle. Eyes float upward repeatedly (kibo-eye-think).

### .kibo-speaking
Standard float. Eyes pulse up rhythmically with slower blink.

### .kibo-celebrating (CSS layer)
Alternating translateY(-12px) rotate(3deg) scale(1.05) at 0.5s.
Eyes scale up and float.
PLUS: GSAP on buttonRef fires 360deg rotateY flip + y:-40 yoyo bounce.

### .kibo-empathetic
4s slow deep breathing: translateY 2px->6px with slight scale shifts.
Eyes: heavy drooped movement matching the breath cycle.
Amber drop-shadow on outer button.
Duration: stays active 12 seconds after trigger.

### .kibo-angry
Rapid 0.3s horizontal shake (kibo-shake: translateX +-2px rotate +-1deg).
Eyes squash flat: scaleY 0.4 translateY 4px.

### .kibo-sad
Body sinks: translateY 8px with 0.5s ease.
Eyes shrink to 0.9 scale, dim to opacity 0.7.

### .kibo-sleeping
Slow 5s rocking (kibo-sleep-bob: translateY 0->4px rotate -1->1deg).
Eyes dim to opacity 0.3.

---

## 4. Eye Tracking (useKiboEyeTracking)

Active when visualState is idle or hovered, and not dragging.
Eyes follow mouse cursor in real time via JS-driven transform.
.tracking-active class added to wrapper to suppress CSS idle-drift animation (prevents fighting).

---

## 5. Scroll Physics (useKiboScrollPhysics.js)

Mechanism: window capture-phase scroll listener (passive: true).
Capture phase catches scroll from any nested container — lesson panels, roadmap sidebars, etc.

Container switch guard:
If user scrolls a different element, lastScrollTarget resets the baseline velocity.
Prevents sudden delta jumps when switching between scroll areas.

Velocity accumulation each event:
  scrollVelocity += dy * 0.4
  Clamped to [-50, +50]

DEADZONE: animation only fires if Math.abs(scrollVelocity) > 15.
Slow casual reads produce zero jitter.

On scroll active (GSAP, duration 0.15s, ease power1.out):
  y: -scrollVelocity * 0.6       <- body lags behind scroll direction
  scaleY: 1 + |v| * 0.003        <- vertical stretch
  scaleX: 1 - |v| * 0.001        <- horizontal squash

100ms after scroll stops (GSAP, duration 0.8s, ease elastic.out(1, 0.5)):
  y: 0, scaleY: 1, scaleX: 1    <- springs back with boing snap

---

## 6. Throw and Bounce (useKiboThrowPhysics.js)

During drag: recordDragPoint(x, y) stores rolling history of pointer positions.
On pointerUp: startThrow() calculates exit velocity from last N samples.

If velocity sufficient, enters rAF physics loop:
  position += velocity each frame
  Wall hit: negate velocity component * restitution coefficient (bounce dampening)
  Loop ends when velocity < minimum threshold
  Kibo enters bouncing visualState during this flight

---

## 7. Speech Bubble (KylePetBubble.jsx)

### Spatial flipping
isLeftAligned = currentPosition.x < window.innerWidth / 2

Left half of screen  -> bubble appears on RIGHT, CSS tail points left
Right half of screen -> bubble appears on LEFT,  CSS tail points right

Tail is the CSS before: pseudo-element on the bubble container.

### Typewriter effect (useEffect on visualState + message)

Thinking mode: cycles frames at 500ms interval
  frames = [pipe, .pipe, ..pipe, ...pipe]  <- blinking ellipsis cursor

Message mode: reveals message at 40ms per character
  Appends trailing pipe cursor until final character reached.

### Text color by state
  thinking   -> text-cyan-600, tracking-widest, text-lg
  angry      -> text-red-500, tracking-tight
  empathetic -> text-amber-600, tracking-tight
  default    -> text-slate-700, tracking-tight, text-sm

Border: amber-100 for empathetic, cyan-100 for all others.

---

## 8. Particle Emitter (KiboParticles.jsx)

Active when visualState === celebrate.
Dynamically creates 20 DOM div particles inside containerRef.

Colors: #06b6d4 (cyan), #3b82f6 (blue), #10b981 (emerald), #f59e0b (amber), #8b5cf6 (purple)
Each particle: w-3 h-3 rounded-full blur-1px opacity-0 initially

GSAP timeline:
  Step 1 — explosion (all at t=0, duration 0.8-1.2s, ease power3.out):
    angle = (i / 20) * PI * 2       <- evenly distributed directions
    radius = 60 + random * 80       <- 60 to 140px from center
    ty -= 40                        <- upward bias so particles fly up not down
    random rotation 0-360deg
    random scale 0.5 to 2.0
  Step 2 — fade out (offset -0.2s from end of step 1, duration 0.5s):
    opacity -> 0, continue drifting down by 40px

Cleanup: timeline killed and container cleared on unmount or active=false.

---

## 9. Click Behavior (Context-Aware Routing)

getKyleRouteContext(pathname) detects page type:

  /quiz or /assignment or data-kibo-exam-mode=true:
    forcedState -> angry
    message -> I cant help you now during a test!
    auto-clears after 4 seconds

  /lesson or /video or /interactive-overviews:
    message -> Use the lesson Ask Kibo tab for this concept-specific question.
    auto-closes after kylePetConfig.bubble.autoCloseMs

  /roadmaps or /home or default:
    Opens global Ask Kyle drawer (openAskKyle)

Note: click is suppressed if hasMovedBeyondClickThreshold or isBouncing.current is true.

---

## 10. Sleep and Inactivity

Monitored events: keydown, pointerdown, touchstart, scroll, wheel
All events reset a timeout via resetSleepTimer().
After kylePetConfig.inactivity.sleepingAfterMs of silence -> isSleeping = true.
Any interaction wakes Kibo immediately.

---

## 11. Visibility and Blocking Rules

Hidden (stored in localStorage):
  Kibo renders as a small Restore Kibo button at bottom-right instead.
  Clicking it removes the localStorage flag and re-shows Kibo.

Blocked routes (returns null):
  /home/onboarding
  /auth/

Visibility guard (useKiboVisibilityGuard):
  After resize or extreme throw, snaps position back to nearest safe coordinate.

Ask Kyle open:
  pointer-events: none applied to the entire Kibo wrapper.
  Prevents Kibo intercepting mouse events while the drawer is active.

---

## 12. Global Event API

Any component anywhere fires CustomEvents on window to drive Kibo:

  window.dispatchEvent(new CustomEvent(kyle-pet-state, {
    detail: {
      state: empathetic,
      action: say,
      message: Take a breath you are doing great.,
      duration: 12000
    }
  }));

Supported fields:
  state    — sets forcedState (thinking, celebrate, sad, angry, empathetic)
  action   — say: open bubble with message | clear: reset to idle immediately
  message  — text content for the bubble (required when action=say)
  duration — auto-clears forcedState after N milliseconds

action=clear is the critical failsafe.
Used in KyleQuizModal catch block to prevent Kibo getting stuck in thinking if API fails.
