# Kibo AI: Developer Guide & Architecture Overview

> This document is a high-level conceptual guide for developers. It explains how Kibo's visual design, physics, and interaction rules are built so that anyone joining the project can understand how he works without needing to dig through complex math and CSS.

---

## 1. Core Philosophy: A Living AI, Not a UI Component

Kibo is designed to feel like a physical, weightless companion that lives in the user's workspace. Unlike standard chatbots, Kibo has mass, momentum, and emotional states.

To maintain the illusion that Kibo is "alive":
- **No Close Buttons:** Kibo's speech bubble doesn't have an "X". He dismisses himself when you click away, scroll, or just wait.
- **Physical Reactions:** He stretches when you scroll fast and bounces off walls if you throw him.
- **Context Awareness:** If you click him during a test, he gets angry. If you enter a new lesson, he greets you with a fun fact.

---

## 2. How the Animations Work (The 3-Layer System)

Making Kibo feel alive requires many different animations happening at the same time: he needs to float up and down, stretch when scrolling, and do backflips when celebrating.

If we applied all these animations to a single HTML element, they would fight each other and glitch out. To solve this, Kibo is built like an onion with three distinct layers:

1. **The Position Layer (Outer):** Moves him around the screen when you drag or throw him.
2. **The Physics Layer (Middle):** Powered by GSAP. This handles the "squash and stretch" effects when scrolling, and the 360-degree backflips when celebrating.
3. **The CSS Layer (Inner):** Powered by standard CSS. This handles his constant idle floating, his breathing, his eye blinking, and his facial expressions.

*Because these are separated, Kibo can stretch from a scroll while simultaneously breathing!*

---

## 3. Kibo's Emotional States

Kibo reacts to the user's progress by changing his "State". Each state completely alters his animation, his eye movements, and the color of his glowing drop-shadow.

*   **Idle / Hovered:** His default state. He gently floats, blinks, and his eyes follow your mouse cursor around the screen.
*   **Thinking:** When waiting for an API (like generating a quiz), his glowing shadow turns Cyan and he pulses softly.
*   **Celebrating:** When you pass a milestone (like 80% completion), he turns Green/Gold, does a rapid backflip, and shoots out confetti particles!
*   **Empathetic:** If you get a quiz question wrong, he turns a warm Amber color. His fast floating stops, and he switches to a slow, deep "breathing" animation to visually encourage you to take a breath and relax. He stays like this for 12 seconds to provide a soft landing.
*   **Angry / Sad:** He shakes rapidly (angry) or sinks down with dimmed eyes (sad) if you click him when you aren't supposed to (like during an exam).

---

## 4. The Physics Engine

Kibo acts like a tangible object on your screen.

### Drag, Throw, and Bounce
You can drag Kibo anywhere. The app tracks how fast your mouse is moving. If you let go while moving quickly, Kibo is physically "thrown" across the screen, carrying that momentum. If he hits the edge of your browser window, he bounces off the walls like a rubber ball, losing a bit of speed on each impact until he stops.

### Scroll Drag (Squash and Stretch)
When you scroll down a long page, the air resistance pushes against Kibo.
- He lags slightly behind the scroll direction.
- He physically stretches vertically and squashes horizontally depending on how fast you scroll.
- When you stop scrolling, he snaps back into a perfect circle with an elastic "boing" effect.
- **The Deadzone:** To prevent him from jittering annoyingly when you are slowly reading a paragraph, these extreme stretch effects only activate if you swipe or scroll very quickly.

---

## 5. The Speech Bubble & Typing

### Dynamic Positioning
Because you can throw Kibo anywhere, his speech bubble needs to be smart. If you drag Kibo to the left side of your screen, his bubble appears on his right. If you drag him to the right side, the bubble instantly flips over to his left. This ensures his text is never cut off by the edge of your monitor.

### The Retro Typewriter
Kibo's dialogue is delivered using a dynamic typewriter effect (spelling out words letter by letter) with a blinking cursor (`|`). The font is always monospaced, reinforcing the idea that he is an AI typing to you in real-time.

---

## 6. How to Talk to Kibo (The Global Event API)

We built Kibo so that **any component in the app** can easily command him to do things, without needing to pass complicated props down the React tree.

We use a simple `window.dispatchEvent` system. If a developer wants Kibo to say something from anywhere in the codebase, they just fire an event like this:

```javascript
window.dispatchEvent(new CustomEvent("kyle-pet-state", {
  detail: {
    state: "empathetic",             // Change his mood
    action: "say",                   // Tell him to open his bubble
    message: "Take a deep breath!",  // What he should type
    duration: 12000                  // Go back to normal after 12 seconds
  }
}));
```

