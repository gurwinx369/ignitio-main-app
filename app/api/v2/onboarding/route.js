import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyFirebaseToken } from "@/lib/auth";
import { runOnboarding } from "@/lib/onboarding/onboarding.service";
import { error } from "three/src/utils.js";

// ─── Constants ───────────────────────────────────────────────────────────────

const SKIP_MARKER = "__skipped__";
const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

// ─── Zod Schema ──────────────────────────────────────────────────────────────
//
// Design decisions:
//   - q1 is always required — it's the routing gate.
//   - q2–q8 are optional strings; absent means not asked (frontend ensures
//     this is correct per routing path).
//   - Skip marker "__skipped__" is a valid value — it signals the user was
//     fast-tracked past that question. The grader treats it as skipped,
//     not as a failed attempt.
//   - Q9 (time budget) is NOT collected — replaced by the schedule block.
//   - q10 (goal) is always required — it affects Kyle's voice.
//   - schedule is always required — habit-forming is core to the product.

const ScheduleSchema = z.object({
  timezone: z.string().min(1, "Timezone is required"),
  period: z.enum(["MORNING", "NOON", "EVENING", "NIGHT"]),
  startTime: z.string().regex(TIME_REGEX, "startTime must be HH:MM (24-hour)"),
  endTime: z.string().regex(TIME_REGEX, "endTime must be HH:MM (24-hour)"),
});

// A field that is either a non-empty string answer or the skip marker
const answerOrSkip = z.string().min(1).optional();

// Q6 is an ordered array of step labels (from drag-and-drop UI)
const q6Schema = z
  .union([z.array(z.string().min(1)).length(5), z.literal(SKIP_MARKER)])
  .optional();

const OnboardingBodySchema = z.object({
  roadmapSlug: z.string().min(1).toLowerCase().trim(),

  // Q1 — Entry point triage (always required)
  q1: z.enum([
    "never_touched_llm",
    "casual_chatgpt_user",
    "called_api_before",
    "shipped_rag_or_agent",
  ]),

  // Q2 — Prompt engineering (skip marker if fast-tracked or unanswered)
  q2: answerOrSkip,
  q2b: answerOrSkip,

  // Q3 — Python fundamentals
  q3: answerOrSkip,
  q3b: answerOrSkip,

  // Q4 — LangChain / LCEL
  q4: answerOrSkip,

  // Q5 — Embeddings
  q5: answerOrSkip,

  // Q6 — RAG pipeline order (array or skip marker)
  q6: q6Schema,

  // Q7 — FastAPI + async
  q7: answerOrSkip,
  q7b: answerOrSkip,

  // Q8 — Agents / LangGraph
  q8: answerOrSkip,

  // Q10 — Goal (always required, affects voice/tone)
  q10: z.enum(["internship_1_3_months", "build_product", "curiosity_general"]),

  // Schedule — always required
  schedule: ScheduleSchema,
});

// ─── Route validation helper ─────────────────────────────────────────────────

/**
 * Validate that the startTime is before the endTime.
 * Returns an error string or null.
 */
function validateScheduleTimes(schedule) {
  const [sh, sm] = schedule.startTime.split(":").map(Number);
  const [eh, em] = schedule.endTime.split(":").map(Number);
  const startMins = sh * 60 + sm;
  const endMins = eh * 60 + em;
  if (endMins <= startMins) {
    return "schedule.endTime must be after schedule.startTime";
  }
  return null;
}

// ─── POST /api/v2/onboarding ─────────────────────────────────────────────────
//
// Flow:
//   1. Verify Firebase token
//   2. Parse + Zod-validate body
//   3. Cross-field validation (time range)
//   4. Delegate to onboarding.service.runOnboarding()
//   5. Return clean response

export async function POST(request) {
  // Step 1: Auth first — never parse the body if auth fails
  const {
    decodedToken,
    error: authError,
    status: authStatus,
  } = await verifyFirebaseToken(request);

  if (authError) {
    return NextResponse.json({ message: authError }, { status: authStatus });
  }

  // Step 2: Parse body
  let rawBody;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid JSON in request body" },
      { status: 400 },
    );
  }

  // Step 3: Zod validation
  const validation = OnboardingBodySchema.safeParse(rawBody);
  if (!validation.success) {
    const issues = validation.error.issues ?? [];
    const first = issues[0];
    return NextResponse.json(
      {
        message: "Validation failed and required field missing",
        requiredField: first?.path?.join(".") ?? "",
        detail: first?.message ?? "Invalid request body",
      },
      { status: 422 },
    );
  }

  const body = validation.data;

  // Step 4: Cross-field validation
  const timeError = validateScheduleTimes(body.schedule);
  if (timeError) {
    return NextResponse.json(
      { message: "Validation failed", field: "schedule", detail: timeError },
      { status: 422 },
    );
  }

  // Step 5: Run onboarding
  let result;
  try {
    result = await runOnboarding({
      firebaseUID: decodedToken.uid,
      body,
    });
  } catch (err) {
    console.error("[POST /api/v2/onboarding] Unexpected error:\n", err.name);
    return NextResponse.json(
      { message: "Internal server error", error: err.message },
      { status: 500 },
    );
  }

  // Step 6: Map service result to HTTP response
  if (result.error === "User profile not found") {
    return NextResponse.json({ message: result.error }, { status: 404 });
  }

  if (result.error === "already_onboarded") {
    return NextResponse.json(
      {
        message: "Onboarding already completed",
        personalizationId: result.personalizationId,
      },
      { status: 409 },
    );
  }

  if (result.error) {
    // Template not found or other service-level error
    return NextResponse.json(
      { message: result.error },
      { status: result.status ?? 500 },
    );
  }

  return NextResponse.json(
    {
      success: true,
      personalizationId: result.personalizationId,
      roadmapSlug: result.roadmapSlug,
      totalLevels: result.totalLevels,
      totalLevelsSaved: result.totalLevelsSaved,
      skippedDays: result.skippedDays,
      optionalDays: result.optionalDays,
      includedDays: result.includedDays,
      skipReasons: result.skipReasons,
    },
    { status: 201 },
  );
}
