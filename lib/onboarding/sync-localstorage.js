/**
 * syncOnboardingFromLocalStorage
 *
 * Central helper — reads every onboarding localStorage key and flushes them
 * to the backend in the correct order.
 *
 * Call once, at the first authenticated submission gate (RoleScheduleController).
 * All callers pass an idToken; this function owns the fetch calls.
 *
 * Payload structure:
 *   1. Global onboarding (ignitio:onboarding_result)
 *      → PATCH /api/v2/user  { goal }
 *      (role/schedule are sent separately by RoleScheduleController)
 *
 *   2. GenAI diagnostic (genai_preview_assessment)
 *      → POST /api/v2/onboarding/diagnostic  { ...diagnosticPayload }
 *      → POST /api/v2/onboarding/results/continue  (advances onboarding state)
 *
 * Keys cleared on success:
 *   - ignitio:onboarding_result
 *   - ignitio:free_onboarding_v1
 *   - ignitio:genai_entry
 *   - genai_preview_assessment
 *
 * Returns { goalSynced, diagnosticSynced } — callers may log/use for UX.
 */

const LS_ONBOARDING_RESULT = "ignitio:onboarding_result";
const LS_FREE_ONBOARDING   = "ignitio:free_onboarding_v1";
const LS_GENAI_ENTRY       = "ignitio:genai_entry";
const LS_GENAI_ASSESSMENT  = "genai_preview_assessment";

function readJSON(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function clearKeys(...keys) {
  for (const key of keys) {
    try { localStorage.removeItem(key); } catch { /* ignore */ }
  }
}

// Map free-path goal values → UserProfile.goal enum
const GOAL_MAP = {
  internship: "internship_1_3_months",
  job:        "internship_1_3_months",
  gen_ai:     "curiosity_general",
  learn:      "curiosity_general",
  build:      "build_product",
};

function mapGoal(rawGoal) {
  return GOAL_MAP[rawGoal] ?? "curiosity_general";
}

/**
 * @param {string} idToken  Firebase ID token for the current user
 * @returns {Promise<{ goalSynced: boolean, diagnosticSynced: boolean }>}
 */
export async function syncOnboardingFromLocalStorage(idToken) {
  let goalSynced       = false;
  let diagnosticSynced = false;

  // ── 1. Global onboarding result (goal from free-path) ──────────────────────
  const onboardingResult = readJSON(LS_ONBOARDING_RESULT);
  const genaiEntry       = readJSON(LS_GENAI_ENTRY);

  // Prefer ignitio:onboarding_result; fall back to ignitio:genai_entry
  const rawGoal = onboardingResult?.goal ?? genaiEntry?.goal ?? null;

  if (rawGoal) {
    try {
      const res = await fetch("/api/v2/user", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ goal: mapGoal(rawGoal) }),
      });
      if (res.ok) {
        goalSynced = true;
        clearKeys(LS_ONBOARDING_RESULT, LS_FREE_ONBOARDING, LS_GENAI_ENTRY);
      }
    } catch {
      // Non-fatal — goal stays in LS, will retry next time
    }
  } else {
    // Nothing to sync — clear stale free-path keys if they exist
    clearKeys(LS_ONBOARDING_RESULT, LS_FREE_ONBOARDING, LS_GENAI_ENTRY);
  }

  // ── 2. GenAI diagnostic (preview assessment) ───────────────────────────────
  const diagnosticPayload = readJSON(LS_GENAI_ASSESSMENT);

  if (diagnosticPayload) {
    try {
      const diagRes = await fetch("/api/v2/onboarding/diagnostic", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(diagnosticPayload),
      });

      const diagData = await diagRes.json().catch(() => ({}));

      if (diagRes.ok && diagData.success) {
        // Advance onboarding state: results → paywall
        await fetch("/api/v2/onboarding/results/continue", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
        }).catch(() => null); // silent fallback — paywall reconciles on mount

        diagnosticSynced = true;
        clearKeys(LS_GENAI_ASSESSMENT);
      }
    } catch {
      // Non-fatal — diagnostic stays in LS, will retry on next submit
    }
  }

  return { goalSynced, diagnosticSynced };
}
