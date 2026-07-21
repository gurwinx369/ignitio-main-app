// POST /api/v2/kyle/assignment/submit
// Scores the user's written response and persists the result.
//
// Attempt rules:
//   - Pass on any attempt → locked immediately, no further submissions.
//   - Fail up to 3 times → locked for 6 hours, then 3 fresh attempts open again.
//   - After a 6-hour cooldown, attemptCount resets to 0; full attempt history is preserved.
//
// Next.js owns: auth, MongoDB reads/writes, attempt counting, cooldown, pass/lock rules.
// FastAPI owns: AI scoring only (POST /api/v1/assignment/score).

import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyFirebaseToken } from "@/lib/auth";
import connectToDB from "@/dbConfig/dbConnection";
import { KyleHistory } from "@/models/v2/kyle.history.model";
import { UserProfile } from "@/models/v2/user.profile.model";
import { callKyleFastApi, KyleFastApiError } from "@/features/kyle/server/kyle-fastapi.client";

const LevelSchema = z.object({
  concept: z.string().min(1),
  transcript: z.string().min(1),
});

const BodySchema = z.object({
  role: z.enum(["student", "developer", "writer", "designer", "other"]),
  dayNumber: z.number().int().positive(),
  levels: z.array(LevelSchema).min(1),
  assignmentPrompt: z.string().min(1),
  userResponse: z.string().min(1),
});

// ---------------------------------------------------------------------------
// FastAPI response schema (snake_case from upstream)
// ---------------------------------------------------------------------------

const FastApiScoreSchema = z.object({
  score: z.number().int().min(0).max(10),
  feedback: z.string().min(1),
  passed: z.boolean(),
  breakdown: z.object({
    topic_relevance: z.number().int().min(0).max(3),
    concept_application: z.number().int().min(0).max(3),
    prompt_quality: z.number().int().min(0).max(2),
    role_aptitude: z.number().int().min(0).max(2),
  }),
  weaknesses: z.array(z.string()),
});

const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

