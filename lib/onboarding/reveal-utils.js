export const delay = (ms) => ({ "--d": `${ms}ms` });

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
