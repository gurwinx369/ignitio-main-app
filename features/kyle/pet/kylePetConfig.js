const defaultMessages = [
  "Hi, I’m Kyle. Need help staying focused?",
  "Small step. Clear mind. Keep going.",
  "Stuck? Break the topic into one tiny task.",
  "Focus mode: one concept at a time.",
  "You’re doing fine. Continue the next step.",
  "Need a hint? I’m around.",
  "Don’t rush. Build consistency.",
  "One roadmap step is still progress.",
];

export const kylePetConfig = {
  storageKeys: {
    position: "ignitio:kyle-pet-position",
    hidden: "ignitio:kyle-pet-hidden",
  },

  states: {
    idle: "/kyle/kyle-idle.webp",
    hovered: "/kyle/kyle-hovered.webp",
    dragging: "/kyle/kyle-dragging.webp",
    thinking: "/kyle/kyle-thinking.webp",
    speaking: "/kyle/kyle-speaking.webp",
    celebrating: "/kyle/kyle-celebrating.webp",
    sleeping: "/kyle/kyle-sleeping.webp",
  },

  size: {
    desktop: 88,
    mobile: 64,
  },

  breakpoint: {
    mobileMaxWidth: 768,
  },

  defaultPosition: {
    desktop: {
      xOffsetFromRight: 32,
      yOffsetFromBottom: 32,
    },
    mobile: {
      xOffsetFromRight: 20,
      yOffsetFromBottom: 84,
    },
  },

  drag: {
    clickThresholdPx: 6,
    viewportPaddingPx: 12,
    mobileSafeBottomPaddingPx: 110,
  },

  bubble: {
    autoCloseMs: 4500,
  },

  inactivity: {
    sleepingAfterMs: 120000,
  },

  routeMessages: {
    dashboard: [
      "Pick one roadmap and continue from your last step.",
      "Choose one skill today. Small progress compounds.",
      "Your next step matters more than perfect planning.",
    ],
    roadmap: [
      "Complete one lesson before switching topics.",
      "Follow the roadmap step by step. Don’t skip the foundation.",
      "One clear concept is better than five rushed ones.",
    ],
    lesson: [
      "Watch actively. Pause and write one key point.",
      "If a concept feels hard, break it into smaller parts.",
      "Focus on understanding, not just finishing the video.",
    ],
    quiz: [
      "Read the question slowly. Eliminate wrong options first.",
      "Think before selecting. Speed is not the goal.",
      "Use the quiz to find weak spots, not to judge yourself.",
    ],
    assignment: [
      "Write your answer first. I can help you improve it after.",
      "A rough attempt is better than a blank page.",
      "Explain it in your own words before polishing.",
    ],
    default: defaultMessages,
  },

  focusTips: [
    "Set a 20-minute focus block and finish one small task.",
    "Close extra tabs and keep only this lesson open.",
    "Write one question before starting the next step.",
    "Do not switch roadmaps right now. Finish the current step first.",
    "If stuck, define exactly what you do not understand.",
  ],

  actions: {
    focusTip: {
      label: "Focus Tip",
      enabled: true,
    },
    askKyle: {
      label: "Ask Kyle",
      enabled: true,
    },
    resetPosition: {
      label: "Reset Position",
      enabled: true,
    },
    hideKyle: {
      label: "Hide Kyle",
      enabled: true,
    },
  },

  preloadStates: ["hovered", "dragging", "speaking", "sleeping", "thinking", "celebrating"],
  
  restoreButton: {
    positionClassName: "bottom-24 right-4 sm:bottom-4 sm:right-4",
    zIndexClassName: "z-[50]",
    label: "Show Kyle",
  },
};