export async function POST(request) {
  // 1. Verify Firebase ID token.
  const { decodedToken, error, status } = await verifyFirebaseToken(request);
  if (error) return NextResponse.json({ error }, { status });

  // 2. Parse request body — preserves existing 400 behavior.
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // 3. Validate browser payload — preserves existing 422 behavior.
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    const issues = parsed.error.issues || parsed.error.errors || [];
    const first = issues[0];
    return NextResponse.json(
      {
        error: first?.message || "Validation failed",
        field: first?.path ? first.path.join(".") : "",
      },
      { status: 422 }
    );
  }

  const { role, dayNumber, levels, assignmentPrompt, userResponse } = parsed.data;
  const { uid } = decodedToken;

  await connectToDB();

  try {
    const kyleHistory = await KyleHistory.findOne({ firebaseUID: uid }).lean();
    const existing = kyleHistory?.assignmentHistory?.find(
      (a) => a.dayNumber === dayNumber
    );

    // Gate: already passed — no further submissions allowed.
    if (existing?.passed) {
      return NextResponse.json(
        { error: "You already passed this day's assignment" },
        { status: 423 }
      );
    }

    // Gate: locked — check whether the 6-hour cooldown has expired.
    if (existing?.locked) {
      const cooldownExpired = Date.now() >= new Date(existing.lockedUntil).getTime();

      if (!cooldownExpired) {
        return NextResponse.json(
          {
            error: "Assignment locked — please wait before retrying",
            lockedUntil: existing.lockedUntil,
          },
          { status: 423 }
        );
      }

      // Cooldown expired — reset local state only.
      // No MongoDB write here: if FastAPI scoring fails below, no attempt should
      // be consumed and no database mutation should occur.
      // The final update path already persists locked/lockedUntil/attemptCount
      // atomically together with the scored submission.
      existing.locked = false;
      existing.lockedUntil = null;
      existing.attemptCount = 0;
    }

    // 4. Call Kyle FastAPI for AI scoring.
    // No MongoDB write occurs if this call fails — attempts are not consumed.
    // Translate camelCase browser fields to snake_case FastAPI fields.
    let fastApiData;
    try {
      fastApiData = await callKyleFastApi({
        request,
        path: "/api/v1/assignment/score",
        body: {
          role,
          day_number: dayNumber,
          levels,
          assignment_prompt: assignmentPrompt,
          user_response: userResponse,
        },
      });
    } catch (err) {
      if (err instanceof KyleFastApiError) {
        console.error(
          "[POST /api/v2/kyle/assignment/submit] FastAPI error:",
          err.message,
          err.upstreamStatus != null ? `(upstream status: ${err.upstreamStatus})` : ""
        );
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      console.error("[POST /api/v2/kyle/assignment/submit] Unexpected scoring error:", err?.message);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }

    // 5. Validate FastAPI response shape before any MongoDB write.
    const validated = FastApiScoreSchema.safeParse(fastApiData);
    if (!validated.success) {
      console.error(
        "[POST /api/v2/kyle/assignment/submit] Invalid FastAPI score shape:",
        validated.error.issues
      );
      return NextResponse.json(
        { error: "Kyle AI returned an invalid assignment score" },
        { status: 502 }
      );
    }

    // 6. Extract validated fields.
    const { score, feedback, passed, breakdown: rawBreakdown, weaknesses } = validated.data;

    // Translate snake_case breakdown → camelCase for browser response.
    const breakdown = {
      topicRelevance: rawBreakdown.topic_relevance,
      conceptApplication: rawBreakdown.concept_application,
      promptQuality: rawBreakdown.prompt_quality,
      roleAptitude: rawBreakdown.role_aptitude,
    };

    // 7. Calculate attempt state and locking rules (unchanged business logic).
    const newAttemptCount = (existing?.attemptCount ?? 0) + 1;
    const isNowLocked = passed || newAttemptCount >= 3;
    // Only set a future lockedUntil on failure after exhausting all 3 attempts.
    const lockedUntil =
      !passed && newAttemptCount >= 3 ? new Date(Date.now() + SIX_HOURS_MS) : null;
    const attemptsRemaining = passed ? 0 : Math.max(0, 3 - newAttemptCount);

    const submission = { userResponse, score, feedback, passed, submittedAt: new Date() };

    // 8. Persist scored attempt to MongoDB.
    if (!existing) {
      // First ever submission for this day — create the assignment record.
      const history = await KyleHistory.findOneAndUpdate(
        { firebaseUID: uid },
        {
          $push: {
            assignmentHistory: {
              dayNumber,
              role,
              assignmentPrompt,
              attempts: [submission],
              attemptCount: 1,
              passed,
              locked: isNowLocked,
              lockedUntil,
            },
          },
          ...(passed ? { $inc: { assignmentsPassed: 1 } } : {}),
        },
        { upsert: true, new: true }
      );

      // Link KyleHistory to UserProfile on first ever record.
      await UserProfile.updateOne(
        { firebaseUID: uid, kyleHistory: null },
        { $set: { kyleHistory: history._id } }
      );
    } else {
      // Subsequent submission — append to the existing day's record.
      await KyleHistory.updateOne(
        { firebaseUID: uid, "assignmentHistory.dayNumber": dayNumber },
        {
          $push: { "assignmentHistory.$.attempts": submission },
          $set: {
            "assignmentHistory.$.passed": passed,
            "assignmentHistory.$.locked": isNowLocked,
            "assignmentHistory.$.lockedUntil": lockedUntil,
            "assignmentHistory.$.attemptCount": newAttemptCount,
          },
          ...(passed ? { $inc: { assignmentsPassed: 1 } } : {}),
        }
      );
    }

    // 9. Return existing browser contract (breakdown now camelCase).
    return NextResponse.json(
      { data: { score, feedback, passed, attemptsRemaining, lockedUntil, breakdown, weaknesses } },
      { status: 200 }
    );
  } catch (err) {
    console.error("[POST /api/v2/kyle/assignment/submit]", err.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
