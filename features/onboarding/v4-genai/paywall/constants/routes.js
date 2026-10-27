// Canonical V4 onboarding route map.
// The Paywall reads nextStep from the server and maps it to a local route.
// Never navigate to arbitrary server-returned URLs.
export const ONBOARDING_ROUTES = {
  diagnostic: "/onboarding/diagnostic",
  results: "/onboarding/results",
  paywall: "/onboarding/paywall",
  role_selection: "/onboarding/role-selection",
  activation_pending: "/onboarding/streak",
  completed: "/home",
};
