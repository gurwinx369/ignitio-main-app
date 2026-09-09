export const RESULTS_ROUTE =
  "/home/onboarding/results";

export const PAYWALL_ROUTE =
  "/home/onboarding/paywall";

export const ROLE_SELECTION_ROUTE =
  "/home/onboarding/role-selection";

export const ACTIVATION_ROUTE =
  "/home/onboarding/activation";

export const HOME_ROUTE = "/home";

export const ONBOARDING_STEP_ROUTES =
  Object.freeze({
    results: RESULTS_ROUTE,
    paywall: PAYWALL_ROUTE,
    role_selection: ROLE_SELECTION_ROUTE,

    // Schedule currently belongs to the combined role/schedule flow.
    schedule: ROLE_SELECTION_ROUTE,

    activation_pending: ACTIVATION_ROUTE,
    completed: HOME_ROUTE,
  });