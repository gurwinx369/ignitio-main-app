// Canonical V4 onboarding route map.
// The Paywall reads nextStep from the server and maps it to a local route.
// Never navigate to arbitrary server-returned URLs.
export const ONBOARDING_ROUTES = {
  diagnostic: "/home/onboarding/diagnostic",
  results: "/home/onboarding/results",
  paywall: "/home/onboarding/paywall",
  role_selection: "/home/onboarding/role-selection",
  activation_pending: "/home/onboarding/activation",
  completed: "/home",
};
