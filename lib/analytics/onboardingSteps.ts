// lib/analytics/onboardingSteps.ts
// Single source of truth for the Onboarding Funnel steps as defined in PostHog Implementation Spec.

export const ONBOARDING_STEPS = [
  'welcome',
  'diagnostic_intro',
  'diagnostic_skill_check', // append _{index} at call time
  'roadmap_loading',
  'roadmap_reveal',
  'paywall',
  'payment',
  'signup',
  'first_lesson_start',
  'first_lesson_completed',
] as const;

export type OnboardingStep = typeof ONBOARDING_STEPS[number];

export const STEP_INDEX_MAP: Record<string, number> = {
  welcome: 1,
  diagnostic_intro: 2,
  diagnostic_skill_check: 3,
  roadmap_loading: 4,
  roadmap_reveal: 5,
  paywall: 6,
  payment: 7,
  signup: 8,
  first_lesson_start: 9,
  first_lesson_completed: 10,
};

export function getStepIndex(stepId: string): number {
  if (stepId.startsWith('diagnostic_skill_check')) {
    return STEP_INDEX_MAP.diagnostic_skill_check;
  }
  return STEP_INDEX_MAP[stepId] ?? 0;
}
